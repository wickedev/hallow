import { useResource } from "./resource";
import { isDevelopment, Optional, statusMap } from "./utils";
import {
  GreetingRequest,
  GreetingResponse,
  GreetingService,
  IClient,
  IGreetingRequest,
  IGreetingResponse
} from "./greeting";
import { grpc } from "@improbable-eng/grpc-web";
import { IThrowableProto, ThrowableProto } from "./internal_exception_messages";

export interface IgRPCError {
  message: string;
  code: number;
  status: string;
  metadata: IMetadata;
}

interface IMetadata {
  throwable: IThrowableProto;
  trailers: any;
}

function getMessage<R extends grpc.ProtobufMessage>(
  output: grpc.UnaryOutput<R>
): string {
  return output.statusMessage || "Unknown Error";
}

// noinspection JSUnusedGlobalSymbols
export class GreetingStub {
  constructor(private readonly client: IClient) {}

  greeting(greetingRequest: IGreetingRequest): Promise<IGreetingResponse> {
    return new Promise<IGreetingResponse>((resolve, reject) => {
      grpc.unary(GreetingService.Greeting, {
        host: this.client.host,
        debug: false,
        onEnd(output: grpc.UnaryOutput<GreetingResponse>): void {
          if (output.status === grpc.Code.OK) {
            const result = output.message?.toObject();

            result
              ? resolve(result)
              : reject({
                  message: "deserialize failed",
                  code: output.status,
                  metadata: output.trailers
                });
          } else {
            const proto = (output as any)?.trailers?.headersMap?.[
              "armeria.grpc.throwableproto-bin"
            ];

            let throwable: Optional<ThrowableProto> = proto?.[0]
              ? ThrowableProto.deserializeBinary(proto[0])
              : undefined;

            reject({
              message: getMessage(output),
              code: output.status,
              status: statusMap[output.status],
              metadata: {
                throwable: throwable?.toObject(),
                trailers: output.trailers
              }
            });
          }
        },
        request: GreetingRequest.create(greetingRequest)
      });
    });
  }

  createHooks() {
    return {
      useGreeting: (greetingRequest: IGreetingRequest) => {
        return useResource(this.greeting.bind(this), greetingRequest);
      }
    };
  }
}

export const greetingStub = new GreetingStub({
  host: isDevelopment ? "/api" : "http://localhost:8080"
});
