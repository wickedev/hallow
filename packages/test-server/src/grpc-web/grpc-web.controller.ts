import {
  Controller,
  Post,
  Body,
  Headers,
  Res,
  Req,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GrpcWebService } from './grpc-web.service';

@Controller()
export class GrpcWebController {
  constructor(private readonly grpcWebService: GrpcWebService) {}

  /**
   * Handle gRPC-Web requests
   * This endpoint acts as a bridge between gRPC-Web clients and the gRPC server
   */
  @Post('*')
  async handleGrpcWeb(
    @Req() request: Request,
    @Headers() headers: Record<string, string>,
    @Res() response: Response,
  ) {
    const body = request.body as Buffer;
    try {
      // Extract service and method from the URL
      const path = headers['x-grpc-web'] || headers['content-type'];

      // Set gRPC-Web response headers
      response.set({
        'Content-Type': 'application/grpc-web+proto',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'content-type,x-grpc-web,x-user-agent',
        'Access-Control-Expose-Headers': 'grpc-status,grpc-message',
      });

      // Process the gRPC-Web request
      const result = await this.grpcWebService.processRequest(body, headers);

      response.status(HttpStatus.OK).send(result);
    } catch (error) {
      console.error('gRPC-Web error:', error);

      // Send gRPC error response
      response.set({
        'grpc-status': '2', // UNKNOWN error
        'grpc-message': encodeURIComponent(error.message || 'Unknown error'),
      });

      response.status(HttpStatus.OK).send(Buffer.alloc(0));
    }
  }
}
