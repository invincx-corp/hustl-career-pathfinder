// Error handling and logging system
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  API = 'API',
  DATABASE = 'DATABASE',
  AI = 'AI',
  REALTIME = 'REALTIME',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];
  private maxErrors = 100;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Log error
  public logError(error: Partial<AppError>): void {
    const appError: AppError = {
      type: error.type || ErrorType.UNKNOWN,
      severity: error.severity || ErrorSeverity.MEDIUM,
      message: error.message || 'Unknown error occurred',
      code: error.code,
      details: error.details,
      timestamp: new Date(),
      userId: error.userId,
      context: error.context
    };

    this.errors.unshift(appError);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', appError);
    }

    // Send to external logging service in production
    if (import.meta.env.PROD) {
      this.sendToExternalLogger(appError);
    }
  }

  // Handle different types of errors
  public handleNetworkError(error: any, context?: string): void {
    this.logError({
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: `Network error: ${error.message}`,
      details: { originalError: error },
      context
    });
  }

  public handleAuthError(error: any, context?: string): void {
    this.logError({
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: `Authentication error: ${error.message}`,
      details: { originalError: error },
      context
    });
  }

  public handleValidationError(error: any, context?: string): void {
    this.logError({
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message: `Validation error: ${error.message}`,
      details: { originalError: error },
      context
    });
  }

  public handleAPIError(error: any, context?: string): void {
    this.logError({
      type: ErrorType.API,
      severity: ErrorSeverity.MEDIUM,
      message: `API error: ${error.message}`,
      details: { originalError: error },
      context
    });
  }

  public handleDatabaseError(error: any, context?: string): void {
    this.logError({
      type: ErrorType.DATABASE,
      severity: ErrorSeverity.HIGH,
      message: `Database error: ${error.message}`,
      details: { originalError: error },
      context
    });
  }

  public handleAIError(error: any, context?: string): void {
    this.logError({
      type: ErrorType.AI,
      severity: ErrorSeverity.MEDIUM,
      message: `AI service error: ${error.message}`,
      details: { originalError: error },
      context
    });
  }

  public handleRealtimeError(error: any, context?: string): void {
    this.logError({
      type: ErrorType.REALTIME,
      severity: ErrorSeverity.MEDIUM,
      message: `Real-time error: ${error.message}`,
      details: { originalError: error },
      context
    });
  }

  // Get recent errors
  public getRecentErrors(limit: number = 10): AppError[] {
    return this.errors.slice(0, limit);
  }

  // Get errors by type
  public getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter(error => error.type === type);
  }

  // Get errors by severity
  public getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Clear errors
  public clearErrors(): void {
    this.errors = [];
  }

  // Get error statistics
  public getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentCount: number;
  } {
    const byType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = this.getErrorsByType(type).length;
      return acc;
    }, {} as Record<ErrorType, number>);

    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.getErrorsBySeverity(severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const recentCount = this.errors.filter(
      error => Date.now() - error.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      recentCount
    };
  }

  // Send to external logging service
  private async sendToExternalLogger(error: AppError): Promise<void> {
    try {
      // In a real application, this would send to a logging service like Sentry, LogRocket, etc.
      console.log('Sending error to external logger:', error);
    } catch (err) {
      console.error('Failed to send error to external logger:', err);
    }
  }

  // Create user-friendly error messages
  public getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Connection problem. Please check your internet connection and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Authentication failed. Please log in again.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.API:
        return 'Service temporarily unavailable. Please try again later.';
      case ErrorType.DATABASE:
        return 'Data service error. Please try again later.';
      case ErrorType.AI:
        return 'AI service temporarily unavailable. Please try again later.';
      case ErrorType.REALTIME:
        return 'Real-time connection lost. Reconnecting...';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
export default errorHandler;
