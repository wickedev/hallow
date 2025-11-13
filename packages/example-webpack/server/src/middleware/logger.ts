import * as grpc from '@grpc/grpc-js';

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Request logger interface
 */
export interface RequestLogger {
  logRequest(method: string, request: any): void;
  logResponse(method: string, response: any, duration: number): void;
  logError(method: string, error: Error): void;
}

/**
 * Console-based request logger with colorized output
 */
export class ConsoleLogger implements RequestLogger {
  /**
   * Log incoming gRPC request
   */
  logRequest(method: string, request: any): void {
    const timestamp = new Date().toISOString();
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ` +
        `${colors.cyan}→${colors.reset} ` +
        `${colors.bright}${method}${colors.reset} ` +
        `${colors.dim}${JSON.stringify(request)}${colors.reset}`
    );
  }

  /**
   * Log response with timing information
   */
  logResponse(method: string, response: any, duration: number): void {
    const timestamp = new Date().toISOString();
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ` +
        `${colors.green}←${colors.reset} ` +
        `${colors.bright}${method}${colors.reset} ` +
        `${colors.dim}(${duration}ms)${colors.reset} ` +
        `${colors.dim}${JSON.stringify(response)}${colors.reset}`
    );
  }

  /**
   * Log error with stack trace
   */
  logError(method: string, error: Error): void {
    const timestamp = new Date().toISOString();
    console.error(
      `${colors.dim}[${timestamp}]${colors.reset} ` +
        `${colors.red}✖${colors.reset} ` +
        `${colors.bright}${method}${colors.reset} ` +
        `${colors.red}${error.message}${colors.reset}`
    );
    if (error.stack) {
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    }
  }
}

export const logger = new ConsoleLogger();
