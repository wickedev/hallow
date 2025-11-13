import * as grpc from '@grpc/grpc-js';
import { logger } from '../middleware/logger';
import { errorHandler } from '../middleware/error-handler';

/**
 * GreetingService implementation with all RPC methods
 */
export class GreetingService {
  /**
   * Greet - Unary RPC method
   * Single request, single response
   */
  greet(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    const startTime = Date.now();
    const method = 'Greet';

    try {
      const request = call.request;
      logger.logRequest(method, request);

      // Validate request
      if (!request.name) {
        const error = new Error('Name is required');
        logger.logError(method, error);
        return callback(errorHandler.handleError(error));
      }

      // Generate greeting based on language
      const language = request.language || 'en';
      let greeting = 'Hello';

      switch (language) {
        case 'es':
          greeting = 'Hola';
          break;
        case 'fr':
          greeting = 'Bonjour';
          break;
        default:
          greeting = 'Hello';
      }

      // Apply style
      const style = request.options?.style || 0; // UNSPECIFIED
      let reply = `${greeting}, ${request.name}!`;

      if (style === 2) {
        // FORMAL
        reply = `${greeting}, Mr./Ms. ${request.name}.`;
      } else if (style === 1) {
        // CASUAL
        reply = `Hey ${request.name}!`;
      } else if (style === 3) {
        // FRIENDLY
        reply = `${greeting} ${request.name}, nice to see you!`;
      }

      // Build response
      const response = {
        reply,
        timestamp: Date.now(),
        metadata: {
          server_version: '1.0.0',
          request_id: Math.random().toString(36).substr(2, 9),
          tags: ['greet', 'unary'],
        },
      };

      const duration = Date.now() - startTime;
      logger.logResponse(method, response, duration);

      callback(null, response);
    } catch (error) {
      logger.logError(method, error as Error);
      callback(errorHandler.handleError(error as Error));
    }
  }

  /**
   * StreamGreetings - Server streaming RPC
   * Single request, stream of responses
   */
  streamGreetings(call: grpc.ServerWritableStream<any, any>): void {
    const method = 'StreamGreetings';
    const request = call.request;
    logger.logRequest(method, request);

    const count = request.count || 5;
    const delayMs = request.delay_ms || 1000;
    let sentCount = 0;

    const interval = setInterval(() => {
      if (sentCount >= count) {
        clearInterval(interval);
        call.end();
        logger.logResponse(method, { total_sent: sentCount }, 0);
        return;
      }

      const response = {
        reply: `Greeting #${sentCount + 1} for ${request.name}`,
        timestamp: Date.now(),
        metadata: {
          server_version: '1.0.0',
          request_id: Math.random().toString(36).substr(2, 9),
          tags: ['stream', `count-${sentCount + 1}`],
        },
      };

      call.write(response);
      sentCount++;
    }, delayMs);

    // Handle client cancellation
    call.on('cancelled', () => {
      clearInterval(interval);
      logger.logError(method, new Error('Client cancelled'));
    });
  }

  /**
   * AccumulateGreetings - Client streaming RPC
   * Stream of requests, single response
   */
  accumulateGreetings(
    call: grpc.ServerReadableStream<any, any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    const method = 'AccumulateGreetings';
    const names: string[] = [];

    call.on('data', (request: any) => {
      logger.logRequest(method, request);
      if (request.name) {
        names.push(request.name);
      }
    });

    call.on('end', () => {
      const response = {
        total_count: names.length,
        names: names,
        summary: `Received ${names.length} greeting(s): ${names.join(', ')}`,
      };

      logger.logResponse(method, response, 0);
      callback(null, response);
    });

    call.on('error', (error: Error) => {
      logger.logError(method, error);
      callback(errorHandler.handleError(error));
    });
  }

  /**
   * Chat - Bidirectional streaming RPC
   * Stream of requests and responses
   */
  chat(call: grpc.ServerDuplexStream<any, any>): void {
    const method = 'Chat';

    call.on('data', (request: any) => {
      logger.logRequest(method, request);

      // Echo back the message with server timestamp
      const response = {
        sender: 'Server',
        message: `Echo: ${request.message}`,
        timestamp: Date.now(),
      };

      call.write(response);
      logger.logResponse(method, response, 0);
    });

    call.on('end', () => {
      call.end();
      logger.logResponse(method, { status: 'chat ended' }, 0);
    });

    call.on('error', (error: Error) => {
      logger.logError(method, error);
    });
  }
}
