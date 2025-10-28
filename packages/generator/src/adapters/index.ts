/**
 * gRPC Adapter Types and Utilities
 *
 * Re-exports the complete adapter implementations and utilities
 */

// Export transport adapter interface and types
export * from './types';
export * from './ITransportAdapter';
export * from './AdapterFactory';

// Export native gRPC adapter
export {
  NativeGrpcAdapter,
  NativeGrpcAdapterConfig,
} from './NativeGrpcAdapter';

// Export metadata utilities
export { MetadataConverter } from './metadata';

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
