// Lightweight client-side logger to replace Winston for better bundle size
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

export enum LogCategory {
  DATABASE = 'DATABASE',
  USER_INTERACTION = 'USER_INTERACTION',
  NAVIGATION = 'NAVIGATION',
  PERFORMANCE = 'PERFORMANCE',
  ERROR = 'ERROR',
  FEATURE = 'FEATURE',
  AUTH = 'AUTH'
}

export interface LogEntry {
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

// Lightweight logger class - replaces Winston for smaller bundle
class LightweightLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private userId: string | null = null;
  private sessionId: string;
  private isProduction = import.meta.env.PROD;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeFromStorage();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeFromStorage() {
    try {
      const storedLogs = localStorage.getItem('gym_tracker_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs).slice(-this.maxLogs);
      }
    } catch (error) {
      console.warn('Failed to load logs from storage:', error);
    }
  }

  private persistToStorage() {
    try {
      localStorage.setItem('gym_tracker_logs', JSON.stringify(this.logs.slice(-this.maxLogs)));
    } catch (error) {
      if (!this.isProduction) {
        console.warn('Failed to persist logs to storage:', error);
      }
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only recent logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    this.persistToStorage();

    // Only log to console in development
    if (!this.isProduction) {
      const consoleMethod = entry.level === LogLevel.ERROR ? 'error' :
                           entry.level === LogLevel.WARN ? 'warn' :
                           entry.level === LogLevel.DEBUG ? 'debug' : 'log';
      
      console[consoleMethod](`[${entry.category}] ${entry.action}:`, entry.message, entry.details || '');
    }
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    action: string,
    message: string,
    details?: any,
    duration?: number
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      message,
      details,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      duration,
      metadata: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp_ms: Date.now()
      }
    };
  }

  // Public logging methods
  logError(error: Error | string, context?: string, details?: any) {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    
    this.addLog(this.createLogEntry(
      LogLevel.ERROR,
      LogCategory.ERROR,
      context || 'UNKNOWN_ERROR',
      message,
      { ...details, stack }
    ));
  }

  logWarning(category: LogCategory, action: string, message: string, details?: any) {
    this.addLog(this.createLogEntry(LogLevel.WARN, category, action, message, details));
  }

  logInfo(category: LogCategory, action: string, message: string, details?: any) {
    this.addLog(this.createLogEntry(LogLevel.INFO, category, action, message, details));
  }

  logDebug(category: LogCategory, action: string, message: string, details?: any) {
    if (!this.isProduction) { // Only log debug in development
      this.addLog(this.createLogEntry(LogLevel.DEBUG, category, action, message, details));
    }
  }

  logPerformance(action: string, duration: number, details?: any) {
    this.addLog(this.createLogEntry(
      LogLevel.INFO,
      LogCategory.PERFORMANCE,
      action,
      `Operation completed in ${duration}ms`,
      details,
      duration
    ));
  }

  logUserInteraction(action: string, element: string, details?: any) {
    this.addLog(this.createLogEntry(
      LogLevel.INFO,
      LogCategory.USER_INTERACTION,
      action,
      `User interacted with ${element}`,
      details
    ));
  }

  logNavigation(from: string, to: string, method: string, details?: any) {
    this.addLog(this.createLogEntry(
      LogLevel.INFO,
      LogCategory.NAVIGATION,
      'NAVIGATE',
      `Navigation from ${from} to ${to}`,
      { from, to, method, ...details }
    ));
  }

  logDatabaseOperation(
    operation: string,
    table: string,
    details?: any,
    duration?: number
  ) {
    this.addLog(this.createLogEntry(
      LogLevel.INFO,
      LogCategory.DATABASE,
      `DB_${operation.toUpperCase()}`,
      `${operation} operation on ${table}`,
      details,
      duration
    ));
  }

  // Utility methods
  setUserId(userId: string) {
    this.userId = userId;
  }

  clearUserId() {
    this.userId = null;
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('gym_tracker_logs');
  }

  exportLogs() {
    try {
      const logsData = {
        exported_at: new Date().toISOString(),
        session_id: this.sessionId,
        user_id: this.userId,
        logs: this.logs
      };

      const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      const exportFileDefaultName = `gym_tracker_logs_${new Date().toISOString().split('T')[0]}.json`;
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.style.display = 'none';
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);

      this.logInfo(LogCategory.USER_INTERACTION, 'EXPORT_LOGS', 'User exported logs', {
        logCount: this.logs.length,
        fileName: exportFileDefaultName
      });
    } catch (error) {
      this.logError(error as Error, 'EXPORT_LOGS');
    }
  }

  // Get log statistics
  getLogStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      timeRange: {
        oldest: this.logs.length > 0 ? this.logs[0].timestamp : null,
        newest: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null
      }
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const gymLogger = new LightweightLogger();

// Export types
export type { LogEntry as LightweightLogEntry };