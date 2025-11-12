/**
 * Ambient TypeScript module declarations for .proto files
 *
 * This file provides TypeScript type checking and IDE autocomplete support for
 * .proto file imports. When you import a .proto file in your TypeScript code,
 * this ambient declaration allows the TypeScript compiler to recognize it as a
 * valid module and provides placeholder types until the actual types are generated
 * at build time by the Hallow plugin.
 *
 * @example
 * ```typescript
 * import { GreetingServiceStub, GreetRequest, GreetResponse } from './greeting.proto';
 *
 * const stub = new GreetingServiceStub(client);
 * const response = await stub.methods.greet({ name: 'World' });
 * ```
 *
 * @packageDocumentation
 */

/**
 * Ambient module declaration for all .proto files
 *
 * This declaration tells TypeScript that any file with a .proto extension is a valid
 * module that can be imported. The actual types will be generated at build time by
 * the @hallow/plugin, but this provides baseline type safety and IDE support.
 */
declare module '*.proto' {
  import { Client } from '@hallow/grpc-web';

  /**
   * Placeholder interface for Protocol Buffer message types
   *
   * In the actual generated code, each message definition in your .proto file
   * will be exported as a properly typed interface. This placeholder allows
   * TypeScript to accept proto imports before the actual types are generated.
   *
   * @example
   * ```typescript
   * // In your .proto file:
   * // message GreetRequest {
   * //   string name = 1;
   * //   map<string, string> metadata = 2;
   * // }
   *
   * // Generated interface (example):
   * // export interface GreetRequest {
   * //   name: string;
   * //   metadata?: { [key: string]: string };
   * // }
   * ```
   */
  export interface Message {
    [key: string]: any;
  }

  /**
   * Placeholder interface for gRPC service stub constructors
   *
   * In the actual generated code, each service definition in your .proto file
   * will be exported as a class that implements this interface. The stub provides
   * type-safe methods for calling your gRPC service.
   *
   * @typeParam T - The type of the service stub instance (inferred from generated code)
   *
   * @example
   * ```typescript
   * // In your .proto file:
   * // service GreetingService {
   * //   rpc Greet(GreetRequest) returns (GreetResponse);
   * // }
   *
   * // Generated class (example):
   * // export class GreetingServiceStub {
   * //   constructor(client: Client);
   * //   methods: {
   * //     greet(request: GreetRequest): Promise<GreetResponse>;
   * //   };
   * // }
   * ```
   */
  export interface ServiceStub<T = any> {
    /**
     * Constructs a new service stub instance
     *
     * @param client - The gRPC-web client instance to use for communication
     */
    new (client: Client): T;
  }

  /**
   * Generic export map for type checking
   *
   * This represents the collection of all exports from a .proto file module.
   * The actual generated code will export specific named classes, interfaces,
   * and functions based on your proto definitions.
   */
  const exports: {
    [key: string]: ServiceStub | Message | Function;
  };

  export default exports;
}
