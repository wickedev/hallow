/**
 * useGrpc hook - React hook for unary gRPC calls with adapter support
 *
 * This hook provides a simple interface for making unary gRPC calls from React components.
 * It handles loading states, error handling, and automatic adapter selection based on
 * the runtime environment.
 *
 * Features:
 * - Automatic adapter selection (grpc-web or native gRPC)
 * - Loading and error state management
 * - Manual refetch capability
 * - Proper cleanup on unmount
 * - TypeScript type safety
 *
 * @example
 * ```typescript
 * import { useGrpc } from '@hallow/react';
 * import { UserServiceStub } from './user.proto';
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, loading, error, refetch } = useGrpc({
 *     serverUrl: 'https://api.example.com',
 *     method: (stub) => stub.getUser({ userId }),
 *     StubClass: UserServiceStub,
 *   });
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!data) return null;
 *
 *   return <div>User: {data.name}</div>;
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdapterFactory } from '@hallow/generator/adapters/factory/AdapterFactory';
import { ITransportAdapter, MethodDescriptor, CallOptions } from '@hallow/generator/adapters';
import { HookAdapterConfig, UseGrpcResult } from '../types';

/**
 * Configuration for useGrpc hook
 */
export interface UseGrpcConfig<TRequest, TResponse, TStub> extends HookAdapterConfig {
  /**
   * Method descriptor for the RPC call
   * If provided, request must also be provided
   */
  method?: MethodDescriptor<TRequest, TResponse>;

  /**
   * Request message
   * If provided, method must also be provided
   */
  request?: TRequest;

  /**
   * Stub class constructor that takes an adapter
   * Alternative to providing method + request
   */
  StubClass?: new (adapter: ITransportAdapter) => TStub;

  /**
   * Function that uses the stub to make a call
   * Required if StubClass is provided
   */
  stubMethod?: (stub: TStub) => Promise<TResponse>;

  /**
   * Additional call options (metadata, timeout, etc.)
   */
  callOptions?: CallOptions;

  /**
   * Whether to automatically execute the call on mount
   * @default true
   */
  immediate?: boolean;

  /**
   * Callback when data is successfully loaded
   */
  onSuccess?: (data: TResponse) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Dependencies array - call will re-execute when these change
   */
  deps?: any[];
}

/**
 * useGrpc hook - Execute unary gRPC calls with automatic adapter selection
 *
 * Supports two usage patterns:
 * 1. Direct method descriptor: Provide method + request
 * 2. Stub-based: Provide StubClass + stubMethod
 *
 * The hook automatically selects the appropriate adapter (grpc-web or native gRPC)
 * based on the runtime environment and configuration.
 *
 * @template TRequest - Type of request message
 * @template TResponse - Type of response message
 * @template TStub - Type of service stub (if using stub-based pattern)
 * @param config - Hook configuration
 * @returns Result object with data, loading, error, and refetch
 */
export function useGrpc<TRequest = any, TResponse = any, TStub = any>(
  config: UseGrpcConfig<TRequest, TResponse, TStub>
): UseGrpcResult<TResponse> {
  const {
    serverUrl,
    method,
    request,
    StubClass,
    stubMethod,
    callOptions,
    immediate = true,
    onSuccess,
    onError,
    deps = [],
    ...adapterConfig
  } = config;

  // State management
  const [data, setData] = useState<TResponse | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(immediate);

  // Refs to avoid stale closures
  const adapterRef = useRef<ITransportAdapter | null>(null);
  const mountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Validate configuration
  useEffect(() => {
    if (!serverUrl) {
      throw new Error('useGrpc: serverUrl is required');
    }

    // Validate usage pattern
    const hasMethodPattern = method && request !== undefined;
    const hasStubPattern = StubClass && stubMethod;

    if (!hasMethodPattern && !hasStubPattern) {
      throw new Error(
        'useGrpc: Either (method + request) or (StubClass + stubMethod) must be provided'
      );
    }

    if (hasMethodPattern && hasStubPattern) {
      console.warn(
        'useGrpc: Both patterns provided. Using method + request pattern.'
      );
    }
  }, [serverUrl, method, request, StubClass, stubMethod]);

  // Create adapter on mount
  useEffect(() => {
    try {
      adapterRef.current = AdapterFactory.create({
        serverUrl,
        ...adapterConfig,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      if (onError) {
        onError(error);
      }
    }

    return () => {
      mountedRef.current = false;
      if (adapterRef.current) {
        adapterRef.current.close();
        adapterRef.current = null;
      }
    };
  }, [serverUrl, JSON.stringify(adapterConfig)]);

  // Execute the RPC call
  const execute = useCallback(async () => {
    if (!adapterRef.current) {
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(undefined);

    try {
      let result: TResponse;

      // Use method + request pattern
      if (method && request !== undefined) {
        const options: CallOptions = {
          ...callOptions,
          signal: abortControllerRef.current.signal,
        };

        result = await adapterRef.current.unary(
          method,
          request,
          options
        );
      }
      // Use stub-based pattern
      else if (StubClass && stubMethod) {
        const stub = new StubClass(adapterRef.current);
        result = await stubMethod(stub);
      }
      else {
        throw new Error('Invalid configuration');
      }

      if (mountedRef.current) {
        setData(result);
        setLoading(false);
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));

      if (mountedRef.current) {
        setError(error);
        setLoading(false);
        if (onError) {
          onError(error);
        }
      }
    }
  }, [
    method,
    request,
    StubClass,
    stubMethod,
    callOptions,
    onSuccess,
    onError,
    ...deps,
  ]);

  // Execute on mount or when dependencies change
  useEffect(() => {
    if (immediate && adapterRef.current) {
      execute();
    }
  }, [execute, immediate]);

  // Refetch function
  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    error,
    loading,
    refetch,
  };
}

/**
 * Default export for convenience
 */
export default useGrpc;
