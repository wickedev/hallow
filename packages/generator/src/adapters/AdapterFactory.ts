/**
 * AdapterFactory - Factory for creating transport adapters
 *
 * This factory provides automatic selection of the appropriate gRPC
 * transport adapter based on the runtime environment and configuration.
 *
 * Selection Logic:
 * 1. If adapterType is explicitly specified, use that adapter
 * 2. If adapterType is 'auto' or not specified:
 *    - Use NativeGrpcAdapter if in Node.js and @grpc/grpc-js is available
 *    - Otherwise, use GrpcWebAdapter
 *
 * This enables gradual migration from grpc-web to native gRPC with
 * backward compatibility and feature flags.
 */

import { ITransportAdapter } from './ITransportAdapter';
import { GrpcWebAdapter } from './GrpcWebAdapter';
import { AdapterConfig } from './types';

/**
 * Adapter type selection
 */
export type AdapterType = 'grpc-web' | 'native' | 'auto';

/**
 * Factory configuration
 */
export interface AdapterFactoryConfig extends AdapterConfig {
  /**
   * Preferred adapter type
   * - 'grpc-web': Always use grpc-web adapter
   * - 'native': Always use native gRPC adapter (requires Node.js)
   * - 'auto': Automatically select based on environment (default)
   *
   * @default 'auto'
   */
  adapterType?: AdapterType;

  /**
   * Enable native gRPC in Node.js environments
   * When false, forces use of grpc-web even in Node.js
   * Useful for gradual migration or testing
   *
   * @default true
   */
  enableNativeGrpc?: boolean;
}

/**
 * AdapterFactory - Creates appropriate transport adapter based on configuration
 *
 * @example
 * ```typescript
 * // Auto-select adapter based on environment
 * const adapter = AdapterFactory.create({
 *   serverUrl: 'https://api.example.com',
 * });
 *
 * // Force grpc-web adapter
 * const webAdapter = AdapterFactory.create({
 *   serverUrl: 'https://api.example.com',
 *   adapterType: 'grpc-web',
 * });
 *
 * // Force native gRPC adapter (Node.js only)
 * const nativeAdapter = AdapterFactory.create({
 *   serverUrl: 'localhost:50051',
 *   adapterType: 'native',
 * });
 * ```
 */
export class AdapterFactory {
  /**
   * Create an appropriate transport adapter based on configuration
   *
   * @param config - Factory configuration
   * @returns Transport adapter instance
   * @throws {Error} If native adapter is requested but not available
   */
  static create(config: AdapterFactoryConfig): ITransportAdapter {
    const adapterType = config.adapterType ?? 'auto';
    const enableNativeGrpc = config.enableNativeGrpc ?? true;

    // Handle explicit adapter selection
    if (adapterType === 'native') {
      return this.createNativeAdapter(config);
    }

    if (adapterType === 'grpc-web') {
      return this.createGrpcWebAdapter(config);
    }

    // Auto-selection logic
    if (adapterType === 'auto') {
      // Check if native gRPC is available and enabled
      if (enableNativeGrpc && this.isNativeGrpcAvailable()) {
        try {
          return this.createNativeAdapter(config);
        } catch (error) {
          // Fall back to grpc-web if native adapter creation fails
          console.warn(
            'Failed to create native gRPC adapter, falling back to grpc-web:',
            error
          );
          return this.createGrpcWebAdapter(config);
        }
      }

      // Default to grpc-web
      return this.createGrpcWebAdapter(config);
    }

    // Should never reach here, but TypeScript requires exhaustive check
    throw new Error(`Unknown adapter type: ${adapterType}`);
  }

  /**
   * Check if native gRPC is available in the current environment
   *
   * Native gRPC requires:
   * 1. Node.js environment (not browser)
   * 2. @grpc/grpc-js module is available
   *
   * @returns true if native gRPC can be used
   */
  static isNativeGrpcAvailable(): boolean {
    // Check if we're in Node.js environment
    if (!this.isNodeEnvironment()) {
      return false;
    }

    // Check if @grpc/grpc-js module is available
    return this.hasGrpcJsModule();
  }

  /**
   * Check if we're running in a Node.js environment
   *
   * @returns true if in Node.js, false if in browser
   */
  private static isNodeEnvironment(): boolean {
    return (
      typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null
    );
  }

  /**
   * Check if @grpc/grpc-js module is available
   *
   * @returns true if module can be loaded
   */
  private static hasGrpcJsModule(): boolean {
    try {
      // Try to require the module
      require.resolve('@grpc/grpc-js');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a GrpcWebAdapter instance
   *
   * @param config - Adapter configuration
   * @returns GrpcWebAdapter instance
   */
  private static createGrpcWebAdapter(
    config: AdapterFactoryConfig
  ): ITransportAdapter {
    return new GrpcWebAdapter(config.serverUrl, {
      timeout: config.defaultCallOptions?.timeout,
      metadata: config.defaultCallOptions?.metadata as any,
      debug: config.debug,
    });
  }

  /**
   * Create a NativeGrpcAdapter instance
   *
   * @param config - Adapter configuration
   * @returns NativeGrpcAdapter instance
   * @throws {Error} If native gRPC is not available
   */
  private static createNativeAdapter(
    config: AdapterFactoryConfig
  ): ITransportAdapter {
    // Check if native gRPC is available
    if (!this.isNodeEnvironment()) {
      throw new Error(
        'Native gRPC adapter requires Node.js environment. ' +
          'Use adapterType: "grpc-web" for browser environments.'
      );
    }

    if (!this.hasGrpcJsModule()) {
      throw new Error(
        'Native gRPC adapter requires @grpc/grpc-js module. ' +
          'Install it with: npm install @grpc/grpc-js'
      );
    }

    // Dynamically import NativeGrpcAdapter to avoid loading in browser
    const { NativeGrpcAdapter } = require('./NativeGrpcAdapter');
    return new NativeGrpcAdapter({
      serverUrl: config.serverUrl,
      secure: config.secure,
      debug: config.debug,
      defaultCallOptions: config.defaultCallOptions,
    });
  }

  /**
   * Get information about available adapters
   *
   * Useful for debugging and displaying to users what adapters
   * are available in the current environment.
   *
   * @returns Information about adapter availability
   */
  static getAvailableAdapters(): {
    grpcWeb: boolean;
    native: boolean;
    default: 'grpc-web' | 'native';
  } {
    const nativeAvailable = this.isNativeGrpcAvailable();

    return {
      grpcWeb: true, // Always available
      native: nativeAvailable,
      default: nativeAvailable ? 'native' : 'grpc-web',
    };
  }

  /**
   * Get environment information
   *
   * Useful for debugging adapter selection issues.
   *
   * @returns Environment information
   */
  static getEnvironmentInfo(): {
    isNode: boolean;
    hasGrpcJs: boolean;
    platform: string;
  } {
    const isNode = this.isNodeEnvironment();

    return {
      isNode,
      hasGrpcJs: isNode ? this.hasGrpcJsModule() : false,
      platform: isNode
        ? `Node.js ${process.version}`
        : 'Browser',
    };
  }
}

/**
 * Default export for convenience
 */
export default AdapterFactory;
