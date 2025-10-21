/**
 * gRPC-Web Adapter Types and Utilities
 *
 * Re-exports the complete GrpcWebAdapter implementation
 */

// Export everything from the actual GrpcWebAdapter implementation
export {
  GrpcWebAdapter,
  GrpcClientOptions,
  GrpcError,
  isGrpcError,
  MethodDescriptor,
  CancellationToken,
  CancellationTokenImpl,
} from './GrpcWebAdapter';
