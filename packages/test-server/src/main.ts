import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { AppModule, grpcClientOptions } from './app.module';

async function bootstrap() {
  // Create hybrid application (HTTP + gRPC)
  const app = await NestFactory.create(AppModule);

  // Configure gRPC microservice with custom reflection configuration
  const grpcOptionsWithReflection: MicroserviceOptions = {
    ...grpcClientOptions,
    options: {
      ...grpcClientOptions.options,
      onLoadPackageDefinition: (pkg, server) => {
        // Add reflection service to the gRPC server
        new ReflectionService(pkg).addToServer(server);
      },
    },
  };

  app.connectMicroservice<MicroserviceOptions>(grpcOptionsWithReflection);

  // Start both HTTP and gRPC servers
  await app.startAllMicroservices();

  const port = process.env.HTTP_PORT || 3000;
  await app.listen(port);

  console.log(`🚀 NestJS gRPC Test Server is running`);
  console.log(`   - HTTP/gRPC-Web: http://localhost:${port}`);
  console.log(`   - gRPC: localhost:50051`);
  console.log(`   - Proto: test.services`);
  console.log(`   - Reflection: Enabled (using @grpc/reflection)`);
  console.log('');
  console.log('Available services:');
  console.log('  📦 UserService');
  console.log('     • GetUser (unary)');
  console.log('     • ListUsers (server streaming)');
  console.log('     • CreateUsers (client streaming)');
  console.log('     • Chat (bidirectional streaming)');
}

bootstrap().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
