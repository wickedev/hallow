/**
 * Type definitions for transport adapters
 *
 * This module provides common type definitions used across different
 * gRPC transport adapters (GrpcWebAdapter, NativeGrpcAdapter).
 */

import { Observable } from 'rxjs';

/**
 * Message type interface for serialization/deserialization
 *
 * All protobuf message types must implement this interface to work
 * with the transport adapters.
 */
export interface MessageType<T> {
  /**
   * Deserialize binary data into a message instance
   * @param bytes - Binary representation of the message
   * @returns Deserialized message object
   */
  deserializeBinary(bytes: Uint8Array): T;

  /**
   * Serialize a message instance into binary data
   * @param message - Message object to serialize
   * @returns Binary representation of the message
   */
  serializeBinary(message: T): Uint8Array;
}

/**
 * Method descriptor containing metadata about an RPC method
 *
 * This descriptor is used by adapters to make RPC calls with proper
 * serialization, routing, and type safety.
 */
export interface MethodDescriptor<TRequest = any, TResponse = any> {
  /**
   * Fully qualified service name (e.g., "user.UserService")
   */
  serviceName: string;

  /**
   * Method name (e.g., "GetUser")
   */
  methodName: string;

  /**
   * Whether the request is streamed from client
   */
  requestStream: boolean;

  /**
   * Whether the response is streamed from server
   */
  responseStream: boolean;

  /**
   * Request message type with serialization methods
   */
  requestType: MessageType<TRequest>;

  /**
   * Response message type with serialization methods
   */
  responseType: MessageType<TResponse>;
}

/**
 * Metadata for RPC calls
 *
 * Represents HTTP headers sent with requests or received with responses.
 * Keys are case-insensitive. Binary headers must have keys ending with "-bin".
 */
export interface Metadata {
  /**
   * Get all values for a metadata key
   * @param key - Metadata key (case-insensitive)
   * @returns Array of values for the key, or undefined if key doesn't exist
   */
  get(key: string): string[] | undefined;

  /**
   * Set a metadata key to a single value
   * @param key - Metadata key (case-insensitive)
   * @param value - String value or Buffer for binary headers
   */
  set(key: string, value: string | Buffer): void;

  /**
   * Add a value to a metadata key (supports multiple values)
   * @param key - Metadata key (case-insensitive)
   * @param value - String value or Buffer for binary headers
   */
  add(key: string, value: string | Buffer): void;

  /**
   * Remove all values for a metadata key
   * @param key - Metadata key (case-insensitive)
   */
  remove(key: string): void;

  /**
   * Get all metadata as a plain object
   * @returns Object mapping keys to arrays of values
   */
  getMap(): Record<string, string[]>;
}

/**
 * Options for making RPC calls
 */
export interface CallOptions {
  /**
   * Request timeout in milliseconds
   * If not specified, no timeout is enforced by the client.
   */
  timeout?: number;

  /**
   * Absolute deadline for the call (timestamp in milliseconds)
   * Overrides timeout if both are specified.
   */
  deadline?: number;

  /**
   * Custom metadata to send with the request
   */
  metadata?: Metadata | Record<string, string>;

  /**
   * AbortSignal for cancelling the request
   */
  signal?: AbortSignal;
}

/**
 * Client streaming call interface
 *
 * Provides methods for sending multiple requests and receiving a single response.
 * Used for client streaming and bidirectional streaming RPC patterns.
 */
export interface ClientStreamingCall<TRequest, TResponse> {
  /**
   * Write a request message to the stream
   * @param request - Request message to send
   * @throws Error if stream is closed or not writable
   */
  write(request: TRequest): void;

  /**
   * Signal that no more requests will be sent
   * For client streaming, this triggers the server to send its response.
   * For bidirectional streaming, the server may continue sending responses.
   */
  end(): void;

  /**
   * Get the response from the server
   * For client streaming, this promise resolves after end() is called
   * and the server has sent its response.
   *
   * @returns Promise that resolves with the server's response
   */
  getResponse(): Promise<TResponse>;

  /**
   * Cancel the streaming call
   * Closes the stream and notifies the server.
   */
  cancel(): void;

  /**
   * Check if the stream is still writable
   */
  readonly writable: boolean;
}

/**
 * Bidirectional streaming call interface
 *
 * Provides methods for sending multiple requests and receiving multiple responses
 * concurrently. Both client and server can send messages independently.
 */
