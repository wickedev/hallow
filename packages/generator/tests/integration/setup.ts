/**
 * Integration Test Setup
 *
 * Provides automated test server management for integration tests.
 * Automatically starts and stops test server and Envoy proxy before/after tests.
 */

import { TestGrpcServer } from '../../../../test-server/src/TestGrpcServer';

/**
 * Global test server instance
 */
let testServer: TestGrpcServer | null = null;

/**
 * Test server configuration
 */
export const TEST_CONFIG = {
  HTTP_PORT: 3100,
  GRPC_PORT: 50151,
  ENVOY_PORT: 8180,
  DEBUG: process.env.TEST_DEBUG === 'true',
};

/**
 * Get test server URLs for client connections
 */
export function getTestServerUrls() {
  return {
    http: `http://localhost:${TEST_CONFIG.HTTP_PORT}`,
    grpc: `localhost:${TEST_CONFIG.GRPC_PORT}`,
    envoy: `http://localhost:${TEST_CONFIG.ENVOY_PORT}`,
  };
}

/**
 * Start test server before all tests
 *
 * Call this in your test suite's beforeAll hook:
 * ```
 * beforeAll(async () => {
 *   await startTestServer();
 * });
 * ```
 */
export async function startTestServer(): Promise<void> {
  if (testServer) {
    console.warn('Test server is already running');
    return;
  }

  try {
    console.log('🔧 Starting test server for integration tests...');

    testServer = new TestGrpcServer({
      httpPort: TEST_CONFIG.HTTP_PORT,
      grpcPort: TEST_CONFIG.GRPC_PORT,
      debug: TEST_CONFIG.DEBUG,
    });

    await testServer.start();

    // Wait for server to be fully ready
    const isHealthy = await testServer.isHealthy();
    if (!isHealthy) {
      throw new Error('Test server health check failed');
    }

    console.log('✅ Test server started successfully');
    console.log(`   HTTP: ${getTestServerUrls().http}`);
    console.log(`   gRPC: ${getTestServerUrls().grpc}`);
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
    await stopTestServer();
    throw error;
  }
}

/**
 * Stop test server after all tests
 *
 * Call this in your test suite's afterAll hook:
 * ```
 * afterAll(async () => {
 *   await stopTestServer();
 * });
 * ```
 */
export async function stopTestServer(): Promise<void> {
  if (!testServer) {
    return;
  }

  try {
    console.log('🛑 Stopping test server...');
    await testServer.stop();
    testServer = null;
    console.log('✅ Test server stopped successfully');
  } catch (error) {
    console.error('❌ Error stopping test server:', error);
    testServer = null;
    throw error;
  }
}

/**
 * Check if test server is healthy
 */
export async function isTestServerHealthy(): Promise<boolean> {
  if (!testServer) {
    return false;
  }

  return testServer.isHealthy();
}

/**
 * Get test server instance (for advanced usage)
 */
export function getTestServer(): TestGrpcServer | null {
  return testServer;
}

/**
 * Wait for test server to be ready (optional retry logic)
 */
export async function waitForTestServer(maxAttempts = 30, delayMs = 200): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isTestServerHealthy()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error(`Test server failed to become ready after ${(maxAttempts * delayMs) / 1000}s`);
}
