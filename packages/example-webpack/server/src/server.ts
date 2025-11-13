import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { GreetingService } from './services/greeting.service';
import { serverConfig } from './config/server.config';
import { logger } from './middleware/logger';

/**
 * Create and configure gRPC server
 */
export function createServer(): grpc.Server {
  // Load proto definition
  const packageDefinition = protoLoader.loadSync(serverConfig.protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
  const greetingProto = protoDescriptor.greeting;

  // Create server with message size limits
  const server = new grpc.Server({
    'grpc.max_receive_message_length': 4 * 1024 * 1024, // 4MB
    'grpc.max_send_message_length': 4 * 1024 * 1024, // 4MB
  });

  // Create service implementation
  const greetingService = new GreetingService();

  // Add service to server
  server.addService(greetingProto.GreetingService.service, {
    greet: greetingService.greet.bind(greetingService),
    streamGreetings: greetingService.streamGreetings.bind(greetingService),
    accumulateGreetings: greetingService.accumulateGreetings.bind(greetingService),
    chat: greetingService.chat.bind(greetingService),
  });

  return server;
}

/**
 * Start the gRPC server
 */
export function startServer(server: grpc.Server, port?: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const serverPort = port || serverConfig.port;
    const address = `${serverConfig.host}:${serverPort}`;

    server.bindAsync(
      address,
      grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => {
        if (error) {
          reject(error);
          return;
        }

        server.start();
        resolve(boundPort);
      }
    );
  });
}

/**
 * Setup graceful shutdown
 */
export function setupGracefulShutdown(server: grpc.Server): void {
  const shutdown = () => {
    logger.logResponse('Server', { status: 'shutting down' }, 0);

    server.tryShutdown((error) => {
      if (error) {
        logger.logError('Server', error);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
