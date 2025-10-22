/**
 * Jest setup file for integration tests
 * Provides necessary globals for grpc-web in Node.js environment
 */

// Polyfill 'self' for grpc-web library which expects browser globals
(global as any).self = global;
