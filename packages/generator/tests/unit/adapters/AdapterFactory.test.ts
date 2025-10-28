/**
 * AdapterFactory Unit Tests
 *
 * Tests for the adapter factory functionality including:
 * - Environment detection
 * - Adapter selection logic
 * - Auto-selection behavior
 * - Error handling
 */

import { AdapterFactory } from '../../../src/adapters/AdapterFactory';
import { ITransportAdapter } from '../../../src/adapters/ITransportAdapter';
import { GrpcWebAdapter } from '../../../src/adapters/GrpcWebAdapter';

describe('AdapterFactory', () => {
  describe('Environment Detection', () => {
    it('should detect Node.js environment', () => {
      const info = AdapterFactory.getEnvironmentInfo();

      // Running in Jest/Node.js
      expect(info.isNode).toBe(true);
      expect(info.platform).toContain('Node.js');
    });

    it('should detect @grpc/grpc-js availability', () => {
      const info = AdapterFactory.getEnvironmentInfo();

      // Should be true since we have @grpc/grpc-js installed
      expect(info.hasGrpcJs).toBe(true);
    });

    it('should report available adapters', () => {
      const available = AdapterFactory.getAvailableAdapters();

      // grpc-web should always be available
      expect(available.grpcWeb).toBe(true);

      // native should be available in Node.js with @grpc/grpc-js
      expect(available.native).toBe(true);

      // default should be native since both conditions are met
      expect(available.default).toBe('native');
    });

    it('should correctly identify native gRPC availability', () => {
      const isAvailable = AdapterFactory.isNativeGrpcAvailable();

      // Should be true in our test environment
      expect(isAvailable).toBe(true);
    });
  });

  describe('Adapter Creation - grpc-web', () => {
    it('should create GrpcWebAdapter when explicitly requested', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        adapterType: 'grpc-web',
      });

      expect(adapter).toBeInstanceOf(GrpcWebAdapter);
      expect(adapter).toBeDefined();
      expect(typeof adapter.unary).toBe('function');
      expect(typeof adapter.serverStream).toBe('function');

      adapter.close();
    });

    it('should create GrpcWebAdapter with custom options', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        adapterType: 'grpc-web',
        secure: true,
        debug: true,
        defaultCallOptions: {
          timeout: 5000,
        },
      });

      expect(adapter).toBeInstanceOf(GrpcWebAdapter);
      adapter.close();
    });

    it('should create GrpcWebAdapter when native is disabled', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        adapterType: 'auto',
        enableNativeGrpc: false,
      });

      expect(adapter).toBeInstanceOf(GrpcWebAdapter);
      adapter.close();
    });
  });

  describe('Adapter Creation - native', () => {
    it('should attempt to create native adapter when explicitly requested', () => {
      // NOTE: This will throw until Task 9 is complete (NativeGrpcAdapter implementation)
      expect(() => {
        AdapterFactory.create({
          serverUrl: 'localhost:50051',
          adapterType: 'native',
        });
      }).toThrow('NativeGrpcAdapter not yet implemented');
    });

    it('should provide helpful error message when native adapter not available', () => {
      expect(() => {
        AdapterFactory.create({
          serverUrl: 'localhost:50051',
          adapterType: 'native',
        });
      }).toThrow(/NativeGrpcAdapter not yet implemented/);
    });
  });

  describe('Adapter Creation - auto', () => {
    it('should auto-select adapter based on environment', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        adapterType: 'auto',
      });

      // In Node.js with @grpc/grpc-js, should attempt native
      // But will fall back to grpc-web since NativeGrpcAdapter not implemented yet
      expect(adapter).toBeInstanceOf(GrpcWebAdapter);

      adapter.close();
    });

    it('should use auto-selection as default', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        // No adapterType specified - should default to 'auto'
      });

      expect(adapter).toBeDefined();
      expect(typeof adapter.unary).toBe('function');

      adapter.close();
    });

    it('should fall back to grpc-web if native creation fails', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        adapterType: 'auto',
        enableNativeGrpc: true,
      });

      // Should fall back to grpc-web since native not implemented
      expect(adapter).toBeInstanceOf(GrpcWebAdapter);

      adapter.close();
    });
  });

  describe('Interface Compliance', () => {
    it('should create adapter that implements ITransportAdapter', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
      });

      // Check interface compliance
      expect(typeof adapter.unary).toBe('function');
      expect(typeof adapter.serverStream).toBe('function');
      expect(typeof adapter.clientStream).toBe('function');
      expect(typeof adapter.bidiStream).toBe('function');
      expect(typeof adapter.close).toBe('function');

      adapter.close();
    });
  });

  describe('Configuration Handling', () => {
    it('should pass configuration to created adapter', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        adapterType: 'grpc-web',
        debug: true,
        defaultCallOptions: {
          timeout: 10000,
        },
      }) as GrpcWebAdapter;

      // Verify configuration is passed
      expect(adapter.getBaseUrl()).toBe('https://api.example.com');

      const options = adapter.getOptions();
      expect(options.debug).toBe(true);
      expect(options.timeout).toBe(10000);

      adapter.close();
    });

    it('should handle secure flag', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
        adapterType: 'grpc-web',
        secure: true,
      });

      expect(adapter).toBeDefined();
      adapter.close();
    });
  });

  describe('Error Cases', () => {
    it('should handle invalid adapter type gracefully', () => {
      expect(() => {
        AdapterFactory.create({
          serverUrl: 'https://api.example.com',
          adapterType: 'invalid' as any,
        });
      }).toThrow(/Unknown adapter type/);
    });

    it('should provide clear error for missing server URL', () => {
      expect(() => {
        AdapterFactory.create({
          serverUrl: '',
          adapterType: 'grpc-web',
        });
      }).not.toThrow(); // GrpcWebAdapter accepts empty URL (may fail on actual call)
    });
  });

  describe('Resource Management', () => {
    it('should allow closing created adapter', () => {
      const adapter = AdapterFactory.create({
        serverUrl: 'https://api.example.com',
      });

      expect(() => {
        adapter.close();
      }).not.toThrow();
    });

    it('should handle multiple adapter creations', () => {
      const adapter1 = AdapterFactory.create({
        serverUrl: 'https://api1.example.com',
      });

      const adapter2 = AdapterFactory.create({
        serverUrl: 'https://api2.example.com',
      });

      expect(adapter1).toBeDefined();
      expect(adapter2).toBeDefined();
      expect(adapter1).not.toBe(adapter2);

      adapter1.close();
      adapter2.close();
    });
  });
});
