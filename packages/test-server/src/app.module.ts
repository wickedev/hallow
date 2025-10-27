import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { Transport, GrpcOptions } from '@nestjs/microservices';
import { join } from 'path';

// gRPC options configuration
export const grpcClientOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'test.services',
    protoPath: join(__dirname, './proto/service.proto'),
    url: '0.0.0.0:50051',
    loader: {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    },
  },
};

@Module({
  imports: [UserModule, HealthModule],
})
export class AppModule {}
