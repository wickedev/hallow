/**
 * Native gRPC Test Server
 *
 * Implements a test gRPC server using @grpc/grpc-js for testing
 * the NativeGrpcAdapter implementation.
 *
 * Provides test services for all RPC patterns:
 * - Unary RPC
 * - Server streaming RPC
 * - Client streaming RPC (future)
 * - Bidirectional streaming RPC (future)
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

/**
 * Configuration for the native gRPC test server
 */
export interface NativeGrpcServerConfig {
  /**
   * Port to listen on
   * @default 50051
   */
  port?: number;

  /**
   * Host to bind to
   * @default '127.0.0.1'
   */
  host?: string;

  /**
   * Use SSL/TLS
   * @default false
   */
  secure?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * In-memory user storage for testing
 */
interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Native gRPC Test Server
 *
 * Provides a fully-functional gRPC server for testing native gRPC
 * adapter implementation. Supports unary and server streaming RPCs.
 *
 * @example
 * ```typescript
 * const server = new NativeGrpcTestServer({ port: 50051 });
 * await server.start();
 * try {
 *   // Run tests...
 * } finally {
 *   await server.stop();
 * }
 * ```
 */
export class NativeGrpcTestServer {
  private server: grpc.Server;
  private port: number;
  private host: string;
  private secure: boolean;
  private debug: boolean;
  private isRunning: boolean = false;
  private users: Map<string, User> = new Map();

  /**
   * Create a new native gRPC test server
   *
   * @param config - Server configuration
   */
  constructor(config: NativeGrpcServerConfig = {}) {
    this.port = config.port ?? 50051;
    this.host = config.host ?? '127.0.0.1';
    this.secure = config.secure ?? false;
    this.debug = config.debug ?? false;

    this.server = new grpc.Server();

    // Initialize test data
    this.initializeTestData();

    // Load proto definition and add service
    this.loadServices();
  }

  /**
   * Initialize test data (in-memory users)
   * @private
   */
  private initializeTestData(): void {
    // Add some test users
    this.users.set('1', { id: '1', name: 'Alice', email: 'alice@example.com' });
    this.users.set('2', { id: '2', name: 'Bob', email: 'bob@example.com' });
    this.users.set('3', { id: '3', name: 'Charlie', email: 'charlie@example.com' });
    this.users.set('4', { id: '4', name: 'Diana', email: 'diana@example.com' });
    this.users.set('5', { id: '5', name: 'Eve', email: 'eve@example.com' });
  }

  /**
   * Load proto definition and register services
   * @private
   */
  private loadServices(): void {
    // Load proto file
    const PROTO_PATH = path.join(__dirname, '../proto/service.proto');

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

    // Get UserService definition
    const userService = protoDescriptor.test.services.UserService.service;

    // Register service implementation
    this.server.addService(userService, {
      GetUser: this.handleGetUser.bind(this),
      ListUsers: this.handleListUsers.bind(this),
    });

    if (this.debug) {
      console.log('[NativeGrpcTestServer] Services loaded and registered');
    }
  }

  /**
   * Handle GetUser unary RPC
   * @private
   */
  private handleGetUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    const userId = call.request.user_id;

    if (this.debug) {
      console.log(`[NativeGrpcTestServer] GetUser called: userId=${userId}`);
    }

    // Simulate error scenarios based on userId
    if (userId === 'error-not-found') {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'User not found',
        code: grpc.status.NOT_FOUND,
        details: `User with id ${userId} not found`,
        metadata: new grpc.Metadata(),
      };
      callback(error);
      return;
    }

