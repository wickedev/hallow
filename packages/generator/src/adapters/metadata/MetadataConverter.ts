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
export class MetadataConverter {
  /**
   * Convert application metadata to grpc.Metadata
   *
   * Accepts either a plain object (Record<string, string>) or a Metadata
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
  static toGrpcMetadata(
    metadata?: Metadata | Record<string, string>
  ): grpc.Metadata {
    const grpcMetadata = new grpc.Metadata();

    if (!metadata) {
      return grpcMetadata;
    }

    // Check if it's a Metadata interface by checking for getMap method
    if (typeof (metadata as any).getMap === 'function') {
      return this.fromMetadataInterface(metadata as Metadata);
    }

    // Handle plain object
    return this.fromPlainObject(metadata as Record<string, string>);
  }

  /**
   * Convert Metadata interface to grpc.Metadata
   *
   * @param metadata - Metadata interface implementation
   * @returns grpc.Metadata instance
   * @private
   */
  private static fromMetadataInterface(metadata: Metadata): grpc.Metadata {
    const grpcMetadata = new grpc.Metadata();
    const map = metadata.getMap();

    for (const [key, values] of Object.entries(map)) {
      for (const value of values) {
        grpcMetadata.add(key, value);
      }
    }

    return grpcMetadata;
  }

  /**
   * Convert plain object to grpc.Metadata
   *
   * @param metadata - Plain object with string values
   * @returns grpc.Metadata instance
   * @private
   */
  private static fromPlainObject(
    metadata: Record<string, string>
  ): grpc.Metadata {
    const grpcMetadata = new grpc.Metadata();

    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined && value !== null) {
        grpcMetadata.set(key, value);
      }
    }

    return grpcMetadata;
  }

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
  static fromGrpcMetadata(grpcMetadata: grpc.Metadata): Metadata {
    const map = grpcMetadata.getMap();

    return {
      get(key: string): string[] | undefined {
        const values = map[key.toLowerCase()];
        if (!values) return undefined;
        return Array.isArray(values) ? values : [String(values)];
      },

      set(key: string, value: string | Buffer): void {
        grpcMetadata.set(key, value);
      },

      add(key: string, value: string | Buffer): void {
        grpcMetadata.add(key, value);
      },

      remove(key: string): void {
        grpcMetadata.remove(key);
      },

      getMap(): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(map)) {
          result[key] = Array.isArray(value) ? value : [String(value)];
        }
        return result;
      },
    };
  }

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
  static merge(
    sources: Array<Metadata | Record<string, string> | undefined>
  ): grpc.Metadata {
    const grpcMetadata = new grpc.Metadata();

    for (const source of sources) {
      if (!source) continue;

      const sourceMetadata = this.toGrpcMetadata(source);
      const sourceMap = sourceMetadata.getMap();

      for (const [key, values] of Object.entries(sourceMap)) {
        // Remove existing values for this key
        grpcMetadata.remove(key);

        // Add new values
        const valueArray = Array.isArray(values) ? values : [String(values)];
        for (const value of valueArray) {
          grpcMetadata.add(key, value);
        }
      }
    }

    return grpcMetadata;
  }

  /**
   * Clone grpc.Metadata
   *
   * Creates a deep copy of a grpc.Metadata instance.
   *
   * @param metadata - grpc.Metadata to clone
   * @returns New grpc.Metadata instance with same values
   */
  static clone(metadata: grpc.Metadata): grpc.Metadata {
    const cloned = new grpc.Metadata();
    const map = metadata.getMap();

    for (const [key, values] of Object.entries(map)) {
      const valueArray = Array.isArray(values) ? values : [String(values)];
      for (const value of valueArray) {
        cloned.add(key, value);
      }
    }

    return cloned;
  }

  /**
   * Check if metadata has a specific key
   *
   * @param metadata - grpc.Metadata to check
   * @param key - Key to look for (case-insensitive)
   * @returns true if key exists
   */
  static has(metadata: grpc.Metadata, key: string): boolean {
    const values = metadata.get(key);
    return values !== undefined && values.length > 0;
  }

  /**
   * Get first value for a key
   *
   * @param metadata - grpc.Metadata to search
   * @param key - Key to look for (case-insensitive)
   * @returns First value for the key, or undefined
   */
  static getFirst(metadata: grpc.Metadata, key: string): string | undefined {
    const values = metadata.get(key);
    if (!values || values.length === 0) return undefined;
    return String(values[0]);
  }

  /**
   * Get all values for a key
   *
   * @param metadata - grpc.Metadata to search
   * @param key - Key to look for (case-insensitive)
   * @returns Array of values, or empty array
   */
  static getAll(metadata: grpc.Metadata, key: string): string[] {
    const values = metadata.get(key);
    if (!values) return [];
    return values.map(String);
  }

  /**
   * Convert metadata to plain object (single values only)
   *
   * Useful for logging or debugging. If a key has multiple values,
   * only the first value is included.
   *
   * @param metadata - grpc.Metadata to convert
   * @returns Plain object with string values
   */
  static toPlainObject(metadata: grpc.Metadata): Record<string, string> {
    const result: Record<string, string> = {};
    const map = metadata.getMap();

    for (const [key, values] of Object.entries(map)) {
      const valueArray = Array.isArray(values) ? values : [String(values)];
      if (valueArray.length > 0) {
        result[key] = String(valueArray[0]);
      }
    }

    return result;
  }
}
