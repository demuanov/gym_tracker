import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { gymLogger, LogCategory } from './optimizedLogger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the original Supabase client
const originalSupabase = createClient(supabaseUrl, supabaseKey);

// Performance timing utility
class PerformanceTimer {
  private startTime: number;
  
  constructor() {
    this.startTime = performance.now();
  }
  
  end(): number {
    return Math.round(performance.now() - this.startTime);
  }
}

// Enhanced Supabase client with comprehensive logging
export class LoggedSupabaseClient {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
    this.setupAuthLogging();
  }

  private setupAuthLogging() {
    // Log authentication events
    this.client.auth.onAuthStateChange((event, session) => {
      gymLogger.logInfo(
        LogCategory.AUTH,
        `AUTH_${event.toUpperCase()}`,
        `Authentication event: ${event}`,
        {
          event,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          sessionId: session?.access_token ? 'authenticated' : 'anonymous'
        }
      );

      // Set user ID in logger when user signs in
      if (event === 'SIGNED_IN' && session?.user?.id) {
        gymLogger.setUserId(session.user.id);
      }
    });
  }

  // Logged version of from() method
  from(table: string) {
    return {
      // SELECT operations
      select: (columns: string = '*') => {
        const selectTimer = new PerformanceTimer();
        
        gymLogger.logInfo(
          LogCategory.DATABASE,
          'DB_SELECT_START',
          `Starting SELECT on ${table}`,
          { table, columns }
        );

        const query = this.client.from(table).select(columns);
        
        // Override the query methods to add logging
        const originalQuery = query;
        
        return {
          ...originalQuery,
          
          // Log filters
          eq: (column: string, value: any) => {
            gymLogger.logDebug(
              LogCategory.DATABASE,
              'DB_FILTER_EQ',
              `Adding filter: ${column} = ${value}`,
              { table, column, value, operator: 'eq' }
            );
            return originalQuery.eq(column, value);
          },
          
          neq: (column: string, value: any) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_FILTER_NEQ', `Adding filter: ${column} != ${value}`, { table, column, value, operator: 'neq' });
            return originalQuery.neq(column, value);
          },
          
          gt: (column: string, value: any) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_FILTER_GT', `Adding filter: ${column} > ${value}`, { table, column, value, operator: 'gt' });
            return originalQuery.gt(column, value);
          },
          
          gte: (column: string, value: any) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_FILTER_GTE', `Adding filter: ${column} >= ${value}`, { table, column, value, operator: 'gte' });
            return originalQuery.gte(column, value);
          },
          
          lt: (column: string, value: any) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_FILTER_LT', `Adding filter: ${column} < ${value}`, { table, column, value, operator: 'lt' });
            return originalQuery.lt(column, value);
          },
          
          lte: (column: string, value: any) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_FILTER_LTE', `Adding filter: ${column} <= ${value}`, { table, column, value, operator: 'lte' });
            return originalQuery.lte(column, value);
          },
          
          like: (column: string, pattern: string) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_FILTER_LIKE', `Adding filter: ${column} LIKE ${pattern}`, { table, column, pattern, operator: 'like' });
            return originalQuery.like(column, pattern);
          },
          
          in: (column: string, values: any[]) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_FILTER_IN', `Adding filter: ${column} IN (...)`, { table, column, valueCount: values.length, operator: 'in' });
            return originalQuery.in(column, values);
          },
          
          order: (column: string, options?: { ascending?: boolean }) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_ORDER', `Adding order: ${column}`, { table, column, ascending: options?.ascending ?? true });
            return originalQuery.order(column, options);
          },
          
          limit: (count: number) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_LIMIT', `Adding limit: ${count}`, { table, limit: count });
            return originalQuery.limit(count);
          },
          
          range: (from: number, to: number) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_RANGE', `Adding range: ${from}-${to}`, { table, from, to });
            return originalQuery.range(from, to);
          },
          
          single: () => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_SINGLE', 'Expecting single result', { table });
            return originalQuery.single();
          },
          
          // Override the promise methods to log results
          then: (onfulfilled?: any, onrejected?: any) => {
            return originalQuery.then(
              (result) => {
                const duration = selectTimer.end();
                
                gymLogger.logDatabaseOperation(
                  'SELECT',
                  table,
                  {
                    success: !result.error,
                    columns,
                    resultCount: Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0,
                    error: result.error?.message,
                    errorCode: result.error?.code
                  },
                  duration
                );

                if (result.error) {
                  gymLogger.logError(
                    `Database SELECT error: ${result.error.message}`,
                    'DATABASE_SELECT',
                    { table, columns, error: result.error }
                  );
                }

                return onfulfilled ? onfulfilled(result) : result;
              },
              (error) => {
                const duration = selectTimer.end();
                
                gymLogger.logError(
                  `Database SELECT failed: ${error.message}`,
                  'DATABASE_SELECT',
                  { table, columns, duration, error }
                );

                return onrejected ? onrejected(error) : Promise.reject(error);
              }
            );
          }
        };
      },

      // INSERT operations
      insert: (data: any) => {
        const insertTimer = new PerformanceTimer();
        const recordCount = Array.isArray(data) ? data.length : 1;
        
        gymLogger.logInfo(
          LogCategory.DATABASE,
          'DB_INSERT_START',
          `Starting INSERT on ${table}`,
          { table, recordCount, dataPreview: this.sanitizeData(data) }
        );

        const query = this.client.from(table).insert(data);

        return {
          ...query,
          select: (columns?: string) => {
            if (columns) {
              gymLogger.logDebug(LogCategory.DATABASE, 'DB_INSERT_SELECT', `INSERT with SELECT: ${columns}`, { table, columns });
            }
            return query.select(columns);
          },
          
          single: () => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_INSERT_SINGLE', 'INSERT expecting single result', { table });
            return query.single();
          },

          then: (onfulfilled?: any, onrejected?: any) => {
            return query.then(
              (result) => {
                const duration = insertTimer.end();
                
                gymLogger.logDatabaseOperation(
                  'INSERT',
                  table,
                  {
                    success: !result.error,
                    recordCount,
                    insertedCount: Array.isArray(result.data) ? (result.data as any[]).length : result.data ? 1 : 0,
                    error: result.error?.message,
                    errorCode: result.error?.code
                  },
                  duration
                );

                if (result.error) {
                  gymLogger.logError(
                    `Database INSERT error: ${result.error.message}`,
                    'DATABASE_INSERT',
                    { table, recordCount, error: result.error }
                  );
                }

                return onfulfilled ? onfulfilled(result) : result;
              },
              (error) => {
                const duration = insertTimer.end();
                
                gymLogger.logError(
                  `Database INSERT failed: ${error.message}`,
                  'DATABASE_INSERT',
                  { table, recordCount, duration, error }
                );

                return onrejected ? onrejected(error) : Promise.reject(error);
              }
            );
          }
        };
      },

      // UPDATE operations
      update: (data: any) => {
        const updateTimer = new PerformanceTimer();
        
        gymLogger.logInfo(
          LogCategory.DATABASE,
          'DB_UPDATE_START',
          `Starting UPDATE on ${table}`,
          { table, dataPreview: this.sanitizeData(data) }
        );

        const query = this.client.from(table).update(data);

        return {
          ...query,
          
          eq: (column: string, value: any) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_UPDATE_FILTER', `UPDATE WHERE ${column} = ${value}`, { table, column, value });
            return query.eq(column, value);
          },
          
          select: (columns?: string) => {
            if (columns) {
              gymLogger.logDebug(LogCategory.DATABASE, 'DB_UPDATE_SELECT', `UPDATE with SELECT: ${columns}`, { table, columns });
            }
            return query.select(columns);
          },

          then: (onfulfilled?: any, onrejected?: any) => {
            return query.then(
              (result) => {
                const duration = updateTimer.end();
                
                gymLogger.logDatabaseOperation(
                  'UPDATE',
                  table,
                  {
                    success: !result.error,
                    updatedCount: Array.isArray(result.data) ? (result.data as any[]).length : result.data ? 1 : 0,
                    error: result.error?.message,
                    errorCode: result.error?.code
                  },
                  duration
                );

                if (result.error) {
                  gymLogger.logError(
                    `Database UPDATE error: ${result.error.message}`,
                    'DATABASE_UPDATE',
                    { table, error: result.error }
                  );
                }

                return onfulfilled ? onfulfilled(result) : result;
              },
              (error) => {
                const duration = updateTimer.end();
                
                gymLogger.logError(
                  `Database UPDATE failed: ${error.message}`,
                  'DATABASE_UPDATE',
                  { table, duration, error }
                );

                return onrejected ? onrejected(error) : Promise.reject(error);
              }
            );
          }
        };
      },

      // DELETE operations
      delete: () => {
        const deleteTimer = new PerformanceTimer();
        
        gymLogger.logInfo(
          LogCategory.DATABASE,
          'DB_DELETE_START',
          `Starting DELETE on ${table}`,
          { table }
        );

        const query = this.client.from(table).delete();

        return {
          ...query,
          
          eq: (column: string, value: any) => {
            gymLogger.logDebug(LogCategory.DATABASE, 'DB_DELETE_FILTER', `DELETE WHERE ${column} = ${value}`, { table, column, value });
            return query.eq(column, value);
          },

          then: (onfulfilled?: any, onrejected?: any) => {
            return query.then(
              (result) => {
                const duration = deleteTimer.end();
                
                gymLogger.logDatabaseOperation(
                  'DELETE',
                  table,
                  {
                    success: !result.error,
                    deletedCount: Array.isArray(result.data) ? (result.data as any[]).length : result.data ? 1 : 0,
                    error: result.error?.message,
                    errorCode: result.error?.code
                  },
                  duration
                );

                if (result.error) {
                  gymLogger.logError(
                    `Database DELETE error: ${result.error.message}`,
                    'DATABASE_DELETE',
                    { table, error: result.error }
                  );
                }

                return onfulfilled ? onfulfilled(result) : result;
              },
              (error) => {
                const duration = deleteTimer.end();
                
                gymLogger.logError(
                  `Database DELETE failed: ${error.message}`,
                  'DATABASE_DELETE',
                  { table, duration, error }
                );

                return onrejected ? onrejected(error) : Promise.reject(error);
              }
            );
          }
        };
      }
    };
  }

  // Expose auth for authentication operations
  get auth() {
    return this.client.auth;
  }

  // Expose other Supabase methods as needed
  get storage() {
    return this.client.storage;
  }

  get functions() {
    return this.client.functions;
  }

  get realtime() {
    return this.client.realtime;
  }

  // Utility to sanitize sensitive data in logs
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeObject(item, sensitiveFields));
    }
    
    return this.sanitizeObject(data, sensitiveFields);
  }

  private sanitizeObject(obj: any, sensitiveFields: string[]): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value, sensitiveFields);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Create and export the logged Supabase client
export const supabase = new LoggedSupabaseClient(originalSupabase);

// Also export the original client if needed for direct access
export const supabaseOriginal = originalSupabase;