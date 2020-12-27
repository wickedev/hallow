import { grpc } from "@improbable-eng/grpc-web";
import * as jspb from "google-protobuf";

interface IObject {
  $jspbMessageInstance?: jspb.Message;
}

interface IGreeting {
  readonly id: string;
  readonly service?: string;
  readonly message: string;
  readonly created?: string;
}

export class Greeting extends jspb.Message {
  constructor(data: jspb.Message.MessageArray) {
    super();

    // if (Array.isArray(data)) {
    jspb.Message.initialize(this, data, 0, -1, undefined, undefined);
    // } else {
    // jspb.Message.setField(this, 1, data.id);
    // jspb.Message.setField(this, 2, data.service);
    // jspb.Message.setField(this, 3, data.message);
    // jspb.Message.setField(this, 4, data.created);
    // }
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    this.serializeBinaryToWriter(writer);
    return writer.getResultBuffer();
  }

  static toObject(
    includeInstance: boolean,
    message: Greeting
  ): IGreeting & IObject {
    return {
      id: jspb.Message.getField(message, 1) as string,
      service: jspb.Message.getField(message, 2) as string,
      message: jspb.Message.getField(message, 3) as string,
      created: jspb.Message.getField(message, 4) as string,
      $jspbMessageInstance: includeInstance ? message : undefined
    };
  }

  toObject(includeInstance?: boolean): IGreeting & IObject {
    return {
      id: jspb.Message.getField(this, 1) as string,
      service: jspb.Message.getField(this, 2) as string,
      message: jspb.Message.getField(this, 3) as string,
      created: jspb.Message.getField(this, 4) as string,
      $jspbMessageInstance: includeInstance ? this : undefined
    };
  }

  private serializeBinaryToWriter(writer: jspb.BinaryWriter) {
    const f1 = jspb.Message.getField(this, 1) as string;
    if (f1 != null) {
      writer.writeString(1, f1);
    }
    const f2 = jspb.Message.getField(this, 2) as string;
    if (f2 != null) {
      writer.writeString(2, f2);
    }
    const f3 = jspb.Message.getField(this, 3) as string;
    if (f3 != null) {
      writer.writeString(3, f3);
    }
    const f4 = jspb.Message.getField(this, 4) as string;
    if (f4 != null) {
      writer.writeString(4, f4);
    }
  }

  static deserializeBinaryFromReader(
    message: jspb.Message,
    reader: jspb.BinaryReader
  ): jspb.Message {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1:
          const f1 = /** @type {string} */ reader.readString();
          jspb.Message.setField(message, 1, f1);
          break;
        case 2:
          const f2 = reader.readString();
          jspb.Message.setField(message, 2, f2);
          break;
        case 3:
          const f3 = reader.readString();
          jspb.Message.setField(message, 3, f3);
          break;
        case 4:
          const f4 = reader.readString();
          jspb.Message.setField(message, 4, f4);
          break;
        default:
          reader.skipField();
          break;
      }
    }
    return message;
  }
}

export interface IGreetingRequest {}

export class GreetingRequest extends jspb.Message {
  public static create(data: IGreetingRequest) {
    return new GreetingRequest(data);
  }

  constructor(data?: jspb.Message.MessageArray | IGreetingRequest) {
    super();

    // if (Array.isArray(data)) {
    jspb.Message.initialize(this, data as any, 0, -1, undefined, undefined);
    // }
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    return writer.getResultBuffer();
  }

  toObject(includeInstance?: boolean): IGreetingRequest {
    return {
      $jspbMessageInstance: includeInstance ? this : undefined
    };
  }

  static deserializeBinary(bytes: Uint8Array): GreetingRequest {
    return undefined as any;
  }
}

export interface IGreetingResponse {
  greeting: IGreeting[];
}

export class GreetingResponse extends jspb.Message {
  static repeatedFields_ = [1];

  public static create(data: IGreetingResponse) {
    return new GreetingResponse(undefined as any);
  }

  constructor(data: jspb.Message.MessageArray) {
    super();

    // if (Array.isArray(data)) {
    jspb.Message.initialize(
      this,
      data,
      0,
      -1,
      GreetingResponse.repeatedFields_,
      null
    );
    // } else {
    // jspb.Message.setField(this, 1, data?.greeting as any);
    //}
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();

    const list = this.getGreetingList();
    if (list.length > 0) {
      writer.writeRepeatedMessage(1, list, Greeting.serializeBinaryToWriter);
    }

    return writer.getResultBuffer();
  }

  toObject(includeInstance?: boolean): IGreetingResponse & IObject {
    const list = jspb.Message.toObjectList(
      this.getGreetingList(),
      Greeting.toObject,
      includeInstance
    );
    return {
      greeting: list as IGreeting[],
      $jspbMessageInstance: includeInstance ? this : undefined
    };
  }

  getGreetingList(): Greeting[] {
    return jspb.Message.getRepeatedWrapperField(this, Greeting as any, 1);
  }

  static deserializeBinary(bytes: Uint8Array): GreetingResponse {
    return GreetingResponse.deserializeBinaryFromReader(
      new GreetingResponse(undefined as any) as any,
      new jspb.BinaryReader(bytes)
    );
  }

  static deserializeBinaryFromReader(
    msg: GreetingResponse,
    reader: jspb.BinaryReader
  ): GreetingResponse {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1:
          const value = new (Greeting as any)();
          reader.readMessage(value, Greeting.deserializeBinaryFromReader);
          msg.addGreeting(value);
          break;
        default:
          reader.skipField();
          break;
      }
    }
    return msg;
  }

  private addGreeting(opt_value: any, opt_index?: number) {
    return jspb.Message.addToRepeatedWrapperField(
      this,
      1,
      opt_value,
      Greeting as any,
      opt_index
    );
  }
}

export interface IClient {
  host: string;
}

export class GreetingService implements grpc.ServiceDefinition {
  serviceName: string = "greeting.GreetingService";
  public static service = new GreetingService();

  public static Greeting: grpc.UnaryMethodDefinition<
    GreetingRequest,
    GreetingResponse
  > = {
    methodName: "Greeting",
    service: GreetingService.service,
    requestStream: false,
    responseStream: false,
    requestType: GreetingRequest as any,
    responseType: GreetingResponse as any
  };
}

export class GreetingStub {
  constructor(private readonly client: IClient) {}

  greeting(greetingRequest: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      grpc.unary(GreetingService.Greeting as any, {
        host: this.client.host,
        onEnd(output: grpc.UnaryOutput<GreetingResponse>): void {
          if (output.status === grpc.Code.OK) {
            resolve(output.message?.toObject());
          } else {
            const err: any = new Error(output.statusMessage);
            err.code = output.status;
            err.metadata = output.trailers;
            reject(err);
          }
        },
        request: GreetingRequest.create({})
      });
    });
  }
}
