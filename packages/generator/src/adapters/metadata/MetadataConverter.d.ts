/**
 * MetadataConverter - Utility for converting between metadata formats
 *
 * This utility provides conversion between application-level metadata
 * (plain objects or Metadata interface) and grpc.Metadata format used
 * by @grpc/grpc-js.
 *
 * Key features:
 * - Converts plain objects to grpc.Metadata
 * - Converts Metadata interface to grpc.Metadata
 * - Converts grpc.Metadata back to Metadata interface
 * - Handles binary headers (keys ending with -bin)
 * - Preserves multiple values for the same key
 * - Case-insensitive key handling
 */
import * as grpc from '@grpc/grpc-js';
import { Metadata } from '../types';
/**
 * MetadataConverter utility class
 *
 * Provides static methods for converting between different metadata formats.
 * All methods are stateless and can be called without instantiation.
 */
export declare class MetadataConverter {
    /**
     * Convert application metadata to grpc.Metadata
     *
     * Accepts either a plain object (Record<string, string | Buffer>) or a Metadata
     * interface implementation and converts it to grpc.Metadata format.
     *
     * @param metadata - Application metadata (plain object or Metadata interface)
     * @returns grpc.Metadata instance
     *
     * @example
     * ```typescript
     * // From plain object
     * const grpcMeta = MetadataConverter.toGrpcMetadata({
     *   'authorization': 'Bearer token123',
     *   'request-id': 'uuid-456'
     * });
     *
     * // From Metadata interface
     * const appMeta: Metadata = createMetadata();
     * const grpcMeta = MetadataConverter.toGrpcMetadata(appMeta);
     * ```
     */
    static toGrpcMetadata(metadata?: Metadata | Record<string, string | Buffer>): grpc.Metadata;
    /**
     * Convert Metadata interface to grpc.Metadata
     *
     * @param metadata - Metadata interface implementation
     * @returns grpc.Metadata instance
     * @private
     */
    private static fromMetadataInterface;
    /**
     * Convert plain object to grpc.Metadata
     *
     * @param metadata - Plain object with string values or Buffer for binary headers
     * @returns grpc.Metadata instance
     * @private
     */
    private static fromPlainObject;
    /**
     * Convert grpc.Metadata to Metadata interface
     *
     * Creates a Metadata interface implementation from grpc.Metadata.
     * The returned object provides get(), set(), add(), remove(), and getMap()
     * methods that delegate to the underlying grpc.Metadata.
     *
     * @param grpcMetadata - Native grpc.Metadata instance
     * @returns Metadata interface implementation
     *
     * @example
     * ```typescript
     * // From grpc.Metadata (e.g., from response)
     * const grpcMeta: grpc.Metadata = responseMetadata;
     * const appMeta = MetadataConverter.fromGrpcMetadata(grpcMeta);
     *
     * // Access values
     * const authHeader = appMeta.get('authorization');
     * console.log('Auth:', authHeader);
     * ```
     */
    static fromGrpcMetadata(grpcMetadata: grpc.Metadata): Metadata;
    /**
     * Merge multiple metadata objects
     *
     * Combines multiple metadata sources into a single grpc.Metadata instance.
     * Later sources override earlier sources for the same keys.
     *
     * @param sources - Array of metadata objects to merge
     * @returns Merged grpc.Metadata instance
     *
     * @example
     * ```typescript
     * const defaultMeta = { 'user-agent': 'hallow-grpc/1.0' };
     * const requestMeta = { 'authorization': 'Bearer token' };
     * const merged = MetadataConverter.merge([defaultMeta, requestMeta]);
     * ```
     */
    static merge(sources: Array<Metadata | Record<string, string | Buffer> | undefined>): grpc.Metadata;
    /**
     * Clone grpc.Metadata
     *
     * Creates a deep copy of a grpc.Metadata instance.
     *
     * @param metadata - grpc.Metadata to clone
     * @returns New grpc.Metadata instance with same values
     */
    static clone(metadata: grpc.Metadata): grpc.Metadata;
    /**
     * Check if metadata has a specific key
     *
     * @param metadata - grpc.Metadata to check
     * @param key - Key to look for (case-insensitive)
     * @returns true if key exists
     */
    static has(metadata: grpc.Metadata, key: string): boolean;
    /**
     * Get first value for a key
     *
     * @param metadata - grpc.Metadata to search
     * @param key - Key to look for (case-insensitive)
     * @returns First value for the key, or undefined
     */
    static getFirst(metadata: grpc.Metadata, key: string): string | undefined;
    /**
     * Get all values for a key
     *
     * @param metadata - grpc.Metadata to search
     * @param key - Key to look for (case-insensitive)
     * @returns Array of values, or empty array
     */
    static getAll(metadata: grpc.Metadata, key: string): string[];
    /**
     * Convert metadata to plain object (single values only)
     *
     * Useful for logging or debugging. If a key has multiple values,
     * only the first value is included.
     *
     * @param metadata - grpc.Metadata to convert
     * @returns Plain object with string values
     */
    static toPlainObject(metadata: grpc.Metadata): Record<string, string>;
}
//# sourceMappingURL=MetadataConverter.d.ts.map