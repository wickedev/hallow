import express from 'express';
import cors from 'cors';
import * as grpc from '@grpc/grpc-js';
import * as http from 'http';
import { logger } from './middleware/logger';

/**
 * gRPC-web gateway that translates HTTP/1.1 gRPC-web requests to native gRPC
 *
 * This gateway receives gRPC-web requests from browsers and forwards them to
 * the native gRPC server, then translates the responses back to gRPC-web format.
 */

interface GatewayConfig {
  httpPort: number;
  grpcHost: string;
  grpcPort: number;
}

export function createGrpcWebGateway(config: GatewayConfig): http.Server {
  const app = express();

  // Enable CORS for all origins (adjust for production)
  app.use(cors({
    origin: '*',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Grpc-Web', 'X-User-Agent'],
    exposedHeaders: ['Grpc-Status', 'Grpc-Message', 'Grpc-Status-Details-Bin'],
  }));

  // Parse raw body for gRPC-web messages
  app.use(express.raw({ type: 'application/grpc-web+proto', limit: '5mb' }));
  app.use(express.raw({ type: 'application/grpc-web-text+proto', limit: '5mb' }));

  // Handle gRPC-web requests (catch-all with use and method check)
  app.use(async (req, res, next) => {
    // Only handle POST requests, let health check and other routes pass through
    if (req.method !== 'POST') {
      return next();
    }
    try {
      const pathParts = req.path.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        res.status(400).send('Invalid gRPC path');
        return;
      }

      const serviceName = pathParts.slice(0, -1).join('.');
      const methodName = pathParts[pathParts.length - 1];

      logger.logRequest(serviceName, { method: methodName });

      // Get request body
      const requestBody = req.body;
      if (!(requestBody instanceof Buffer)) {
        res.status(400).send('Expected binary request body');
        return;
      }

      // Parse gRPC-web frame (first 5 bytes: 1 byte flags + 4 bytes length)
      if (requestBody.length < 5) {
        res.status(400).send('Invalid gRPC-web frame');
        return;
      }

      const compressed = requestBody[0] === 1;
      const messageLength = requestBody.readUInt32BE(1);
      const message = requestBody.subarray(5, 5 + messageLength);

      if (compressed) {
        res.status(400).send('Compressed messages not supported');
        return;
      }

      // Create gRPC client
      const client = new grpc.Client(
        `${config.grpcHost}:${config.grpcPort}`,
        grpc.credentials.createInsecure()
      );

      // Make unary call
      const fullPath = `/${pathParts.join('/')}`;

      client.makeUnaryRequest(
        fullPath,
        (arg: Buffer) => arg, // serialize (already serialized)
        (arg: Buffer) => arg, // deserialize (return as buffer)
        message,
        (error: grpc.ServiceError | null, response?: Buffer) => {
          client.close();

          if (error) {
            logger.logError(serviceName, error);

            // Send gRPC-web error response
            res.status(200); // gRPC-web always uses 200
            res.setHeader('Content-Type', 'application/grpc-web+proto');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Grpc-Status', String(error.code || grpc.status.UNKNOWN));
            res.setHeader('Grpc-Message', encodeURIComponent(error.message || 'Unknown error'));

            // Create trailer frame with error status
            const statusCode = error.code || grpc.status.UNKNOWN;
            const statusMessage = error.message || 'Unknown error';
            const trailerData = Buffer.from(
              `grpc-status: ${statusCode}\r\ngrpc-message: ${encodeURIComponent(statusMessage)}\r\n`,
              'utf8'
            );
            const trailerBuffer = Buffer.alloc(5 + trailerData.length);
            trailerBuffer[0] = 0x80; // Trailer flag
            trailerBuffer.writeUInt32BE(trailerData.length, 1); // Length of trailer data
            trailerData.copy(trailerBuffer, 5);

            res.end(trailerBuffer);
            return;
          }

          if (!response) {
            res.status(500).send('Empty response from gRPC server');
            return;
          }

          logger.logResponse(serviceName, { method: methodName, size: response.length }, 0);

          // Send gRPC-web success response
          res.status(200);
          res.setHeader('Content-Type', 'application/grpc-web+proto');
          res.setHeader('Connection', 'keep-alive');

          // Create response frame: flags (1 byte) + length (4 bytes) + message
          const responseFrame = Buffer.alloc(5 + response.length);
          responseFrame[0] = 0; // Not compressed
          responseFrame.writeUInt32BE(response.length, 1);
          response.copy(responseFrame, 5);

          // Create trailer frame with grpc-status and grpc-message
          // Trailers should be in HTTP header format: "grpc-status: 0\r\ngrpc-message: \r\n"
          const trailerData = Buffer.from('grpc-status: 0\r\ngrpc-message: \r\n', 'utf8');
          const trailerFrame = Buffer.alloc(5 + trailerData.length);
          trailerFrame[0] = 0x80; // Trailer flag
          trailerFrame.writeUInt32BE(trailerData.length, 1); // Length of trailer data
          trailerData.copy(trailerFrame, 5);

          // Combine response and trailer frames
          const fullResponse = Buffer.concat([responseFrame, trailerFrame]);

          // Set headers (explicitly remove Content-Length if set)
          res.removeHeader('Content-Length');
          res.setHeader('Content-Type', 'application/grpc-web+proto');
          res.setHeader('Transfer-Encoding', 'chunked');
          // Also set HTTP headers for compatibility
          res.setHeader('Grpc-Status', '0');
          res.setHeader('Grpc-Message', '');

          // Send as single response
          res.end(fullResponse);
        }
      );

    } catch (error) {
      logger.logError('Gateway', error as Error);
      res.status(500).send('Internal gateway error');
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', gateway: 'grpc-web' });
  });

  const server = http.createServer(app);
  return server;
}

export function startGateway(server: http.Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      logger.logResponse('Gateway', { port }, 0);
      resolve();
    });

    server.on('error', reject);
  });
}
