import * as grpc from '@grpc/grpc-js';

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handleError(error: Error): grpc.StatusObject;
  createError(code: grpc.status, message: string, details?: any): grpc.StatusObject;
}

/**
 * Map JavaScript errors to gRPC status codes
 */
export class GrpcErrorHandler implements ErrorHandler {
  /**
   * Convert JavaScript error to gRPC status
   */
  handleError(error: Error): grpc.StatusObject {
    // Validation errors
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return this.createError(
        grpc.status.INVALID_ARGUMENT,
        error.message
      );
    }

    // Not found errors
    if (error.message.includes('not found')) {
      return this.createError(grpc.status.NOT_FOUND, error.message);
    }

    // Permission errors
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return this.createError(grpc.status.PERMISSION_DENIED, error.message);
    }

    // Default to internal error
    return this.createError(
      grpc.status.INTERNAL,
      'Internal server error: ' + error.message
    );
  }

  /**
   * Create gRPC status object
   */
  createError(code: grpc.status, message: string, details?: any): grpc.StatusObject {
    const metadata = new grpc.Metadata();

    if (details) {
      metadata.set('error-details', JSON.stringify(details));
    }

    return {
      code,
      details: message,
      metadata,
    };
  }
}

/**
 * Helper functions for common error responses
 */
export const errorHelpers = {
  invalidArgument: (message: string) =>
    new GrpcErrorHandler().createError(grpc.status.INVALID_ARGUMENT, message),

  notFound: (resource: string) =>
    new GrpcErrorHandler().createError(
      grpc.status.NOT_FOUND,
      `${resource} not found`
    ),

  internal: (message: string) =>
    new GrpcErrorHandler().createError(grpc.status.INTERNAL, message),

  unimplemented: (method: string) =>
    new GrpcErrorHandler().createError(
      grpc.status.UNIMPLEMENTED,
      `Method ${method} is not implemented`
    ),
};

export const errorHandler = new GrpcErrorHandler();
