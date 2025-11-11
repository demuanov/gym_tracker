import winston from 'winston';

// Log levels for different types of events
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

// Log categories for better organization
export enum LogCategory {
  DATABASE = 'DATABASE',
  USER_INTERACTION = 'USER_INTERACTION',
  NAVIGATION = 'NAVIGATION',
  PERFORMANCE = 'PERFORMANCE',
  AUTH = 'AUTH',
  ERROR = 'ERROR',
  API = 'API'
}

// Enhanced log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  message: string;
  details?: any;
  userId?: string;
  sessionId: string;
  userAgent?: string;
  url?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Custom transport for sending logs to external service (optional)
import Transport from 'winston-transport';

// Custom transport for sending logs to remote endpoint if needed
class RemoteLogTransport extends Transport {
  constructor(opts: any) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    // Here you could send logs to external service like LogRocket, Sentry, etc.
    // For now, we'll just store them locally
    this.storeLogLocally(info);
    callback();
  }

  private storeLogLocally(logEntry: any) {
    try {
      const logs = JSON.parse(localStorage.getItem('gym_tracker_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 1000 logs to prevent storage overflow
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('gym_tracker_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log locally:', error);
    }
  }
}

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, category, action, details }) => {
          const detailsStr = details ? JSON.stringify(details, null, 2) : '';
          return `${timestamp} [${level.toUpperCase()}] ${category}:${action} ${message} ${detailsStr}`;
        })
      )
    }),
    
    // Custom transport for local storage and remote logging
    new RemoteLogTransport({})
  ]
});

// Session ID for tracking user sessions
const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

class GymTrackerLogger {
  private userId?: string;

  constructor() {
    this.logInfo(LogCategory.PERFORMANCE, 'LOGGER_INITIALIZED', 'Logger service started', {
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.logInfo(LogCategory.AUTH, 'USER_SET', 'User ID set for logging', { userId });
  }

  // Database operation logging
  logDatabaseAction(action: string, table: string, details?: any, duration?: number) {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      LogCategory.DATABASE,
      `DB_${action.toUpperCase()}`,
      `${action} operation on ${table}`,
      {
        table,
        operation: action,
        duration,
        ...details
      }
    );
    
    logger.info(logEntry);
    this.trackPerformance(`db_${action}_${table}`, duration);
  }

  // User interaction logging
  logUserInteraction(action: string, element: string, details?: any) {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      LogCategory.USER_INTERACTION,
      `USER_${action.toUpperCase()}`,
      `User ${action} on ${element}`,
      {
        element,
        interaction: action,
        ...details
      }
    );
    
    logger.info(logEntry);
  }

  // Navigation logging
  logNavigation(from: string, to: string, method: string = 'click') {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      LogCategory.NAVIGATION,
      'NAV_CHANGE',
      `Navigation from ${from} to ${to}`,
      {
        from,
        to,
        method,
        url: window.location.href
      }
    );
    
    logger.info(logEntry);
  }

  // Performance logging
  logPerformance(metric: string, value: number, unit: string = 'ms') {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      LogCategory.PERFORMANCE,
      'PERFORMANCE_METRIC',
      `Performance: ${metric}`,
      {
        metric,
        value,
        unit,
        url: window.location.href
      }
    );
    
    logger.info(logEntry);
  }

  // Error logging
  logError(error: Error | string, context?: string, details?: any) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    const logEntry = this.createLogEntry(
      LogLevel.ERROR,
      LogCategory.ERROR,
      'ERROR_OCCURRED',
      errorMessage,
      {
        context,
        stack: errorStack,
        url: window.location.href,
        ...details
      }
    );
    
    logger.error(logEntry);
  }

  // Warning logging
  logWarning(message: string, details?: any) {
    const logEntry = this.createLogEntry(
      LogLevel.WARN,
      LogCategory.ERROR,
      'WARNING',
      message,
      details
    );
    
    logger.warn(logEntry);
  }

  // Info logging
  logInfo(category: LogCategory, action: string, message: string, details?: any) {
    const logEntry = this.createLogEntry(LogLevel.INFO, category, action, message, details);
    logger.info(logEntry);
  }

  // Debug logging
  logDebug(category: LogCategory, action: string, message: string, details?: any) {
    const logEntry = this.createLogEntry(LogLevel.DEBUG, category, action, message, details);
    logger.debug(logEntry);
  }

  // Get logs for debugging/export
  getLogs(limit: number = 100): LogEntry[] {
    try {
      const logs = JSON.parse(localStorage.getItem('gym_tracker_logs') || '[]');
      return logs.slice(-limit);
    } catch (error) {
      this.logError(error as Error, 'GET_LOGS');
      return [];
    }
  }

  // Export logs as JSON file
  exportLogs() {
    try {
      const logs = this.getLogs(1000);
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `gym_tracker_logs_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      this.logInfo(LogCategory.USER_INTERACTION, 'EXPORT_LOGS', 'User exported logs', {
        logCount: logs.length
      });
    } catch (error) {
      this.logError(error as Error, 'EXPORT_LOGS');
    }
  }

  // Clear logs
  clearLogs() {
    try {
      localStorage.removeItem('gym_tracker_logs');
      this.logInfo(LogCategory.USER_INTERACTION, 'CLEAR_LOGS', 'Logs cleared by user');
    } catch (error) {
      this.logError(error as Error, 'CLEAR_LOGS');
    }
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    action: string,
    message: string,
    details?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      message,
      details,
      userId: this.userId,
      sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        }
      }
    };
  }

  private trackPerformance(operation: string, duration?: number) {
    if (duration !== undefined) {
      // Track slow operations
      if (duration > 1000) { // More than 1 second
        this.logWarning(`Slow operation detected: ${operation}`, { duration });
      }
      
      // Store performance metrics
      const perfKey = `perf_${operation}`;
      const existing = JSON.parse(localStorage.getItem(perfKey) || '[]');
      existing.push({ timestamp: Date.now(), duration });
      
      // Keep only last 50 measurements
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }
      
      localStorage.setItem(perfKey, JSON.stringify(existing));
    }
  }
}

// Export singleton instance
export const gymLogger = new GymTrackerLogger();

// Export logger utilities (enums are already exported above)
export type { LogEntry };