    if (userId === 'error-internal') {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'Internal server error',
        code: grpc.status.INTERNAL,
        details: 'Simulated internal error',
        metadata: new grpc.Metadata(),
      };
      callback(error);
      return;
    }

    if (userId === 'error-unavailable') {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'Service unavailable',
        code: grpc.status.UNAVAILABLE,
        details: 'Simulated unavailability',
        metadata: new grpc.Metadata(),
      };
      callback(error);
      return;
    }

    if (userId === 'error-deadline') {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'Deadline exceeded',
        code: grpc.status.DEADLINE_EXCEEDED,
        details: 'Simulated deadline exceeded',
        metadata: new grpc.Metadata(),
      };
      callback(error);
      return;
    }

    // Get user from storage
    const user = this.users.get(userId);

    if (!user) {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'User not found',
        code: grpc.status.NOT_FOUND,
        details: `User with id ${userId} not found`,
        metadata: new grpc.Metadata(),
      };
      callback(error);
      return;
    }

    // Return user
    callback(null, {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  /**
   * Handle ListUsers server streaming RPC
   * @private
   */
  private handleListUsers(call: grpc.ServerWritableStream<any, any>): void {
    const pageSize = call.request.page_size || 10;

    if (this.debug) {
      console.log(`[NativeGrpcTestServer] ListUsers called: pageSize=${pageSize}`);
    }

    // Simulate error scenarios
    if (pageSize === -1) {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'Invalid argument',
        code: grpc.status.INVALID_ARGUMENT,
        details: 'Page size must be positive',
        metadata: new grpc.Metadata(),
      };
      call.destroy(error);
      return;
    }

    if (pageSize === -2) {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'Service unavailable',
        code: grpc.status.UNAVAILABLE,
        details: 'Simulated unavailability',
        metadata: new grpc.Metadata(),
      };
      call.destroy(error);
      return;
    }

    // Stream users
    const users = Array.from(this.users.values());
    const chunked = this.chunkArray(users, Math.max(1, pageSize));

    let index = 0;
    const sendNext = () => {
      if (index >= chunked.length) {
        call.end();
        return;
      }

      const chunk = chunked[index];
      const response = {
        users: chunk.map((u) => ({ id: u.id, name: u.name, email: u.email })),
        next_page_token: index < chunked.length - 1 ? `page_${index + 1}` : '',
      };

      call.write(response);
      index++;

      // Simulate some delay between chunks
      setTimeout(sendNext, 10);
    };

    sendNext();
  }

  /**
   * Chunk array into smaller arrays
   * @private
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Start the server
   *
   * @returns Promise that resolves when server is listening
   * @throws Error if server is already running or fails to start
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }

    return new Promise((resolve, reject) => {
      const address = `${this.host}:${this.port}`;

      // Create credentials
      const credentials = this.secure
        ? grpc.ServerCredentials.createSsl(null, [])
        : grpc.ServerCredentials.createInsecure();

      // Bind and start server
      this.server.bindAsync(address, credentials, (error, port) => {
        if (error) {
          reject(new Error(`Failed to bind server: ${error.message}`));
          return;
        }

        this.server.start();
        this.isRunning = true;
        this.port = port;

        if (this.debug) {
          console.log(`[NativeGrpcTestServer] Server started on ${address}`);
        }

        resolve();
      });
    });
  }

  /**
   * Stop the server
   *
   * @returns Promise that resolves when server has stopped
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        this.isRunning = false;

        if (this.debug) {
          console.log('[NativeGrpcTestServer] Server stopped');
        }

        resolve();
      });
    });
  }

  /**
   * Force shutdown the server immediately
   *
   * Use this if graceful shutdown hangs.
   */
  forceShutdown(): void {
    if (!this.isRunning) {
      return;
    }

    this.server.forceShutdown();
    this.isRunning = false;

    if (this.debug) {
      console.log('[NativeGrpcTestServer] Server force shutdown');
    }
  }

  /**
   * Check if server is running
   *
   * @returns true if server is currently running
   */
  isListening(): boolean {
    return this.isRunning;
  }

  /**
   * Get the server address
   *
   * @returns Server address in format "host:port"
   */
  getAddress(): string {
    return `${this.host}:${this.port}`;
  }

  /**
   * Get the port the server is listening on
   *
   * @returns Port number
   */
  getPort(): number {
    return this.port;
  }

  /**
   * Add a user to the test data
   *
   * @param user - User to add
   */
  addUser(user: User): void {
    this.users.set(user.id, user);

    if (this.debug) {
      console.log(`[NativeGrpcTestServer] User added: ${user.id}`);
    }
  }

  /**
   * Clear all users from test data
   */
  clearUsers(): void {
    this.users.clear();

    if (this.debug) {
      console.log('[NativeGrpcTestServer] All users cleared');
    }
  }

  /**
   * Reset to initial test data
   */
  resetUsers(): void {
    this.users.clear();
    this.initializeTestData();

    if (this.debug) {
      console.log('[NativeGrpcTestServer] Users reset to initial data');
    }
  }
}
