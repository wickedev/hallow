/**
 * useGrpcStream hook - React hook for server streaming gRPC calls
 *
 * This hook provides a simple interface for consuming server streaming gRPC calls
 * from React components. It handles stream lifecycle, accumulates messages, and
 * manages loading/error states.
 *
 * Features:
 * - Automatic adapter selection (grpc-web or native gRPC)
 * - Message accumulation with access to latest message
 * - Stream lifecycle management (start, data, error, complete, cancel)
 * - Automatic cleanup on unmount
 * - TypeScript type safety
 * - Manual stream control (cancel, restart)
 *
 * @example
 * ```typescript
 * import { useGrpcStream } from '@hallow/react';
 * import { ChatServiceStub } from './chat.proto';
 *
 * function ChatMessages({ roomId }: { roomId: string }) {
 *   const {
 *     messages,
 *     latestMessage,
 *     streaming,
 *     completed,
 *     error,
 *     cancel,
 *     restart,
 *   } = useGrpcStream({
 *     serverUrl: 'https://api.example.com',
 *     StubClass: ChatServiceStub,
 *     stubMethod: (stub) => stub.streamMessages({ roomId }),
 *   });
 *
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {messages.map((msg, i) => (
 *         <div key={i}>{msg.text}</div>
 *       ))}
 *       {streaming && <div>Loading more...</div>}
 *       {completed && <div>Stream complete</div>}
 *       <button onClick={cancel}>Stop</button>
 *       <button onClick={restart}>Restart</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Subscription } from 'rxjs';
import { AdapterFactory } from '@hallow/generator/adapters/factory/AdapterFactory';
import { ITransportAdapter, MethodDescriptor, CallOptions } from '@hallow/generator/adapters';
import { HookAdapterConfig, UseGrpcStreamResult } from '../types';

/**
 * Configuration for useGrpcStream hook
 */
export interface UseGrpcStreamConfig<TRequest, TResponse, TStub>
  extends HookAdapterConfig {
  /**
   * Method descriptor for the streaming RPC call
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
   * Function that uses the stub to create a streaming call
   * Should return an Observable of responses
   * Required if StubClass is provided
   */
  stubMethod?: (stub: TStub) => { subscribe: (observer: any) => { unsubscribe: () => void } };

  /**
   * Additional call options (metadata, timeout, etc.)
   */
  callOptions?: CallOptions;

  /**
   * Whether to automatically start streaming on mount
   * @default true
   */
  immediate?: boolean;

  /**
   * Callback when a message is received
   */
  onMessage?: (message: TResponse) => void;

  /**
   * Callback when the stream completes successfully
   */
  onComplete?: () => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Maximum number of messages to keep in memory
   * Older messages will be discarded when limit is reached
   * @default undefined (unlimited)
   */
  maxMessages?: number;

  /**
   * Dependencies array - stream will restart when these change
   */
  deps?: any[];
}

/**
 * useGrpcStream hook - Execute server streaming gRPC calls with automatic lifecycle management
 *
 * This hook manages the lifecycle of a server streaming RPC call, accumulating
 * messages and providing access to the stream state. It automatically creates
 * an adapter, subscribes to the stream, and cleans up resources on unmount.
 *
 * Supports two usage patterns:
 * 1. Direct method descriptor: Provide method + request
 * 2. Stub-based: Provide StubClass + stubMethod
 *
 * The hook automatically selects the appropriate adapter (grpc-web or native gRPC)
 * based on the runtime environment and configuration.
 *
 * @template TRequest - Type of request message
 * @template TResponse - Type of response messages
 * @template TStub - Type of service stub (if using stub-based pattern)
 * @param config - Hook configuration
 * @returns Result object with messages, streaming state, and control functions
 */
export function useGrpcStream<TRequest = any, TResponse = any, TStub = any>(
  config: UseGrpcStreamConfig<TRequest, TResponse, TStub>
): UseGrpcStreamResult<TResponse> {
  const {
    serverUrl,
    method,
    request,
    StubClass,
    stubMethod,
    callOptions,
    immediate = true,
    onMessage,
    onComplete,
    onError,
    maxMessages,
    deps = [],
    ...adapterConfig
  } = config;

  // State management
  const [messages, setMessages] = useState<TResponse[]>([]);
  const [latestMessage, setLatestMessage] = useState<TResponse | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  // Refs to avoid stale closures
  const adapterRef = useRef<ITransportAdapter | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const mountedRef = useRef<boolean>(true);

  // Validate configuration
  useEffect(() => {
    if (!serverUrl) {
      throw new Error('useGrpcStream: serverUrl is required');
    }

    // Validate usage pattern
    const hasMethodPattern = method && request !== undefined;
    const hasStubPattern = StubClass && stubMethod;

    if (!hasMethodPattern && !hasStubPattern) {
      throw new Error(
        'useGrpcStream: Either (method + request) or (StubClass + stubMethod) must be provided'
      );
    }

    if (hasMethodPattern && hasStubPattern) {
      console.warn(
        'useGrpcStream: Both patterns provided. Using method + request pattern.'
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
      if (onError) {
        onError(error);
      }
    }

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (adapterRef.current) {
        adapterRef.current.close();
        adapterRef.current = null;
      }
    };
  }, [serverUrl, JSON.stringify(adapterConfig)]);

  // Start the stream
  const startStream = useCallback(() => {
    if (!adapterRef.current) {
      return;
    }

    // Cancel any existing stream
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Reset state
    setMessages([]);
    setLatestMessage(undefined);
    setError(undefined);
    setStreaming(true);
    setCompleted(false);

    try {
      let observable: any;

      // Use method + request pattern
      if (method && request !== undefined) {
        observable = adapterRef.current.serverStream(
          method,
          request,
          callOptions
        );
      }
      // Use stub-based pattern
      else if (StubClass && stubMethod) {
        const stub = new StubClass(adapterRef.current);
        const streamCall = stubMethod(stub);
        observable = streamCall;
      }
      else {
        throw new Error('Invalid configuration');
      }

      // Subscribe to the stream
      subscriptionRef.current = observable.subscribe({
        next: (message: TResponse) => {
          if (!mountedRef.current) return;

          setMessages((prev) => {
            const newMessages = [...prev, message];
            // Apply max messages limit if specified
            if (maxMessages && newMessages.length > maxMessages) {
              return newMessages.slice(newMessages.length - maxMessages);
            }
            return newMessages;
          });
          setLatestMessage(message);

          if (onMessage) {
            onMessage(message);
          }
        },
        error: (err: Error) => {
          if (!mountedRef.current) return;

          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setStreaming(false);

          if (onError) {
            onError(error);
          }
        },
        complete: () => {
          if (!mountedRef.current) return;

          setStreaming(false);
          setCompleted(true);

          if (onComplete) {
            onComplete();
          }
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (mountedRef.current) {
        setError(error);
        setStreaming(false);

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
    onMessage,
    onComplete,
    onError,
    maxMessages,
    ...deps,
  ]);

  // Cancel the stream
  const cancel = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
      setStreaming(false);
    }
  }, []);

  // Restart the stream
  const restart = useCallback(() => {
    cancel();
    startStream();
  }, [cancel, startStream]);

  // Start stream on mount or when dependencies change
  useEffect(() => {
    if (immediate && adapterRef.current) {
      startStream();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [startStream, immediate]);

  return {
    messages,
    latestMessage,
    error,
    streaming,
    completed,
    cancel,
    restart,
  };
}

/**
 * Default export for convenience
 */
export default useGrpcStream;
