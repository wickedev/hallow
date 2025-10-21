import { Controller, Get } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

interface HealthCheckRequest {}
interface HealthCheckResponse {
  status: string;
  services: string[];
}

@Controller('health')
export class HealthController {

  /**
   * HTTP health check endpoint
   */
  @Get()
  healthCheck() {
    return {
      status: 'healthy',
      services: ['UserService'],
      grpc: {
        port: 50051,
        methods: [
          'test.services.UserService/GetUser',
          'test.services.UserService/ListUsers',
          'test.services.UserService/CreateUsers',
          'test.services.UserService/Chat',
        ]
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * gRPC health check method
   */
  @GrpcMethod('Health', 'Check')
  check(request: HealthCheckRequest): HealthCheckResponse {
    return {
      status: 'SERVING',
      services: ['test.services.UserService']
    };
  }
}