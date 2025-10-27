import { Injectable } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

@Injectable()
export class GrpcWebService {
  private client: any;

  constructor() {
    // Load proto file from src directory (not dist)
    const PROTO_PATH = path.join(__dirname, '../../src/proto/service.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

    // Create gRPC client to connect to the gRPC server
    const UserService = protoDescriptor.test.services.UserService;
    this.client = new UserService('localhost:50051', grpc.credentials.createInsecure());
  }

  /**
   * Process gRPC-Web requests by forwarding to gRPC server
   * This is a basic implementation for testing purposes
   */
  async processRequest(body: Buffer, headers: Record<string, string>): Promise<Buffer> {
    console.log('Processing gRPC-Web request');
    console.log('Headers:', headers);
    console.log('Body length:', body.length);

    // Parse request path from headers
    const contentType = headers['content-type'] || '';
    const path = headers['x-grpc-web'] || contentType;

    console.log('Request path:', path);
    console.log('Request body:', body.toString('base64').substring(0, 100));

    // For now, return a placeholder
    // Full implementation would parse protobuf, call gRPC, and format response
    return Buffer.from('gRPC-Web proxy not fully implemented. Use Envoy for production.');
  }
}
