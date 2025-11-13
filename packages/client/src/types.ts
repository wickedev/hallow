/**
 * Type definitions for gRPC-web client
 */

import { grpc } from '@improbable-eng/grpc-web';

/**
 * gRPC method types
 */
export enum MethodType {
  UNARY = 'unary',
  SERVER_STREAMING = 'server_streaming',
  CLIENT_STREAMING = 'client_streaming',
  BIDI_STREAMING = 'bidi_streaming',
}

/**
 * gRPC status codes
 */
export { Code as StatusCode } from '@improbable-eng/grpc-web';

/**
 * gRPC error with status code
 */
export interface GrpcError extends Error {
  code: grpc.Code;
  metadata?: grpc.Metadata;
}

/**
 * gRPC call options
 */
export interface CallOptions {
  deadline?: Date | number;
  metadata?: grpc.Metadata;
  credentials?: grpc.CallCredentials;
}

/**
 * Unary method definition
 */
export interface UnaryMethodDefinition<TRequest, TResponse> {
  methodName: string;
  service: { serviceName: string };
  requestStream: false;
  responseStream: false;
  requestType: { new (): TRequest };
  responseType: { new (): TResponse };
}

/**
 * Server streaming method definition
 */
export interface ServerStreamingMethodDefinition<TRequest, TResponse> {
  methodName: string;
  service: { serviceName: string };
  requestStream: false;
  responseStream: true;
  requestType: { new (): TRequest };
  responseType: { new (): TResponse };
}

/**
 * Client streaming method definition
 */
export interface ClientStreamingMethodDefinition<TRequest, TResponse> {
  methodName: string;
  service: { serviceName: string };
  requestStream: true;
  responseStream: false;
  requestType: { new (): TRequest };
  responseType: { new (): TResponse };
}

/**
 * Bidirectional streaming method definition
 */
export interface BidiStreamingMethodDefinition<TRequest, TResponse> {
  methodName: string;
  service: { serviceName: string };
  requestStream: true;
  responseStream: true;
  requestType: { new (): TRequest };
  responseType: { new (): TResponse };
}

/**
 * Type guard for unary methods
 */
export function isUnaryMethod(
  method: any
): method is UnaryMethodDefinition<any, any> {
  return !method.requestStream && !method.responseStream;
}

/**
 * Type guard for server streaming methods
 */
export function isServerStreamingMethod(
  method: any
): method is ServerStreamingMethodDefinition<any, any> {
  return !method.requestStream && method.responseStream;
}

/**
 * Type guard for client streaming methods
 */
export function isClientStreamingMethod(
  method: any
): method is ClientStreamingMethodDefinition<any, any> {
  return method.requestStream && !method.responseStream;
}

/**
 * Type guard for bidirectional streaming methods
 */
export function isBidiStreamingMethod(
  method: any
): method is BidiStreamingMethodDefinition<any, any> {
  return method.requestStream && method.responseStream;
}
