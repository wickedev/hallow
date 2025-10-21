import { Module } from '@nestjs/common';
import { GrpcWebController } from './grpc-web.controller';
import { GrpcWebService } from './grpc-web.service';

@Module({
  controllers: [GrpcWebController],
  providers: [GrpcWebService],
})
export class GrpcWebModule {}