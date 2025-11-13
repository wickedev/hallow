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
export declare class AdapterFactory {
    /**
     * Create an appropriate transport adapter based on configuration
     *
     * @param config - Factory configuration
     * @returns Transport adapter instance
     * @throws {Error} If native adapter is requested but not available
     */
    static create(config: AdapterFactoryConfig): ITransportAdapter;
    /**
     * Check if native gRPC is available in the current environment
     *
     * Native gRPC requires:
     * 1. Node.js environment (not browser)
     * 2. @grpc/grpc-js module is available
     *
     * @returns true if native gRPC can be used
     */
    static isNativeGrpcAvailable(): boolean;
    /**
     * Check if we're running in a Node.js environment
     *
     * @returns true if in Node.js, false if in browser
     */
    private static isNodeEnvironment;
    /**
     * Check if @grpc/grpc-js module is available
     *
     * @returns true if module can be loaded
     */
    private static hasGrpcJsModule;
    /**
     * Create a GrpcWebAdapter instance
     *
     * @param config - Adapter configuration
     * @returns GrpcWebAdapter instance
     */
    private static createGrpcWebAdapter;
    /**
     * Create a NativeGrpcAdapter instance
     *
     * @param config - Adapter configuration
     * @returns NativeGrpcAdapter instance
     * @throws {Error} If native gRPC is not available
     */
    private static createNativeAdapter;
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
    };
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
    };
}
/**
 * Default export for convenience
 */
export default AdapterFactory;
//# sourceMappingURL=AdapterFactory.d.ts.map