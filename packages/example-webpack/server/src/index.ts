import { createServer, startServer, setupGracefulShutdown } from './server';
import { serverConfig } from './config/server.config';
import { logger } from './middleware/logger';
const proxy = require('@grpc-web/proxy');

/**
 * Main entry point for gRPC server with official gRPC-web proxy
 *
 * This setup uses @grpc-web/proxy which properly translates gRPC-web (HTTP/1.1)
 * requests to native gRPC (HTTP/2) calls, ensuring full compatibility with
 * @improbable-eng/grpc-web client library.
 */
async function main() {
  try {
    logger.logRequest('Server', { status: 'starting', config: serverConfig });

    // Native gRPC server on port 50051 (internal)
    const grpcPort = 50051;
    const grpcServer = createServer();
    setupGracefulShutdown(grpcServer);

    // Start native gRPC server
    await startServer(grpcServer, grpcPort);
    console.log(`✅ Native gRPC server is running on ${serverConfig.host}:${grpcPort}`);

    // gRPC-web proxy on port 3000 (public-facing)
    const proxyPort = process.env.GRPC_SERVER_PORT ? parseInt(process.env.GRPC_SERVER_PORT, 10) : serverConfig.port;
    const proxyServer = proxy({
      target: `http://${serverConfig.host}:${grpcPort}`,
      origin: serverConfig.cors.enabled ? serverConfig.cors.origins : true,
    }).listen(proxyPort);

    console.log(`✅ gRPC-web proxy is running on ${serverConfig.host}:${proxyPort}`);
    console.log(`📡 Proxy: localhost:${proxyPort} -> localhost:${grpcPort}\n`);

    if (serverConfig.cors.enabled) {
      console.log('🔓 CORS enabled for development');
      console.log(`   Allowed origins: ${serverConfig.cors.origins.join(', ')}\n`);
    }

    // Setup graceful shutdown
    const shutdown = () => {
      console.log('Shutting down servers...');
      proxyServer.close();
      grpcServer.tryShutdown(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.logError('Server', error as Error);
    process.exit(1);
  }
}

// Start the server
main();
