/**
 * useSuspenseGrpc hook - React Suspense-compatible hook for unary gRPC calls
 *
 * This hook integrates with React Suspense to provide a declarative way to handle
 * loading states for gRPC calls. It suspends rendering while the call is in progress
 * and throws errors to error boundaries.
 *
 * Features:
 * - React Suspense integration
 * - Automatic adapter selection (grpc-web or native gRPC)
 * - Error boundary integration
 * - Proper cleanup on unmount
 * - TypeScript type safety
 * - Caching support
 *
 * @example
 * ```typescript
 * import { Suspense } from 'react';
 * import { useSuspenseGrpc } from '@hallow/react';
 * import { UserServiceStub } from './user.proto';
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const user = useSuspenseGrpc({
 *     serverUrl: 'https://api.example.com',
 *     StubClass: UserServiceStub,
 *     stubMethod: (stub) => stub.getUser({ userId }),
 *   });
 *
 *   return <div>User: {user.name}</div>;
 * }
 *
 * function App() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <UserProfile userId="123" />
 *     </Suspense>
 *   );
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { AdapterFactory, ITransportAdapter, MethodDescriptor, CallOptions } from '@hallow/generator/adapters';
import { HookAdapterConfig } from '../types';

/**
 * Configuration for useSuspenseGrpc hook
 */
export interface UseSuspenseGrpcConfig<TRequest, TResponse, TStub>
  extends HookAdapterConfig {
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
   * Cache key for deduplicating requests
   * If not provided, a key is generated from the configuration
   */
  cacheKey?: string;
}

/**
 * Status of a suspended promise
 */
type PromiseStatus<T> =
  | { status: 'pending'; promise: Promise<T> }
  | { status: 'fulfilled'; data: T }
  | { status: 'rejected'; error: Error };

/**
 * Simple cache for suspended promises
 * This prevents duplicate requests for the same data
 */
const promiseCache = new Map<string, PromiseStatus<any>>();

/**
 * Generate a cache key from configuration
 */
function generateCacheKey<TRequest, TResponse, TStub>(
  config: UseSuspenseGrpcConfig<TRequest, TResponse, TStub>
): string {
  if (config.cacheKey) {
    return config.cacheKey;
  }

  const parts: string[] = [config.serverUrl];

  if (config.method) {
    parts.push(config.method.serviceName);
    parts.push(config.method.methodName);
  }

  if (config.request) {
    parts.push(JSON.stringify(config.request));
  }

  return parts.join(':');
}

/**
 * Create a suspendable promise wrapper
 */
function createSuspendablePromise<T>(
  promise: Promise<T>,
  cacheKey: string
): PromiseStatus<T> {
  const status: PromiseStatus<T> = {
    status: 'pending',
    promise,
  };

  promiseCache.set(cacheKey, status);

  promise.then(
    (data) => {
      promiseCache.set(cacheKey, {
        status: 'fulfilled',
        data,
      });
    },
    (error) => {
      promiseCache.set(cacheKey, {
        status: 'rejected',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  );

  return status;
}

/**
 * useSuspenseGrpc hook - Execute unary gRPC calls with Suspense support
 *
 * This hook throws a promise to suspend rendering while the RPC call is in progress.
 * It integrates with React's error boundaries to handle errors gracefully.
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
 * @returns Response data (suspends if not ready, throws if error)
 */
export function useSuspenseGrpc<TRequest = any, TResponse = any, TStub = any>(
  config: UseSuspenseGrpcConfig<TRequest, TResponse, TStub>
): TResponse {
  const {
    serverUrl,
    method,
    request,
    StubClass,
    stubMethod,
    callOptions,
    ...adapterConfig
  } = config;

  // Refs for cleanup
  const adapterRef = useRef<ITransportAdapter | null>(null);
  const mountedRef = useRef<boolean>(true);

  // Validate configuration
  if (!serverUrl) {
    throw new Error('useSuspenseGrpc: serverUrl is required');
  }

  const hasMethodPattern = method && request !== undefined;
  const hasStubPattern = StubClass && stubMethod;

  if (!hasMethodPattern && !hasStubPattern) {
    throw new Error(
      'useSuspenseGrpc: Either (method + request) or (StubClass + stubMethod) must be provided'
    );
  }

  // Generate cache key
  const cacheKey = generateCacheKey(config);

  // Check if we have a cached result
  const cached = promiseCache.get(cacheKey);

  if (cached) {
    if (cached.status === 'fulfilled') {
      return cached.data;
    }
    if (cached.status === 'rejected') {
      throw cached.error;
    }
    if (cached.status === 'pending') {
      // Suspend rendering by throwing the promise
      throw cached.promise;
    }
  }

  // Create adapter if needed
  if (!adapterRef.current) {
    try {
      adapterRef.current = AdapterFactory.create({
        serverUrl,
        ...adapterConfig,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw error;
    }
  }

  // Execute the RPC call
  const executeCall = async (): Promise<TResponse> => {
    if (!adapterRef.current) {
      throw new Error('Adapter not initialized');
    }

    try {
      let result: TResponse;

      // Use method + request pattern
      if (method && request !== undefined) {
        result = await adapterRef.current.unary(
          method,
          request,
          callOptions
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

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw error;
    }
  };

  // Create and cache the promise
  const promise = executeCall();
  const status = createSuspendablePromise(promise, cacheKey);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (adapterRef.current) {
        adapterRef.current.close();
        adapterRef.current = null;
      }
    };
  }, []);

  // Suspend rendering - status is always 'pending' when first created
  if (status.status === 'pending') {
    throw status.promise;
  }
  if (status.status === 'rejected') {
    throw status.error;
  }
  return status.data;
}

/**
 * Clear the promise cache
 * Useful for testing or when you want to force refetch
 */
export function clearSuspenseCache(cacheKey?: string): void {
  if (cacheKey) {
    promiseCache.delete(cacheKey);
  } else {
    promiseCache.clear();
  }
}

/**
 * Preload data for useSuspenseGrpc
 * Useful for prefetching data before rendering
 */
export function preloadGrpc<TRequest = any, TResponse = any, TStub = any>(
  config: UseSuspenseGrpcConfig<TRequest, TResponse, TStub>
): Promise<TResponse> {
  const cacheKey = generateCacheKey(config);
  const cached = promiseCache.get(cacheKey);

  if (cached && cached.status === 'fulfilled') {
    return Promise.resolve(cached.data);
  }

  if (cached && cached.status === 'rejected') {
    return Promise.reject(cached.error);
  }

  if (cached && cached.status === 'pending') {
    return cached.promise;
  }

  // Create adapter and execute call
  const adapter = AdapterFactory.create({
    serverUrl: config.serverUrl,
    adapterType: config.adapterType,
    enableNativeGrpc: config.enableNativeGrpc,
    secure: config.secure,
    debug: config.debug,
    defaultCallOptions: config.defaultCallOptions,
  });

  const promise = (async () => {
    try {
      let result: TResponse;

      if (config.method && config.request !== undefined) {
        result = await adapter.unary(
          config.method,
          config.request,
          config.callOptions
        );
      } else if (config.StubClass && config.stubMethod) {
        const stub = new config.StubClass(adapter);
        result = await config.stubMethod(stub);
      } else {
        throw new Error('Invalid configuration');
      }

      return result;
    } finally {
      adapter.close();
    }
  })();

  createSuspendablePromise(promise, cacheKey);
  return promise;
}

/**
 * Default export for convenience
 */
export default useSuspenseGrpc;
