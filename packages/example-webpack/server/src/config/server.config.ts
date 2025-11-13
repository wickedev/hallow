import path from 'path';

/**
 * Server configuration interface
 */
export interface ServerConfig {
  host: string;
  port: number;
  cors: {
    enabled: boolean;
    origins: string[];
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  protoPath: string;
}

/**
 * Load server configuration from environment variables with defaults
 */
export const serverConfig: ServerConfig = {
  host: process.env.GRPC_SERVER_HOST || '0.0.0.0',
  port: parseInt(process.env.GRPC_SERVER_PORT || '3000', 10),

  cors: {
    enabled: process.env.NODE_ENV !== 'production',
    origins: ['http://localhost:8080', 'http://localhost:3000'],
  },

  logging: {
    enabled: true,
    level: (process.env.LOG_LEVEL as any) || 'info',
  },

  protoPath: path.resolve(__dirname, '../../../proto/greeting.proto'),
};
