import {
  createUnaryOnEndHandler,
  IClient,
  IObject,
  Optional,
  Resource,
  useForceUpdate,
} from "@hallow/core";
import { grpc } from "@improbable-eng/grpc-web";
import { ProtobufMessageClass } from "@improbable-eng/grpc-web/dist/typings/message";
import * as jspb from "google-protobuf";
import { useEffect } from "react";
import wrappers_pb from "google-protobuf/google/protobuf/wrappers_pb";
import empty_pb from "google-protobuf/google/protobuf/empty_pb";

export interface IGreeting {
  readonly message: string;
  readonly created?: string;
}

export class Greeting extends jspb.Message {
  constructor(data?: jspb.Message.MessageArray) {
    super();
    jspb.Message.initialize(this, data || [], 0, -1, undefined, undefined);
  }

  get message(): string {
    return jspb.Message.getField(this, 1) as string;
  }

  set message(value: string) {
    jspb.Message.setField(this, 1, value);
  }

  get created(): Optional<string> {
    return jspb.Message.getField(this, 2) as string;
  }

  set created(value: Optional<string>) {
    jspb.Message.setField(this, 2, value);
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    Greeting.serializeBinaryToWriter(this, writer);
    return writer.getResultBuffer();
  }

  toObject(includeInstance: boolean = false): IGreeting & IObject {
    return Greeting.toObject(includeInstance, this);
  }

  static create(data: IGreeting): Greeting {
    const message = new Greeting([]);
    message.message = data.message;
    message.created = data.created;
    return message;
  }

  static toObject(
    includeInstance: boolean,
    message: Greeting
  ): IGreeting & IObject {
    return {
      message: message.message,
      created: message.created,
      $messageInstance: includeInstance ? message : undefined,
    };
  }

  static serializeBinaryToWriter(
    message: Greeting,
    writer: jspb.BinaryWriter
  ): void {
    let v;
    if ((v = message.message) != null) {
      writer.writeString(1, v);
    }
    if ((v = message.created) != null) {
      writer.writeString(2, v);
    }
  }

  static deserializeBinary(bytes: Uint8Array): Greeting {
    return Greeting.deserializeBinaryFromReader(
      new Greeting(),
      new jspb.BinaryReader(bytes)
    );
  }

  static deserializeBinaryFromReader(
    message: Greeting,
    reader: jspb.BinaryReader
  ): Greeting {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1:
          jspb.Message.setField(message, 1, reader.readString());
          break;
        case 2:
          jspb.Message.setField(message, 2, reader.readString());
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }
}

export interface IGreetingRequest {
  readonly name: string;
}

export class GreetingRequest extends jspb.Message {
  constructor(data?: jspb.Message.MessageArray) {
    super();
    jspb.Message.initialize(this, data || [], 0, -1, undefined, undefined);
  }

  get name(): string {
    return jspb.Message.getField(this, 1) as string;
  }

  set name(value: string) {
    jspb.Message.setField(this, 1, value);
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    GreetingRequest.serializeBinaryToWriter(this, writer);
    return writer.getResultBuffer();
  }

  toObject(includeInstance: boolean = false): IGreetingRequest & IObject {
    return GreetingRequest.toObject(includeInstance, this);
  }

  static create(data: IGreetingRequest): GreetingRequest {
    const message = new GreetingRequest([]);
    message.name = data.name;
    return message;
  }

  static toObject(
    includeInstance: boolean,
    message: GreetingRequest
  ): IGreetingRequest & IObject {
    return {
      name: message.name,
      $messageInstance: includeInstance ? message : undefined,
    };
  }

  static serializeBinaryToWriter(
    message: GreetingRequest,
    writer: jspb.BinaryWriter
  ): void {
    let v;
    if ((v = message.name) != null) {
      writer.writeString(1, v);
    }
  }

  static deserializeBinary(bytes: Uint8Array): GreetingRequest {
    return GreetingRequest.deserializeBinaryFromReader(
      new GreetingRequest(),
      new jspb.BinaryReader(bytes)
    );
  }

  static deserializeBinaryFromReader(
    message: GreetingRequest,
    reader: jspb.BinaryReader
  ): GreetingRequest {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1:
          jspb.Message.setField(message, 1, reader.readString());
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }
}

export interface IGreetingResponse {
  readonly greetings: IGreeting[];
}

export class GreetingResponse extends jspb.Message {
  static repeatedFields_ = [1];

  constructor(data?: jspb.Message.MessageArray) {
    super();
    jspb.Message.initialize(
      this,
      data || [],
      0,
      -1,
      GreetingResponse.repeatedFields_,
      undefined
    );
  }

  get greetings(): Greeting[] {
    return jspb.Message.getRepeatedWrapperField(this, Greeting as any, 1);
  }

  set greetings(value: Greeting[]) {
    jspb.Message.setRepeatedWrapperField(this, 1, value);
  }

