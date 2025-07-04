import { Client } from '../client/Client';
import { createSuspenseResource } from '../hooks/createSuspenseResource';
import {
  ProtoService,
  ProtoMethod,
  ProtoPackage,
  HooksAPI,
  SuspenseResource,
} from '../types';
import { Message } from 'google-protobuf';
import { grpc } from '@improbable-eng/grpc-web';

export class StubGenerator {
  static generateStub(
    service: ProtoService,
    protoPackage: ProtoPackage,
    methodDescriptors: Record<string, grpc.MethodDefinition<any, any>>
  ): new (client: Client) => any {
    return class GeneratedStub {
      private client: Client;
      private service: ProtoService;
      private methodDescriptors: Record<
        string,
        grpc.MethodDefinition<any, any>
      >;

      constructor(client: Client) {
        this.client = client;
        this.service = service;
        this.methodDescriptors = methodDescriptors;

        this.bindMethods();
      }

      private bindMethods(): void {
        this.service.methods.forEach(method => {
          const methodName = method.name;
          const camelCaseMethodName = this.toCamelCase(methodName);

          (this as any)[camelCaseMethodName] = async (request?: any) => {
            const descriptor = this.methodDescriptors[methodName];
            if (!descriptor) {
              throw new Error(`Method descriptor not found for ${methodName}`);
            }

            return this.client.invoke(descriptor, request || {});
          };
        });
      }

      createHooks(): HooksAPI<any> {
        const hooks: HooksAPI<any> = {};

        this.service.methods.forEach(method => {
          const methodName = method.name;
          const camelCaseMethodName = this.toCamelCase(methodName);
          const hookName = `use${this.toPascalCase(methodName)}`;

          hooks[hookName] = (request?: any): SuspenseResource<any> => {
            const descriptor = this.methodDescriptors[methodName];
            if (!descriptor) {
              throw new Error(`Method descriptor not found for ${methodName}`);
            }

            const promise = this.client.invoke(descriptor, request || {});
            return createSuspenseResource(promise);
          };
        });

        return hooks;
      }

      private toCamelCase(str: string): string {
        return str.replace(/_([a-z])/g, (match, letter) =>
          letter.toUpperCase()
        );
      }

      private toPascalCase(str: string): string {
        const camelCase = this.toCamelCase(str);
        return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
      }
    };
  }

  static generateMethodDescriptor<
    TRequest extends Message,
    TResponse extends Message,
  >(
    serviceName: string,
    method: ProtoMethod,
    requestCtor: any,
    responseCtor: any
  ): grpc.MethodDefinition<TRequest, TResponse> {
    return {
      methodName: method.name,
      service: {
        serviceName: serviceName,
      },
      requestStream: method.requestStream || false,
      responseStream: method.responseStream || false,
      requestType: requestCtor,
      responseType: responseCtor,
    };
  }
}
