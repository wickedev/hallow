/**
 * Type definitions for transport adapters
 *
 * This module provides common type definitions used across different
 * gRPC transport adapters (GrpcWebAdapter, NativeGrpcAdapter).
 */

import { Observable } from 'rxjs';
import {
  GrpcError,
  GrpcStatusCode,
  isGrpcError,
  type GrpcErrorDetails,
} from './errors';

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
 * Re-export error types from errors module for convenience
 *
 * These types are defined in the errors/ directory but re-exported
 * here for backward compatibility and convenience.
 */
export { GrpcError, GrpcStatusCode, isGrpcError, type GrpcErrorDetails };

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
