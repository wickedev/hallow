/**
 * gRPC-Web Adapter Types and Utilities
 *
 * TEMPORARY STUB for Phase 2 testing
 * TODO: Implement actual gRPC-web integration in Phase 3 (Task 3.2-3.4)
 */

import { grpc } from '@improbable-eng/grpc-web';

/**
 * Configuration options for gRPC-web client
 */
export interface GrpcClientOptions {
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * gRPC error with status code
 */
export class GrpcError extends Error {
  constructor(
    message: string,
    public readonly code: grpc.Code,
    public readonly metadata?: grpc.Metadata,
  ) {
    super(message);
    this.name = 'GrpcError';
  }
}

/**
 * Type guard to check if an error is a GrpcError
 */
export function isGrpcError(error: unknown): error is GrpcError {
  return error instanceof GrpcError;
}

/**
 * Method descriptor for gRPC-web calls
 */
export interface MethodDescriptor<TRequest, TResponse> {
  readonly methodName: string;
  readonly serviceName: string;
  readonly requestType: string;
  readonly responseType: string;
  readonly requestStream: boolean;
  readonly responseStream: boolean;
}

/**
 * gRPC-Web adapter for making RPC calls
 *
 * TEMPORARY STUB - Returns placeholder responses
 * TODO: Implement actual gRPC communication in Phase 3
 */
export class GrpcWebAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly options?: GrpcClientOptions,
  ) {}

  /**
   * Make a unary RPC call
   *
   * STUB: Always throws "not implemented" error
   * TODO: Implement in Task 3.2
   */
  async unary<TRequest, TResponse>(
    descriptor: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
  ): Promise<TResponse> {
    throw new Error(
      `Unary RPC "${descriptor.methodName}" not yet implemented. ` +
      `This is a stub for Phase 2 type checking. ` +
      `Actual implementation will be added in Phase 3 (Task 3.2).`
    );
  }

  /**
   * Make a server streaming RPC call
   *
   * STUB: Always throws "not implemented" error
   * TODO: Implement in Task 3.3
   */
  serverStreaming<TRequest, TResponse>(
    descriptor: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
  ): import('rxjs').Observable<TResponse> {
    throw new Error(
      `Server streaming RPC "${descriptor.methodName}" not yet implemented. ` +
      `This is a stub for Phase 2 type checking. ` +
      `Actual implementation will be added in Phase 3 (Task 3.3).`
    );
  }
}
