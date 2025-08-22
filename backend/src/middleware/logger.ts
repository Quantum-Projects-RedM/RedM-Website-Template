import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  meta?: any;
}

class Logger {
  private logToFile(entry: LogEntry, filename: string) {
    const logLine = `${entry.timestamp} [${entry.level}] ${entry.message}${
      entry.meta ? ` | ${JSON.stringify(entry.meta)}` : ''
    }\n`;
    
    const filePath = path.join(logsDir, filename);
    fs.appendFileSync(filePath, logLine);
  }

  private createEntry(level: LogEntry['level'], message: string, meta?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    };
  }

  info(message: string, meta?: any) {
    const entry = this.createEntry('INFO', message, meta);
    console.log(`[INFO] ${message}`, meta || '');
    this.logToFile(entry, 'app.log');
  }

  warn(message: string, meta?: any) {
    const entry = this.createEntry('WARN', message, meta);
    console.warn(`[WARN] ${message}`, meta || '');
    this.logToFile(entry, 'app.log');
  }

  error(message: string, meta?: any) {
    const entry = this.createEntry('ERROR', message, meta);
    console.error(`[ERROR] ${message}`, meta || '');
    this.logToFile(entry, 'error.log');
    this.logToFile(entry, 'app.log');
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      const entry = this.createEntry('DEBUG', message, meta);
      console.debug(`[DEBUG] ${message}`, meta || '');
      this.logToFile(entry, 'debug.log');
    }
  }

  // Log HTTP requests
  request(req: Request, res: Response, responseTime?: number) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      userId: (req as any).user?.id || null
    };

    const level = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    const message = `${req.method} ${req.originalUrl} ${res.statusCode}`;
    
    const entry = this.createEntry(level, message, meta);
    this.logToFile(entry, 'access.log');
    
    if (level === 'ERROR') {
      this.logToFile(entry, 'error.log');
    }
  }

  // Log security events
  security(event: string, details: any, req?: Request) {
    const meta = {
      event,
      ...details,
      ip: req?.ip || req?.connection.remoteAddress,
      userAgent: req?.get('User-Agent'),
      userId: (req as any)?.user?.id || null
    };

    const entry = this.createEntry('WARN', `Security Event: ${event}`, meta);
    console.warn(`[SECURITY] ${event}`, meta);
    this.logToFile(entry, 'security.log');
    this.logToFile(entry, 'app.log');
  }
}

export const logger = new Logger();

// HTTP request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.request(req, res, responseTime);
  });

  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined,
    userId: (req as any).user?.id || null
  });

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.get('X-Request-ID') || 'unknown'
  });
};

// Security event logging
export const logSecurityEvent = (event: string, details: any, req?: Request) => {
  logger.security(event, details, req);
};