  addGreetings(value: Greeting, opt_index?: number) {
    return jspb.Message.addToRepeatedWrapperField(
      this,
      1,
      value,
      Greeting as any,
      opt_index
    );
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    GreetingResponse.serializeBinaryToWriter(this, writer);
    return writer.getResultBuffer();
  }

  toObject(includeInstance: boolean = false): IGreetingResponse & IObject {
    return GreetingResponse.toObject(includeInstance, this);
  }

  static create(data: IGreetingResponse): GreetingResponse {
    const message = new GreetingResponse([]);
    message.greetings = data.greetings.map(Greeting.create);
    return message;
  }

  static toObject(
    includeInstance: boolean,
    message: GreetingResponse
  ): IGreetingResponse & IObject {
    return {
      greetings: jspb.Message.toObjectList(
        message.greetings,
        Greeting.toObject,
        includeInstance
      ) as IGreeting[],
      $messageInstance: includeInstance ? message : undefined,
    };
  }

  static serializeBinaryToWriter(
    message: GreetingResponse,
    writer: jspb.BinaryWriter
  ): void {
    let v;
    if ((v = message.greetings).length > 0) {
      writer.writeRepeatedMessage(1, v, Greeting.serializeBinaryToWriter);
    }
  }

  static deserializeBinary(bytes: Uint8Array): GreetingResponse {
    return GreetingResponse.deserializeBinaryFromReader(
      new GreetingResponse(),
      new jspb.BinaryReader(bytes)
    );
  }

  static deserializeBinaryFromReader(
    message: GreetingResponse,
    reader: jspb.BinaryReader
  ): GreetingResponse {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1:
          const value = new Greeting();
          reader.readMessage(value, Greeting.deserializeBinaryFromReader);
          message.addGreetings(value);
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }
}

export class GreeterService implements grpc.ServiceDefinition {
  serviceName: string = "greeting.Greeter";
  static service = new GreeterService();
  static Greeting: grpc.UnaryMethodDefinition<
    GreetingRequest,
    GreetingResponse
  > = {
    methodName: "Greeting",
    service: GreeterService.service,
    requestStream: false,
    responseStream: false,
    requestType: (GreetingRequest as unknown) as ProtobufMessageClass<GreetingRequest>,
    responseType: (GreetingResponse as unknown) as ProtobufMessageClass<GreetingResponse>,
  };
  static SayHello: grpc.UnaryMethodDefinition<
    empty_pb.Empty,
    wrappers_pb.UInt64Value
  > = {
    methodName: "SayHello",
    service: GreeterService.service,
    requestStream: false,
    responseStream: false,
    requestType: (empty_pb.Empty as unknown) as ProtobufMessageClass<empty_pb.Empty>,
    responseType: (wrappers_pb.UInt64Value as unknown) as ProtobufMessageClass<wrappers_pb.UInt64Value>,
  };
}

export class GreeterStub {
  private readonly greetingResource: Resource<IGreetingResponse>;
  private readonly sayHelloResource: Resource<number>;

  constructor(private readonly client: IClient) {
    this.greetingResource = new Resource(this.greeting.bind(this));
    this.sayHelloResource = new Resource(this.sayHello.bind(this));
  }

  greeting(request: IGreetingRequest): Promise<IGreetingResponse> {
    return new Promise<IGreetingResponse>((resolve, reject) => {
      grpc.unary(GreeterService.Greeting, {
        host: this.client.host,
        debug: false,
        onEnd: createUnaryOnEndHandler(resolve, reject),
        request: GreetingRequest.create(request),
      });
    });
  }

  sayHello(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      grpc.unary(GreeterService.SayHello, {
        host: this.client.host,
        debug: false,
        onEnd: createUnaryOnEndHandler(resolve, reject),
        request: new empty_pb.Empty(),
      });
    });
  }

  useGreeting(request: IGreetingRequest): Resource<IGreetingResponse> {
      // eslint-disable-next-line react-hooks/rules-of-hooks
    this.greetingResource.forceUpdate = useForceUpdate();
    this.greetingResource.arguments = [request];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (this.greetingResource.mustBeIgnored) {
        this.greetingResource.mustBeIgnored = false;
      } else {
        this.greetingResource.mustBeIgnored = true;
        this.greetingResource.arguments = [request];
        this.greetingResource.refresh();
      }
    }, [request]);
    return this.greetingResource;
  }

  useSayHello(): Resource<number> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    this.sayHelloResource.forceUpdate = useForceUpdate();
    this.sayHelloResource.arguments = [];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (this.sayHelloResource.mustBeIgnored) {
        this.sayHelloResource.mustBeIgnored = false;
      } else {
        this.sayHelloResource.mustBeIgnored = true;
        this.sayHelloResource.arguments = [];
        this.sayHelloResource.refresh();
      }
    }, []);
    return this.sayHelloResource;
  }
}
