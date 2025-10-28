/**
 * Unit tests for MetadataConverter
 *
 * Tests the conversion between different metadata formats:
 * - Plain object to grpc.Metadata
 * - Metadata interface to grpc.Metadata
 * - grpc.Metadata to Metadata interface
 * - Merging multiple metadata sources
 * - Utility methods (clone, has, getFirst, etc.)
 */

import * as grpc from '@grpc/grpc-js';
import { MetadataConverter } from '../../../src/adapters/metadata/MetadataConverter';
import { Metadata } from '../../../src/adapters/types';

describe('MetadataConverter', () => {
  describe('toGrpcMetadata', () => {
    it('should return empty metadata when input is undefined', () => {
      const result = MetadataConverter.toGrpcMetadata(undefined);

      expect(result).toBeInstanceOf(grpc.Metadata);
      expect(Object.keys(result.getMap())).toHaveLength(0);
    });

    it('should convert plain object to grpc.Metadata', () => {
      const input = {
        authorization: 'Bearer token123',
        'request-id': 'uuid-456',
        'x-custom-header': 'value',
      };

      const result = MetadataConverter.toGrpcMetadata(input);

      expect(result).toBeInstanceOf(grpc.Metadata);
      expect(result.get('authorization')).toEqual(['Bearer token123']);
      expect(result.get('request-id')).toEqual(['uuid-456']);
      expect(result.get('x-custom-header')).toEqual(['value']);
    });

    it('should filter out null and undefined values from plain object', () => {
      const input = {
        'valid-header': 'value',
        'null-header': null as any,
        'undefined-header': undefined as any,
      };

      const result = MetadataConverter.toGrpcMetadata(input);

      expect(result.get('valid-header')).toEqual(['value']);
      expect(result.get('null-header')).toBeUndefined();
      expect(result.get('undefined-header')).toBeUndefined();
    });

    it('should convert Metadata interface to grpc.Metadata', () => {
      const input: Metadata = {
        get: jest.fn(),
        set: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
        getMap: jest.fn().mockReturnValue({
          authorization: ['Bearer token123'],
          'request-id': ['uuid-456'],
          'multi-value': ['value1', 'value2'],
        }),
      };

      const result = MetadataConverter.toGrpcMetadata(input);

      expect(result).toBeInstanceOf(grpc.Metadata);
      expect(result.get('authorization')).toEqual(['Bearer token123']);
      expect(result.get('request-id')).toEqual(['uuid-456']);
      expect(result.get('multi-value')).toEqual(['value1', 'value2']);
    });

    it('should handle binary headers', () => {
      const input = {
        'text-header': 'text-value',
        'binary-header-bin': 'binary-value',
      };

      const result = MetadataConverter.toGrpcMetadata(input);

      expect(result.get('text-header')).toEqual(['text-value']);
      expect(result.get('binary-header-bin')).toBeDefined();
    });

    it('should be case-insensitive for header names', () => {
      const input = {
        Authorization: 'Bearer token',
        'X-Request-ID': 'uuid',
      };

      const result = MetadataConverter.toGrpcMetadata(input);

      // gRPC normalizes header names to lowercase
      expect(result.get('authorization')).toBeDefined();
      expect(result.get('x-request-id')).toBeDefined();
    });
  });

  describe('fromGrpcMetadata', () => {
    it('should convert grpc.Metadata to Metadata interface', () => {
      const grpcMeta = new grpc.Metadata();
      grpcMeta.set('authorization', 'Bearer token123');
      grpcMeta.set('request-id', 'uuid-456');

      const result = MetadataConverter.fromGrpcMetadata(grpcMeta);

      expect(result.get('authorization')).toEqual(['Bearer token123']);
      expect(result.get('request-id')).toEqual(['uuid-456']);
    });

    it('should handle multiple values for the same key', () => {
      const grpcMeta = new grpc.Metadata();
      grpcMeta.add('x-header', 'value1');
      grpcMeta.add('x-header', 'value2');
      grpcMeta.add('x-header', 'value3');

      const result = MetadataConverter.fromGrpcMetadata(grpcMeta);

      expect(result.get('x-header')).toEqual(['value1', 'value2', 'value3']);
    });

    it('should return undefined for non-existent keys', () => {
      const grpcMeta = new grpc.Metadata();
      grpcMeta.set('existing-key', 'value');

      const result = MetadataConverter.fromGrpcMetadata(grpcMeta);

      expect(result.get('non-existent-key')).toBeUndefined();
    });

    it('should support set operation on returned Metadata', () => {
      const grpcMeta = new grpc.Metadata();
      const result = MetadataConverter.fromGrpcMetadata(grpcMeta);

      result.set('new-key', 'new-value');

      expect(result.get('new-key')).toEqual(['new-value']);
    });

    it('should support add operation on returned Metadata', () => {
      const grpcMeta = new grpc.Metadata();
      const result = MetadataConverter.fromGrpcMetadata(grpcMeta);

      result.add('multi-key', 'value1');
      result.add('multi-key', 'value2');

      expect(result.get('multi-key')).toEqual(['value1', 'value2']);
    });

    it('should support remove operation on returned Metadata', () => {
      const grpcMeta = new grpc.Metadata();
      grpcMeta.set('to-remove', 'value');
      const result = MetadataConverter.fromGrpcMetadata(grpcMeta);

      result.remove('to-remove');

      expect(result.get('to-remove')).toBeUndefined();
    });

    it('should return complete map via getMap', () => {
      const grpcMeta = new grpc.Metadata();
      grpcMeta.set('key1', 'value1');
      grpcMeta.add('key2', 'value2a');
      grpcMeta.add('key2', 'value2b');

      const result = MetadataConverter.fromGrpcMetadata(grpcMeta);
      const map = result.getMap();

      expect(map['key1']).toEqual(['value1']);
      expect(map['key2']).toEqual(['value2a', 'value2b']);
    });
  });

  describe('merge', () => {
    it('should merge multiple metadata sources', () => {
      const source1 = { key1: 'value1', key2: 'value2' };
      const source2 = { key2: 'overridden', key3: 'value3' };

      const result = MetadataConverter.merge([source1, source2]);

      expect(result.get('key1')).toEqual(['value1']);
      expect(result.get('key2')).toEqual(['overridden']); // Later source wins
      expect(result.get('key3')).toEqual(['value3']);
    });

    it('should skip undefined sources', () => {
      const source1 = { key1: 'value1' };
      const source2 = undefined;
      const source3 = { key2: 'value2' };

      const result = MetadataConverter.merge([source1, source2, source3]);

      expect(result.get('key1')).toEqual(['value1']);
      expect(result.get('key2')).toEqual(['value2']);
    });

    it('should return empty metadata for empty array', () => {
      const result = MetadataConverter.merge([]);

      expect(Object.keys(result.getMap())).toHaveLength(0);
    });

    it('should merge Metadata interfaces', () => {
      const meta1: Metadata = {
        get: jest.fn(),
        set: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
        getMap: jest.fn().mockReturnValue({ key1: ['value1'] }),
      };

      const meta2 = { key2: 'value2' };

      const result = MetadataConverter.merge([meta1, meta2]);

      expect(result.get('key1')).toEqual(['value1']);
      expect(result.get('key2')).toEqual(['value2']);
    });
  });

  describe('clone', () => {
    it('should create a deep copy of grpc.Metadata', () => {
      const original = new grpc.Metadata();
      original.set('key1', 'value1');
      original.add('key2', 'value2a');
      original.add('key2', 'value2b');

      const cloned = MetadataConverter.clone(original);

      // Should have same values
      expect(cloned.get('key1')).toEqual(['value1']);
      expect(cloned.get('key2')).toEqual(['value2a', 'value2b']);

      // Should be independent
      cloned.set('key1', 'modified');
      expect(original.get('key1')).toEqual(['value1']);
      expect(cloned.get('key1')).toEqual(['modified']);
    });

    it('should handle empty metadata', () => {
      const original = new grpc.Metadata();
      const cloned = MetadataConverter.clone(original);

      expect(Object.keys(cloned.getMap())).toHaveLength(0);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const metadata = new grpc.Metadata();
      metadata.set('existing', 'value');

      expect(MetadataConverter.has(metadata, 'existing')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      const metadata = new grpc.Metadata();

      expect(MetadataConverter.has(metadata, 'non-existent')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const metadata = new grpc.Metadata();
      metadata.set('Authorization', 'Bearer token');

      expect(MetadataConverter.has(metadata, 'authorization')).toBe(true);
      expect(MetadataConverter.has(metadata, 'AUTHORIZATION')).toBe(true);
    });
  });

  describe('getFirst', () => {
    it('should return first value for key', () => {
      const metadata = new grpc.Metadata();
      metadata.add('multi', 'first');
      metadata.add('multi', 'second');
      metadata.add('multi', 'third');

      expect(MetadataConverter.getFirst(metadata, 'multi')).toBe('first');
    });

    it('should return undefined for non-existent key', () => {
      const metadata = new grpc.Metadata();

      expect(MetadataConverter.getFirst(metadata, 'non-existent')).toBeUndefined();
    });

    it('should return single value', () => {
      const metadata = new grpc.Metadata();
      metadata.set('single', 'value');

      expect(MetadataConverter.getFirst(metadata, 'single')).toBe('value');
    });
  });

  describe('getAll', () => {
    it('should return all values for key', () => {
      const metadata = new grpc.Metadata();
      metadata.add('multi', 'value1');
      metadata.add('multi', 'value2');
      metadata.add('multi', 'value3');

      expect(MetadataConverter.getAll(metadata, 'multi')).toEqual([
        'value1',
        'value2',
        'value3',
      ]);
    });

    it('should return empty array for non-existent key', () => {
      const metadata = new grpc.Metadata();

      expect(MetadataConverter.getAll(metadata, 'non-existent')).toEqual([]);
    });

    it('should return array with single value', () => {
      const metadata = new grpc.Metadata();
      metadata.set('single', 'value');

      expect(MetadataConverter.getAll(metadata, 'single')).toEqual(['value']);
    });
  });

  describe('toPlainObject', () => {
    it('should convert metadata to plain object', () => {
      const metadata = new grpc.Metadata();
      metadata.set('key1', 'value1');
      metadata.set('key2', 'value2');

      const result = MetadataConverter.toPlainObject(metadata);

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should take only first value for multi-value keys', () => {
      const metadata = new grpc.Metadata();
      metadata.add('multi', 'first');
      metadata.add('multi', 'second');
      metadata.add('multi', 'third');

      const result = MetadataConverter.toPlainObject(metadata);

      expect(result['multi']).toBe('first');
    });

    it('should handle empty metadata', () => {
      const metadata = new grpc.Metadata();

      const result = MetadataConverter.toPlainObject(metadata);

      expect(result).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      const input = { 'empty-header': '' };
      const result = MetadataConverter.toGrpcMetadata(input);

      expect(result.get('empty-header')).toEqual(['']);
    });

    it('should handle special characters in header names', () => {
      const input = {
        'x-header-with-dashes': 'value',
        'x_header_with_underscores': 'value',
      };

      const result = MetadataConverter.toGrpcMetadata(input);

      expect(result.get('x-header-with-dashes')).toBeDefined();
      expect(result.get('x_header_with_underscores')).toBeDefined();
    });

    it('should handle very long header values', () => {
      const longValue = 'x'.repeat(10000);
      const input = { 'long-header': longValue };

      const result = MetadataConverter.toGrpcMetadata(input);

      expect(result.get('long-header')).toEqual([longValue]);
    });

    it('should handle many headers', () => {
      const input: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        input[`header-${i}`] = `value-${i}`;
      }

      const result = MetadataConverter.toGrpcMetadata(input);

      for (let i = 0; i < 100; i++) {
        expect(result.get(`header-${i}`)).toEqual([`value-${i}`]);
      }
    });
  });
});
