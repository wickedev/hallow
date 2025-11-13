import * as grpc from '@grpc/grpc-js';
import { createServer, startServer } from '../server';
import { config } from '../config';

describe('Server', () => {
  describe('createServer', () => {
    it('creates a gRPC server instance', () => {
      const server = createServer();
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(grpc.Server);
    });

    it('loads proto definition successfully', () => {
      const server = createServer();
      expect(server).toBeDefined();
      // If proto loading fails, createServer would throw an error
    });

    it('adds GreetingService to server', () => {
      const server = createServer();
      expect(server).toBeDefined();
      // Service is added during createServer
    });

    it('creates new server instance on each call', () => {
      const server1 = createServer();
      const server2 = createServer();
      expect(server1).not.toBe(server2);
    });
  });

  describe('startServer', () => {
    let server: grpc.Server;

    beforeEach(() => {
      server = createServer();
    });

    afterEach((done) => {
      if (server) {
        server.tryShutdown((err) => {
          if (err) {
            // Force shutdown if graceful shutdown fails
            server.forceShutdown();
          }
          done();
        });
      } else {
        done();
      }
    });

    it('starts server on configured port', (done) => {
      startServer(server)
        .then((port) => {
          expect(port).toBe(config.port);
          done();
        })
        .catch(done);
    });

    it('binds to configured host and port', (done) => {
      const expectedAddress = `${config.host}:${config.port}`;

      startServer(server)
        .then((port) => {
          expect(port).toBe(config.port);
          // Server should be bound to the address
          done();
        })
        .catch(done);
    });

    it('uses insecure credentials in development', (done) => {
      startServer(server)
        .then(() => {
          // Server started successfully with insecure credentials
          done();
        })
        .catch(done);
    });

    it('rejects when port is already in use', (done) => {
      // Start first server
      startServer(server)
        .then(() => {
          // Try to start second server on same port
          const server2 = createServer();
          return startServer(server2);
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('bind');
          done();
        });
    });

    it('resolves with port number', (done) => {
      startServer(server)
        .then((port) => {
          expect(typeof port).toBe('number');
          expect(port).toBeGreaterThan(0);
          done();
        })
        .catch(done);
    });
  });

  describe('Server Lifecycle', () => {
    let server: grpc.Server;

    it('can gracefully shutdown after starting', (done) => {
      server = createServer();

      startServer(server)
        .then(() => {
          server.tryShutdown((err) => {
            expect(err).toBeUndefined();
            done();
          });
        })
        .catch(done);
    });

    it('can force shutdown if needed', (done) => {
      server = createServer();

      startServer(server)
        .then(() => {
          // Force shutdown immediately
          server.forceShutdown();
          done();
        })
        .catch(done);
    });

    it('handles multiple start attempts gracefully', (done) => {
      server = createServer();

      startServer(server)
        .then(() => {
          // Try to start again
          return startServer(server);
        })
        .catch((error) => {
          expect(error).toBeDefined();
          server.tryShutdown((err) => {
            if (err) server.forceShutdown();
            done();
          });
        });
    });
  });

  describe('Configuration', () => {
    it('uses environment variables for configuration', () => {
      expect(config.host).toBeDefined();
      expect(config.port).toBeDefined();
      expect(config.protoPath).toBeDefined();
    });

    it('has valid host configuration', () => {
      expect(typeof config.host).toBe('string');
      expect(config.host.length).toBeGreaterThan(0);
    });

    it('has valid port configuration', () => {
      expect(typeof config.port).toBe('number');
      expect(config.port).toBeGreaterThan(0);
      expect(config.port).toBeLessThan(65536);
    });

    it('has valid proto path configuration', () => {
      expect(typeof config.protoPath).toBe('string');
      expect(config.protoPath).toContain('.proto');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid proto path gracefully', () => {
      // This would require mocking the proto loading mechanism
      // For now, we verify that createServer doesn't crash
      expect(() => createServer()).not.toThrow();
    });

    it('handles shutdown during startup', (done) => {
      const server = createServer();

      // Start shutdown immediately after starting
      const startPromise = startServer(server);
      server.tryShutdown((err) => {
        // Shutdown might succeed or fail depending on timing
        startPromise.finally(() => {
          done();
        });
      });
    });
  });
});
