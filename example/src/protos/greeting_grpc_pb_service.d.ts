// package: greeting
// file: proto/greeting_grpc.proto

import * as proto_greeting_grpc_pb from "./greeting_grpc_pb";
import {grpc} from "@improbable-eng/grpc-web";

type GreetingServiceGreeting = {
  readonly methodName: string;
  readonly service: typeof GreetingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proto_greeting_grpc_pb.GreetingRequest;
  readonly responseType: typeof proto_greeting_grpc_pb.GreetingResponse;
};

export class GreetingService {
  static readonly serviceName: string;
  static readonly Greeting: GreetingServiceGreeting;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class GreetingServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  greeting(
    requestMessage: proto_greeting_grpc_pb.GreetingRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proto_greeting_grpc_pb.GreetingResponse|null) => void
  ): UnaryResponse;
  greeting(
    requestMessage: proto_greeting_grpc_pb.GreetingRequest,
    callback: (error: ServiceError|null, responseMessage: proto_greeting_grpc_pb.GreetingResponse|null) => void
  ): UnaryResponse;
}

