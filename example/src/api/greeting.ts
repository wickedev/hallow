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

  get created(): Optional<string> {
    return jspb.Message.getField(this, 2) as string;
  }

  set message(value: string) {
    jspb.Message.setField(this, 1, value);
  }

  set created(value: Optional<string>) {
    jspb.Message.setField(this, 2, value);
  }

  static create(data: IGreeting): Greeting {
    const message = new Greeting([]);
    message.message = data.message;
    message.created = data.created;
    return message;
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

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    this.serializeBinaryToWriter(writer);
    return writer.getResultBuffer();
  }

  serializeBinaryToWriter(writer: jspb.BinaryWriter): void {
    let v;
    if ((v = this.message) != null) {
      writer.writeString(1, v);
    }
    if ((v = this.created) != null) {
      writer.writeString(2, v);
    }
  }

  toObject(includeInstance: boolean = false): IGreeting & IObject {
    return Greeting.toObject(includeInstance, this);
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

  static create(data: IGreetingRequest): GreetingRequest {
    const message = new GreetingRequest([]);
    message.name = data.name;
    return message;
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

  static toObject(
    includeInstance: boolean,
    message: GreetingRequest
  ): IGreetingRequest & IObject {
    return {
      name: message.name,
      $messageInstance: includeInstance ? message : undefined,
    };
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    this.serializeBinaryToWriter(writer);
    return writer.getResultBuffer();
  }

  serializeBinaryToWriter(writer: jspb.BinaryWriter): void {
    let v;
    if ((v = this.name) != null) {
      writer.writeString(1, v);
    }
  }

  toObject(includeInstance: boolean = false): IGreetingRequest & IObject {
    return GreetingRequest.toObject(includeInstance, this);
  }
}

export interface IGreetingResponse {
  greetings: IGreeting[];
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

  static create(data: IGreetingResponse): GreetingResponse {
    const message = new GreetingResponse([]);
    message.greetings = data.greetings.map(Greeting.create);
    return message;
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

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    this.serializeBinaryToWriter(writer);
    return writer.getResultBuffer();
  }

  serializeBinaryToWriter(writer: jspb.BinaryWriter): void {
    let v;
    if ((v = this.greetings).length > 0) {
      writer.writeRepeatedMessage(1, v, Greeting.serializeBinaryToWriter);
    }
  }

  toObject(includeInstance: boolean = false): IGreetingResponse & IObject {
    return GreetingResponse.toObject(includeInstance, this);
  }
}

export class GreetingService implements grpc.ServiceDefinition {
  serviceName: string = "greeting.GreetingService";
  static service = new GreetingService();

  static Greeting: grpc.UnaryMethodDefinition<
    GreetingRequest,
    GreetingResponse
  > = {
    methodName: "Greeting",
    service: GreetingService.service,
    requestStream: false,
    responseStream: false,
    requestType: (GreetingRequest as unknown) as ProtobufMessageClass<GreetingRequest>,
    responseType: (GreetingResponse as unknown) as ProtobufMessageClass<GreetingResponse>,
  };
}

export class GreetingStub {
  private readonly greetingResource: Resource<IGreetingResponse>;

  constructor(private readonly client: IClient) {
    this.greetingResource = new Resource(this.greeting.bind(this));
  }

  greeting(greetingRequest: IGreetingRequest): Promise<IGreetingResponse> {
    return new Promise<IGreetingResponse>((resolve, reject) => {
      grpc.unary(GreetingService.Greeting, {
        host: this.client.host,
        debug: false,
        onEnd: createUnaryOnEndHandler(resolve, reject),
        request: GreetingRequest.create(greetingRequest),
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
}
