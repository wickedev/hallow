/**
 * Mock implementation for .proto file imports in tests
 */

// Mock gRPC response types
export interface MockGreetResponse {
  reply: string;
  timestamp: string;
  metadata?: {
    server_version?: string;
    request_id?: string;
    [key: string]: any;
  };
}

export interface MockGreetRequest {
  name: string;
  language?: string;
  options?: {
    style?: number;
    include_timestamp?: boolean;
    metadata?: Record<string, string>;
  };
}

// Mock stub implementation
export class MockGreetingServiceStub {
  private serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  methods = {
    greet: jest.fn().mockImplementation(
      async (request: MockGreetRequest): Promise<MockGreetResponse> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Return mock response
        return {
          reply: `Hello, ${request.name}!`,
          timestamp: new Date().toISOString(),
          metadata: {
            server_version: '1.0.0',
            request_id: 'test-request-id',
          },
        };
      }
    ),

    streamGreetings: jest.fn(),
    accumulateGreetings: jest.fn(),
    chat: jest.fn(),
  };
}

// Default export for proto module
export const GreetingServiceStub = MockGreetingServiceStub;

// Export mock factory for custom behavior
export const createMockStub = (overrides?: Partial<MockGreetingServiceStub>) => {
  const stub = new MockGreetingServiceStub('http://localhost:3000');
  if (overrides) {
    Object.assign(stub, overrides);
  }
  return stub;
};

// Helper to create mock error responses
export const createMockError = (message: string, code = 'UNKNOWN') => {
  const error = new Error(message) as any;
  error.code = code;
  return error;
};

// Helper to create mock streaming responses
export const createMockStream = (responses: MockGreetResponse[]) => {
  let index = 0;
  return {
    [Symbol.asyncIterator]: async function* () {
      while (index < responses.length) {
        yield responses[index++];
      }
    },
  };
};
