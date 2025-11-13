import { greetingService } from '../services/greeting.service';
import * as grpc from '@grpc/grpc-js';

// Mock call interface
interface MockServerUnaryCall<RequestType> {
  request: RequestType;
  metadata: grpc.Metadata;
  getPeer: () => string;
  sendMetadata: jest.Mock;
  getDeadline: () => grpc.Deadline;
  cancelled: boolean;
}

// Mock streaming call interface
interface MockServerWritableStream<RequestType, ResponseType> {
  request: RequestType;
  metadata: grpc.Metadata;
  write: jest.Mock;
  end: jest.Mock;
  sendMetadata: jest.Mock;
  getPeer: () => string;
  getDeadline: () => grpc.Deadline;
  cancelled: boolean;
}

const createMockCall = <T>(request: T): MockServerUnaryCall<T> => ({
  request,
  metadata: new grpc.Metadata(),
  getPeer: () => '127.0.0.1:12345',
  sendMetadata: jest.fn(),
  getDeadline: () => Date.now() + 30000,
  cancelled: false,
});

const createMockStreamingCall = <Req, Res>(request: Req): MockServerWritableStream<Req, Res> => ({
  request,
  metadata: new grpc.Metadata(),
  write: jest.fn(),
  end: jest.fn(),
  sendMetadata: jest.fn(),
  getPeer: () => '127.0.0.1:12345',
  getDeadline: () => Date.now() + 30000,
  cancelled: false,
});

