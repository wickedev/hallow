/**
 * gRPC Adapter Types and Utilities
 *
 * Re-exports the complete adapter implementations and utilities
 */
export * from './types';
export * from './ITransportAdapter';
export * from './AdapterFactory';
export { NativeGrpcAdapter, NativeGrpcAdapterConfig, } from './NativeGrpcAdapter';
export { MetadataConverter } from './metadata';
export { GrpcWebAdapter, GrpcClientOptions, GrpcError as GrpcWebError, isGrpcError as isGrpcWebError, MethodDescriptor as GrpcWebMethodDescriptor, CancellationToken, CancellationTokenImpl, } from './GrpcWebAdapter';
export { ISerializationAdapter, MessageDescriptor, FieldDescriptor, SerializationError, isSerializationError, } from './SerializationAdapter';
export { JsonSerializationAdapter } from './JsonSerializationAdapter';
//# sourceMappingURL=index.d.ts.map