export interface BidiStreamingCall<TRequest, TResponse> {
  /**
   * Write a request message to the stream
   * @param request - Request message to send
   * @throws Error if stream is closed or not writable
   */
  write(request: TRequest): void;

  /**
   * Signal that no more requests will be sent
   * The server may continue sending responses after the client ends.
   */
  end(): void;

  /**
   * Get an Observable of response messages from the server
   * Messages can be received before, during, and after client writes.
   *
   * @returns Observable stream of response messages
   */
  responses(): Observable<TResponse>;

  /**
   * Cancel the streaming call
   * Closes both the request and response streams.
   */
  cancel(): void;

  /**
   * Check if the stream is still writable
   */
  readonly writable: boolean;
}

/**
 * gRPC status codes
 *
 * Standard gRPC status codes as defined in the gRPC specification.
 * Used for error handling across all transport adapters.
 */
export enum GrpcStatusCode {
  /** The operation completed successfully */
  OK = 0,

  /** The operation was cancelled (typically by the caller) */
  CANCELLED = 1,

  /** Unknown error */
  UNKNOWN = 2,

  /** Client specified an invalid argument */
  INVALID_ARGUMENT = 3,

  /** Deadline expired before operation could complete */
  DEADLINE_EXCEEDED = 4,

  /** Some requested entity was not found */
  NOT_FOUND = 5,

  /** Some entity that we attempted to create already exists */
  ALREADY_EXISTS = 6,

  /** The caller does not have permission to execute the operation */
  PERMISSION_DENIED = 7,

  /** Some resource has been exhausted */
  RESOURCE_EXHAUSTED = 8,

  /** Operation was rejected because the system is not in required state */
  FAILED_PRECONDITION = 9,

  /** The operation was aborted */
  ABORTED = 10,

  /** Operation was attempted past the valid range */
  OUT_OF_RANGE = 11,

  /** Operation is not implemented or not supported */
  UNIMPLEMENTED = 12,

  /** Internal error */
  INTERNAL = 13,

  /** The service is currently unavailable */
  UNAVAILABLE = 14,

  /** Unrecoverable data loss or corruption */
  DATA_LOSS = 15,

  /** The request does not have valid authentication credentials */
  UNAUTHENTICATED = 16,
}

/**
 * gRPC error class with status code and metadata
 *
 * Thrown by transport adapters when RPC calls fail.
 * Provides structured error information for proper error handling.
 */
export class GrpcError extends Error {
  /**
   * Create a new gRPC error
   * @param message - Human-readable error message
   * @param code - gRPC status code
   * @param methodName - Name of the method that failed
   * @param metadata - Optional error metadata (trailers)
   * @param details - Optional additional error details
   */
  constructor(
    message: string,
    public readonly code: GrpcStatusCode,
    public readonly methodName: string,
    public readonly metadata?: Metadata,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'GrpcError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GrpcError);
    }
  }

  /**
   * Check if error has a specific status code
   * @param code - Status code to check
   * @returns true if error has the specified code
   */
  is(code: GrpcStatusCode): boolean {
    return this.code === code;
  }

  /**
   * Get human-readable description of the status code
   * @returns Status code name (e.g., "NOT_FOUND")
   */
  getStatusName(): string {
    return GrpcStatusCode[this.code] || `UNKNOWN(${this.code})`;
  }

  /**
   * Get a user-friendly error message
   * @returns Formatted error message
   */
  toUserMessage(): string {
    return `gRPC ${this.methodName} failed: ${this.message} (${this.getStatusName()})`;
  }

  /**
   * String representation for logging
   */
  toString(): string {
    return `GrpcError: ${this.message} [${this.getStatusName()}] at ${this.methodName}`;
  }
}

/**
 * Type guard to check if an error is a GrpcError
 * @param error - Error to check
 * @returns true if error is a GrpcError instance
 */
export function isGrpcError(error: any): error is GrpcError {
  return error instanceof GrpcError;
}

/**
 * Configuration for transport adapters
 */
export interface AdapterConfig {
  /**
   * Server URL or address
   * For gRPC-web: Full HTTP(S) URL (e.g., "https://api.example.com")
   * For native gRPC: Host:port (e.g., "localhost:50051")
   */
  serverUrl: string;

  /**
   * Use TLS/SSL for the connection
   * @default false
   */
  secure?: boolean;

  /**
   * Default call options applied to all requests
   */
  defaultCallOptions?: CallOptions;

  /**
   * Debug mode - enables detailed logging
   * @default false
   */
  debug?: boolean;
}