describe('GreetingService', () => {
  describe('Greet (Unary)', () => {
    it('returns greeting for valid request', (done) => {
      const request = {
        name: 'Alice',
        language: 'en',
        options: {
          style: 1,
          include_timestamp: true,
          metadata: {},
        },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeNull();
        expect(response).toBeDefined();
        expect(response?.reply).toContain('Alice');
        expect(response?.timestamp).toBeDefined();
        expect(response?.metadata).toBeDefined();
        expect(response?.metadata?.server_version).toBe('1.0.0');
        done();
      });
    });

    it('handles different greeting styles', (done) => {
      const styles = [1, 2, 3]; // CASUAL, FORMAL, FRIENDLY
      let completed = 0;

      styles.forEach((style) => {
        const request = {
          name: 'Bob',
          language: 'en',
          options: { style, include_timestamp: true, metadata: {} },
        };

        const call = createMockCall(request);

        greetingService.greet(call as any, (error, response) => {
          expect(error).toBeNull();
          expect(response?.reply).toBeDefined();
          completed++;
          if (completed === styles.length) done();
        });
      });
    });

    it('includes timestamp when requested', (done) => {
      const request = {
        name: 'Charlie',
        language: 'en',
        options: {
          style: 1,
          include_timestamp: true,
          metadata: {},
        },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeNull();
        expect(response?.timestamp).toBeDefined();
        expect(response?.timestamp).toBeTruthy();
        done();
      });
    });

    it('omits timestamp when not requested', (done) => {
      const request = {
        name: 'David',
        language: 'en',
        options: {
          style: 1,
          include_timestamp: false,
          metadata: {},
        },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeNull();
        // Timestamp might be empty string or undefined
        expect(response?.timestamp).toBeFalsy();
        done();
      });
    });

    it('returns error for empty name', (done) => {
      const request = {
        name: '',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeDefined();
        expect(error?.code).toBe(grpc.status.INVALID_ARGUMENT);
        expect(error?.message).toContain('Name is required');
        done();
      });
    });

    it('includes metadata in response', (done) => {
      const request = {
        name: 'Eve',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeNull();
        expect(response?.metadata).toBeDefined();
        expect(response?.metadata?.server_version).toBe('1.0.0');
        expect(response?.metadata?.request_id).toBeDefined();
        done();
      });
    });

    it('handles special characters in name', (done) => {
      const request = {
        name: "O'Brien <Test>",
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeNull();
        expect(response?.reply).toContain("O'Brien");
        done();
      });
    });

    it('handles very long names', (done) => {
      const longName = 'A'.repeat(1000);
      const request = {
        name: longName,
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeNull();
        expect(response?.reply).toBeDefined();
        done();
      });
    });
  });

  describe('StreamGreetings (Server Streaming)', () => {
    it('streams multiple greetings', (done) => {
      const request = {
        name: 'Frank',
        count: 3,
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockStreamingCall(request);

      greetingService.streamGreetings(call as any);

      setTimeout(() => {
        expect(call.write).toHaveBeenCalled();
        expect(call.end).toHaveBeenCalled();
        // Should have written 3 messages
        expect(call.write).toHaveBeenCalledTimes(3);
        done();
      }, 100);
    });

    it('handles count parameter correctly', (done) => {
      const request = {
        name: 'Grace',
        count: 5,
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockStreamingCall(request);

      greetingService.streamGreetings(call as any);

      setTimeout(() => {
        expect(call.write).toHaveBeenCalledTimes(5);
        expect(call.end).toHaveBeenCalledTimes(1);
        done();
      }, 100);
    });

    it('includes sequence numbers in streamed messages', (done) => {
      const request = {
        name: 'Henry',
        count: 2,
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockStreamingCall(request);

      greetingService.streamGreetings(call as any);

      setTimeout(() => {
        const calls = call.write.mock.calls;
        expect(calls[0][0].reply).toContain('1');
        expect(calls[1][0].reply).toContain('2');
        done();
      }, 100);
    });

    it('defaults to 1 greeting when count not specified', (done) => {
      const request = {
        name: 'Isaac',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockStreamingCall(request);

      greetingService.streamGreetings(call as any);

      setTimeout(() => {
        expect(call.write).toHaveBeenCalledTimes(1);
        done();
      }, 100);
    });

    it('caps maximum count to prevent abuse', (done) => {
      const request = {
        name: 'Jack',
        count: 1000,
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockStreamingCall(request);

      greetingService.streamGreetings(call as any);

      setTimeout(() => {
        // Should be capped at some reasonable number (e.g., 100)
        expect(call.write.mock.calls.length).toBeLessThanOrEqual(100);
        done();
      }, 500);
    });
  });

  describe('AccumulateGreetings (Client Streaming)', () => {
    it('exists as a service method', () => {
      expect(greetingService.accumulateGreetings).toBeDefined();
      expect(typeof greetingService.accumulateGreetings).toBe('function');
    });

    // Note: Client streaming requires more complex mocking of the readable stream
    // Full testing would require a test client
  });

  describe('Chat (Bidirectional Streaming)', () => {
    it('exists as a service method', () => {
      expect(greetingService.chat).toBeDefined();
      expect(typeof greetingService.chat).toBe('function');
    });

    // Note: Bidirectional streaming requires complex mocking of duplex stream
    // Full testing would require a test client
  });

  describe('Error Handling', () => {
    it('validates required fields', (done) => {
      const request = {
        name: '',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeDefined();
        expect(error?.code).toBe(grpc.status.INVALID_ARGUMENT);
        done();
      });
    });

    it('handles missing options gracefully', (done) => {
      const request = {
        name: 'Kate',
        language: 'en',
        // options is missing
      } as any;

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        // Should handle gracefully, possibly with defaults
        expect(error).toBeNull();
        expect(response).toBeDefined();
        done();
      });
    });

    it('handles invalid style gracefully', (done) => {
      const request = {
        name: 'Laura',
        language: 'en',
        options: { style: 999, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        // Should handle gracefully, possibly defaulting
        expect(error).toBeNull();
        expect(response).toBeDefined();
        done();
      });
    });
  });

  describe('Metadata Handling', () => {
    it('generates unique request IDs', (done) => {
      const request1 = {
        name: 'Mike',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const request2 = {
        name: 'Nina',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call1 = createMockCall(request1);
      const call2 = createMockCall(request2);

      let response1: any;
      let response2: any;

      greetingService.greet(call1 as any, (error, response) => {
        response1 = response;

        greetingService.greet(call2 as any, (error, response) => {
          response2 = response;

          expect(response1.metadata.request_id).toBeDefined();
          expect(response2.metadata.request_id).toBeDefined();
          expect(response1.metadata.request_id).not.toBe(response2.metadata.request_id);
          done();
        });
      });
    });

    it('includes server version in all responses', (done) => {
      const request = {
        name: 'Oscar',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);

      greetingService.greet(call as any, (error, response) => {
        expect(error).toBeNull();
        expect(response?.metadata?.server_version).toBe('1.0.0');
        done();
      });
    });
  });

  describe('Performance', () => {
    it('handles rapid sequential requests', (done) => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        name: `User${i}`,
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      }));

      let completed = 0;

      requests.forEach((request) => {
        const call = createMockCall(request);

        greetingService.greet(call as any, (error, response) => {
          expect(error).toBeNull();
          expect(response).toBeDefined();
          completed++;
          if (completed === requests.length) done();
        });
      });
    });

    it('responses are reasonably fast', (done) => {
      const request = {
        name: 'Performance',
        language: 'en',
        options: { style: 1, include_timestamp: true, metadata: {} },
      };

      const call = createMockCall(request);
      const startTime = Date.now();

      greetingService.greet(call as any, (error, response) => {
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(100); // Should be very fast for unary calls
        done();
      });
    });
  });
});
