import winston from 'winston';
import { appSettings, isDevelopment } from '@/config';

// Custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Development format with colors
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  customFormat
);

// Production format without colors
const productionFormat = customFormat;

// Create logger instance
export const logger = winston.createLogger({
  level: appSettings.logging.level,
  format: isDevelopment ? developmentFormat : productionFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test',
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    
    // File transport for combined logs
    new winston.transports.File({
      filename: appSettings.logging.file,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),

    // Dedicated security log file
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn', // Log security events (warn and error levels)
      maxsize: 10485760, // 10MB
      maxFiles: 15, // Keep more security logs
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// API request logger
export class ApiLogger {
  private static instance: ApiLogger;
  
  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  logRequest(request: Request, startTime: number = Date.now()) {
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'Unknown';

    logger.info('API Request', {
      method,
      path,
      query: Object.fromEntries(url.searchParams),
      userAgent,
      ip,
      timestamp: new Date(startTime).toISOString(),
    });
  }

  logResponse(request: Request, response: Response, startTime: number, error?: Error) {
    const duration = Date.now() - startTime;
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;
    const status = response.status;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'Unknown';

    const logData = {
      method,
      path,
      status,
      duration: `${duration}ms`,
      ip,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      logger.error('API Error', {
        ...logData,
        error: error.message,
        stack: error.stack,
      });
    } else if (status >= 500) {
      logger.error('API Server Error', logData);
    } else if (status >= 400) {
      logger.warn('API Client Error', logData);
    } else {
      logger.info('API Response', logData);
    }
  }

  logFileUpload(filename: string, fileSize: number, userId: string, success: boolean) {
    logger.info('File Upload', {
      filename,
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
      userId,
      success,
      timestamp: new Date().toISOString(),
    });
  }

  logAIGeneration(productName: string, userId: string, duration: number, tokensUsed?: number) {
    logger.info('AI Generation', {
      productName,
      userId,
      duration: `${duration}ms`,
      tokensUsed: tokensUsed || 'Unknown',
      timestamp: new Date().toISOString(),
    });
  }

  logAuthEvent(event: string, userId: string, success: boolean, ip?: string) {
    const logMethod = success ? logger.info : logger.warn;
    
    logMethod('Auth Event', {
      event,
      userId,
      success,
      ip: ip || 'Unknown',
      timestamp: new Date().toISOString(),
    });
  }

  logDatabaseQuery(query: string, duration: number, error?: Error) {
    if (error) {
      logger.error('Database Error', {
        query: query.substring(0, 100) + '...',
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } else if (duration > 1000) { // Log slow queries
      logger.warn('Slow Database Query', {
        query: query.substring(0, 100) + '...',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logSecurityEvent(event: string, ip: string, details?: any) {
    const securityEvent = {
      event,
      ip,
      details,
      timestamp: new Date().toISOString(),
      severity: this.getSecurityEventSeverity(event),
    };

    // Use different log levels based on severity
    switch (securityEvent.severity) {
      case 'critical':
        logger.error('CRITICAL Security Event', securityEvent);
        break;
      case 'high':
        logger.error('HIGH Security Event', securityEvent);
        break;
      case 'medium':
        logger.warn('MEDIUM Security Event', securityEvent);
        break;
      default:
        logger.info('Security Event', securityEvent);
    }
  }

  private getSecurityEventSeverity(event: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalEvents = ['SQL injection attempt', 'JWT token tampering', 'Multiple failed login attempts'];
    const highEvents = ['Rate limit exceeded', 'Invalid token', 'Unauthorized access attempt'];
    const mediumEvents = ['Failed login', 'Invalid input detected'];

    if (criticalEvents.some(e => event.toLowerCase().includes(e.toLowerCase()))) {
      return 'critical';
    }
    if (highEvents.some(e => event.toLowerCase().includes(e.toLowerCase()))) {
      return 'high';
    }
    if (mediumEvents.some(e => event.toLowerCase().includes(e.toLowerCase()))) {
      return 'medium';
    }
    return 'low';
  }

  logSystemHealth(component: string, status: 'healthy' | 'unhealthy', details?: any) {
    const logMethod = status === 'healthy' ? logger.info : logger.error;
    
    logMethod('System Health', {
      component,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

export const apiLogger = ApiLogger.getInstance();

// Health check for logger
export function checkLoggerHealth(): { status: 'healthy' | 'unhealthy'; details?: any } {
  try {
    logger.info('Logger health check');
    return { status: 'healthy' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Graceful shutdown
export async function closeLogger(): Promise<void> {
  return new Promise((resolve) => {
    logger.end(() => {
      console.log('Logger closed gracefully');
      resolve();
    });
  });
}

export default logger;