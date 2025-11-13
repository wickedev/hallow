/**
 * Type definitions for environment variables
 */

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly GRPC_SERVER_URL?: string;
    readonly GRPC_SERVER_PORT?: string;
    readonly DEV_SERVER_PORT?: string;
    readonly DEBUG?: string;
  }
}

// Define global environment variables available via webpack.DefinePlugin
declare const process: {
  env: NodeJS.ProcessEnv;
};
