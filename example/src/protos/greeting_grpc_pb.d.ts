// package: greeting
// file: proto/greeting_grpc.proto

import * as jspb from "google-protobuf";

export class Greeting extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasService(): boolean;
  clearService(): void;
  getService(): string | undefined;
  setService(value: string): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): string | undefined;
  setMessage(value: string): void;

  hasCreated(): boolean;
  clearCreated(): void;
  getCreated(): string | undefined;
  setCreated(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Greeting.AsObject;
  static toObject(includeInstance: boolean, msg: Greeting): Greeting.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Greeting, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Greeting;
  static deserializeBinaryFromReader(message: Greeting, reader: jspb.BinaryReader): Greeting;
}

export namespace Greeting {
  export type AsObject = {
    id?: string,
    service?: string,
    message?: string,
    created?: string,
  }
}

export class GreetingRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GreetingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GreetingRequest): GreetingRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GreetingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GreetingRequest;
  static deserializeBinaryFromReader(message: GreetingRequest, reader: jspb.BinaryReader): GreetingRequest;
}

export namespace GreetingRequest {
  export type AsObject = {
  }
}

export class GreetingResponse extends jspb.Message {
  clearGreetingList(): void;
  getGreetingList(): Array<Greeting>;
  setGreetingList(value: Array<Greeting>): void;
  addGreeting(value?: Greeting, index?: number): Greeting;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GreetingResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GreetingResponse): GreetingResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GreetingResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GreetingResponse;
  static deserializeBinaryFromReader(message: GreetingResponse, reader: jspb.BinaryReader): GreetingResponse;
}

export namespace GreetingResponse {
  export type AsObject = {
    greetingList: Array<Greeting.AsObject>,
  }
}

