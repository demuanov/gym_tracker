// Production-optimized logger that disables heavy features in production
import { LogLevel, LogCategory, LogEntry, gymLogger as fullLogger } from './lightweightLogger';

class ProductionLogger {
  private isProduction = import.meta.env.PROD;
  
  // In production, only log errors and critical info
  logError(error: Error | string, context?: string, details?: any) {
    fullLogger.logError(error, context, details);
  }

  // Reduced logging in production
  logWarning(category: LogCategory, action: string, message: string, details?: any) {
    if (!this.isProduction) {
      fullLogger.logWarning(category, action, message, details);
    }
  }

  logInfo(category: LogCategory, action: string, message: string, details?: any) {
    if (!this.isProduction) {
      fullLogger.logInfo(category, action, message, details);
    }
  }

  logDebug(category: LogCategory, action: string, message: string, details?: any) {
    // Never log debug in production
    if (!this.isProduction) {
      fullLogger.logDebug(category, action, message, details);
    }
  }

  // Always log performance metrics as they're useful
  logPerformance(action: string, duration: number, details?: any) {
    fullLogger.logPerformance(action, duration, details);
  }

  // Minimal user interaction logging in production
  logUserInteraction(action: string, element: string, details?: any) {
    if (!this.isProduction || this.isCriticalInteraction(action)) {
      fullLogger.logUserInteraction(action, element, details);
    }
  }

  // Always log navigation
  logNavigation(from: string, to: string, method: string, details?: any) {
    fullLogger.logNavigation(from, to, method, details);
  }

  // Always log database operations for debugging
  logDatabaseOperation(operation: string, table: string, details?: any, duration?: number) {
    fullLogger.logDatabaseOperation(operation, table, details, duration);
  }

  private isCriticalInteraction(action: string): boolean {
    const criticalActions = ['CLICK', 'FORM_SUBMIT', 'ERROR', 'NAVIGATION_CLICK'];
    return criticalActions.includes(action);
  }

  // Utility methods - delegate to full logger
  setUserId(userId: string) {
    fullLogger.setUserId(userId);
  }

  clearUserId() {
    fullLogger.clearUserId();
  }

  getLogs(): LogEntry[] {
    return fullLogger.getLogs();
  }

  clearLogs() {
    fullLogger.clearLogs();
  }

  exportLogs() {
    fullLogger.exportLogs();
  }

  getLogStats() {
    return fullLogger.getLogStats();
  }
}

// Export optimized logger
export const gymLogger = new ProductionLogger();
export { LogLevel, LogCategory };
export type { LogEntry };