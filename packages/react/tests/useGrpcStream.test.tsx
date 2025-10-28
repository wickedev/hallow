/**
 * Tests for useGrpcStream hook
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { Subject } from 'rxjs';
import { useGrpcStream } from '../src/hooks/useGrpcStream';
import { AdapterFactory } from '@hallow/generator/adapters/factory/AdapterFactory';

// Mock AdapterFactory
jest.mock('@hallow/generator/adapters/factory/AdapterFactory');

describe('useGrpcStream', () => {
  let mockAdapter: any;
  let mockStream: Subject<any>;

  beforeEach(() => {
    mockStream = new Subject();

    // Create mock adapter
    mockAdapter = {
      serverStream: jest.fn().mockReturnValue(mockStream),
      close: jest.fn(),
    };

    // Mock AdapterFactory.create
    (AdapterFactory.create as jest.Mock).mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockStream.complete();
  });

  describe('configuration validation', () => {
    it('should throw error if serverUrl is missing', () => {
      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: '',
          method: {} as any,
          request: {},
        })
      );

      expect(result.error).toBeDefined();
    });

    it('should throw error if neither pattern is provided', () => {
      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
        } as any)
      );

      expect(result.error).toBeDefined();
    });
  });

  describe('method + request pattern', () => {
    it('should accumulate messages from stream', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
        })
      );

      expect(result.current.streaming).toBe(true);
      expect(result.current.messages).toEqual([]);

      // Emit messages
      act(() => {
        mockStream.next({ id: 1, text: 'Message 1' });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      expect(result.current.messages[0]).toEqual({ id: 1, text: 'Message 1' });
      expect(result.current.latestMessage).toEqual({ id: 1, text: 'Message 1' });

      act(() => {
        mockStream.next({ id: 2, text: 'Message 2' });
        mockStream.next({ id: 3, text: 'Message 3' });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      expect(result.current.latestMessage).toEqual({ id: 3, text: 'Message 3' });
    });

    it('should handle stream completion', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
        })
      );

      expect(result.current.completed).toBe(false);

      act(() => {
        mockStream.complete();
      });

      await waitFor(() => {
        expect(result.current.completed).toBe(true);
      });

      expect(result.current.streaming).toBe(false);
    });

    it('should handle stream errors', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };
      const mockError = new Error('Stream error');

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
        })
      );

      act(() => {
        mockStream.error(mockError);
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });

      expect(result.current.streaming).toBe(false);
    });
  });

  describe('stub-based pattern', () => {
    it('should work with stub method', async () => {
      const mockStreamCall = mockStream;

      class MockStub {
        constructor(adapter: any) {}
        streamMessages = jest.fn().mockReturnValue(mockStreamCall);
      }

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          StubClass: MockStub as any,
          stubMethod: (stub: any) => stub.streamMessages({ roomId: '123' }),
        })
      );

      act(() => {
        mockStream.next({ text: 'Hello' });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });
    });
  });

  describe('lifecycle', () => {
    it('should not start streaming immediately if immediate is false', () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          immediate: false,
        })
      );

      expect(result.current.streaming).toBe(false);
      expect(mockAdapter.serverStream).not.toHaveBeenCalled();
    });

    it('should cleanup on unmount', () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { unmount } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
        })
      );

      unmount();

      expect(mockAdapter.close).toHaveBeenCalled();
    });

    it('should support cancel', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
        })
      );

      expect(result.current.streaming).toBe(true);

      act(() => {
        result.current.cancel();
      });

      await waitFor(() => {
        expect(result.current.streaming).toBe(false);
      });
    });

    it('should support restart', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
        })
      );

      // Add some messages
      act(() => {
        mockStream.next({ id: 1 });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      // Restart
      act(() => {
        result.current.restart();
      });

      await waitFor(() => {
        // Messages should be cleared
        expect(result.current.messages).toEqual([]);
      });

      expect(result.current.streaming).toBe(true);
    });
  });

  describe('message limiting', () => {
    it('should limit messages when maxMessages is set', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { result } = renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          maxMessages: 3,
        })
      );

      // Emit 5 messages
      act(() => {
        mockStream.next({ id: 1 });
        mockStream.next({ id: 2 });
        mockStream.next({ id: 3 });
        mockStream.next({ id: 4 });
        mockStream.next({ id: 5 });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      // Should keep last 3 messages
      expect(result.current.messages).toEqual([
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ]);
    });
  });

  describe('callbacks', () => {
    it('should call onMessage callback', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };
      const onMessage = jest.fn();

      renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          onMessage,
        })
      );

      act(() => {
        mockStream.next({ text: 'Hello' });
      });

      await waitFor(() => {
        expect(onMessage).toHaveBeenCalledWith({ text: 'Hello' });
      });
    });

    it('should call onComplete callback', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };
      const onComplete = jest.fn();

      renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          onComplete,
        })
      );

      act(() => {
        mockStream.complete();
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should call onError callback', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'StreamMethod',
        requestStream: false,
        responseStream: true,
        requestType: {} as any,
        responseType: {} as any,
      };
      const mockError = new Error('Test error');
      const onError = jest.fn();

      renderHook(() =>
        useGrpcStream({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          onError,
        })
      );

      act(() => {
        mockStream.error(mockError);
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError);
      });
    });
  });
});
