/**
 * Tests for useGrpc hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useGrpc } from '../src/hooks/useGrpc';
import { AdapterFactory } from '@hallow/generator/adapters/factory/AdapterFactory';

// Mock AdapterFactory
jest.mock('@hallow/generator/adapters/factory/AdapterFactory');

describe('useGrpc', () => {
  let mockAdapter: any;

  beforeEach(() => {
    // Create mock adapter
    mockAdapter = {
      unary: jest.fn(),
      close: jest.fn(),
    };

    // Mock AdapterFactory.create
    (AdapterFactory.create as jest.Mock).mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('configuration validation', () => {
    it('should throw error if serverUrl is missing', () => {
      const { result } = renderHook(() =>
        useGrpc({
          serverUrl: '',
          method: {} as any,
          request: {},
        })
      );

      expect(result.error).toBeDefined();
    });

    it('should throw error if neither pattern is provided', () => {
      const { result } = renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
        } as any)
      );

      expect(result.error).toBeDefined();
    });
  });

  describe('method + request pattern', () => {
    it('should call unary with method and request', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'TestMethod',
        requestStream: false,
        responseStream: false,
        requestType: {} as any,
        responseType: {} as any,
      };
      const mockRequest = { id: '123' };
      const mockResponse = { name: 'Test User' };

      mockAdapter.unary.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: mockRequest,
        })
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();

      // Wait for completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeUndefined();
      expect(mockAdapter.unary).toHaveBeenCalledWith(
        mockMethod,
        mockRequest,
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'TestMethod',
        requestStream: false,
        responseStream: false,
        requestType: {} as any,
        responseType: {} as any,
      };
      const mockRequest = { id: '123' };
      const mockError = new Error('Test error');

      mockAdapter.unary.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: mockRequest,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('stub-based pattern', () => {
    it('should call stub method', async () => {
      const mockResponse = { name: 'Test User' };
      const mockStubMethod = jest.fn().mockResolvedValue(mockResponse);

      class MockStub {
        constructor(adapter: any) {}
        getUser = mockStubMethod;
      }

      const { result } = renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          StubClass: MockStub as any,
          stubMethod: (stub: any) => stub.getUser({ id: '123' }),
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockStubMethod).toHaveBeenCalledWith({ id: '123' });
    });
  });

  describe('lifecycle', () => {
    it('should not execute immediately if immediate is false', () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'TestMethod',
        requestStream: false,
        responseStream: false,
        requestType: {} as any,
        responseType: {} as any,
      };

      renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          immediate: false,
        })
      );

      expect(mockAdapter.unary).not.toHaveBeenCalled();
    });

    it('should cleanup adapter on unmount', () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'TestMethod',
        requestStream: false,
        responseStream: false,
        requestType: {} as any,
        responseType: {} as any,
      };

      const { unmount } = renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          immediate: false,
        })
      );

      unmount();

      expect(mockAdapter.close).toHaveBeenCalled();
    });

    it('should support refetch', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'TestMethod',
        requestStream: false,
        responseStream: false,
        requestType: {} as any,
        responseType: {} as any,
      };
      const mockRequest = { id: '123' };
      const mockResponse = { name: 'Test User' };

      mockAdapter.unary.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: mockRequest,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockAdapter.unary).toHaveBeenCalledTimes(1);

      // Refetch
      result.current.refetch();

      await waitFor(() => {
        expect(mockAdapter.unary).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('callbacks', () => {
    it('should call onSuccess callback', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'TestMethod',
        requestStream: false,
        responseStream: false,
        requestType: {} as any,
        responseType: {} as any,
      };
      const mockResponse = { name: 'Test User' };
      const onSuccess = jest.fn();

      mockAdapter.unary.mockResolvedValue(mockResponse);

      renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          onSuccess,
        })
      );

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('should call onError callback', async () => {
      const mockMethod = {
        serviceName: 'TestService',
        methodName: 'TestMethod',
        requestStream: false,
        responseStream: false,
        requestType: {} as any,
        responseType: {} as any,
      };
      const mockError = new Error('Test error');
      const onError = jest.fn();

      mockAdapter.unary.mockRejectedValue(mockError);

      renderHook(() =>
        useGrpc({
          serverUrl: 'http://localhost:50051',
          method: mockMethod,
          request: {},
          onError,
        })
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError);
      });
    });
  });
});
