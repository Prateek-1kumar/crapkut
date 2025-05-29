/**
 * Structured logging utility for the scraper application
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  component?: string;
  operation?: string;
  url?: string;
  attempt?: number;
  duration?: number;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.level = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const logMessage = this.formatMessage('ERROR', message, context);
    console.error(logMessage);
    
    if (error && this.isDevelopment) {
      console.error('Stack trace:', error.stack);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const logMessage = this.formatMessage('WARN', message, context);
    console.warn(logMessage);
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const logMessage = this.formatMessage('INFO', message, context);
    console.log(logMessage);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const logMessage = this.formatMessage('DEBUG', message, context);
    console.log(logMessage);
  }

  performance(operation: string, startTime: number, context?: LogContext): void {
    const duration = Date.now() - startTime;
    this.info(`Performance: ${operation} completed in ${duration}ms`, { 
      ...context, 
      operation, 
      duration
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export logger functions for convenience
export const { error, warn, info, debug, performance } = logger;
