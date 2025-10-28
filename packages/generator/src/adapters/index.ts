/**
 * gRPC-Web Adapter Types and Utilities
 *
 * Re-exports the complete GrpcWebAdapter implementation
 */

// Export transport adapter interface and types
export * from './types';
export * from './ITransportAdapter';
export * from './AdapterFactory';

// Export everything from the actual GrpcWebAdapter implementation
export {
  GrpcWebAdapter,
  GrpcClientOptions,
  GrpcError as GrpcWebError,
  isGrpcError as isGrpcWebError,
  MethodDescriptor as GrpcWebMethodDescriptor,
  CancellationToken,
  CancellationTokenImpl,
} from './GrpcWebAdapter';

// Export serialization adapters
export {
  ISerializationAdapter,
  MessageDescriptor,
  FieldDescriptor,
  SerializationError,
  isSerializationError,
} from './SerializationAdapter';

export { JsonSerializationAdapter } from './JsonSerializationAdapter';
