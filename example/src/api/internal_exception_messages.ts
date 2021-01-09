import * as jspb from "google-protobuf";

export interface IStackTraceElementProto {
  readonly className: string;

  // The name of the method containing the execution point represented by the
  // stack trace element
  readonly methodName: string;

  // The name of the file containing the execution point represented by the
  // stack trace element, or null if this information is unavailable.
  readonly fileName: string;

  // The line number of the source line containing the execution point represented
  // by this stack trace element, or a negative number if this information is
  // unavailable.
  readonly lineNumber: number;
}

export class StackTraceElementProto extends jspb.Message {
  static create(data: IStackTraceElementProto): StackTraceElementProto {
    const message = new StackTraceElementProto([]);
    message.className = data.className;
    message.methodName = data.methodName;
    message.fileName = data.fileName;
    message.lineNumber = data.lineNumber;

    return message;
  }

  static toObject(
    includeInstance: boolean,
    message: StackTraceElementProto
  ): IStackTraceElementProto {
    return {
      className: message.className,
      methodName: message.methodName,
      fileName: message.fileName,
      lineNumber: message.lineNumber
    };
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
          jspb.Message.setField(message, 1, reader.readString());
          break;
        case 2:
          jspb.Message.setField(message, 2, reader.readString());
          break;
        case 3:
          jspb.Message.setField(message, 3, reader.readString());
          break;
        case 4:
          jspb.Message.setField(message, 4, reader.readInt32());
          break;
        default:
          reader.skipField();
          break;
      }
    }
    return message;
  }

  constructor(data: jspb.Message.MessageArray) {
    super();

    jspb.Message.initialize(this, data, 0, -1, undefined, undefined);
  }

  get className(): string {
    return jspb.Message.getField(this, 1) as string;
  }

  set className(value: string) {
    jspb.Message.setField(this, 1, value);
  }

  get methodName(): string {
    return jspb.Message.getField(this, 2) as string;
  }

  set methodName(value: string) {
    jspb.Message.setField(this, 2, value);
  }

  get fileName(): string {
    return jspb.Message.getField(this, 3) as string;
  }

  set fileName(value: string) {
    jspb.Message.setField(this, 3, value);
  }

  get lineNumber(): number {
    return jspb.Message.getField(this, 4) as number;
  }

  set lineNumber(value: number) {
    jspb.Message.setField(this, 4, value);
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    this.serializeBinaryToWriter(writer);
    return writer.getResultBuffer();
  }

  serializeBinaryToWriter(writer: jspb.BinaryWriter) {
    let v;
    if ((v = this.className) != null) {
      writer.writeString(1, v);
    }
    if ((v = this.methodName) != null) {
      writer.writeString(2, v);
    }
    if ((v = this.fileName) != null) {
      writer.writeString(3, v);
    }
    if ((v = this.lineNumber) != null) {
      writer.writeInt32(4, v);
    }
  }

  toObject(includeInstance: boolean = false): IStackTraceElementProto {
    return StackTraceElementProto.toObject(includeInstance, this);
  }
}

export interface IThrowableProto {
  // The name of the class of the exception that was actually thrown. Downstream readers
  // of this message may or may not have the actual class available to initialize, so
  // this is just used to prefix the message of a generic exception type.
  readonly originalClassName: string;

  // The message of this throwable. Not filled if there is no message.
  readonly originalMessage: string;

  // The stack trace of this Throwable.
  readonly stackTrace: IStackTraceElementProto[];

  // The cause of this Throwable. Not filled if there is no cause.
  readonly cause: IThrowableProto;
}

export class ThrowableProto extends jspb.Message {
  static repeatedFields_ = [3];

  static create(data: IThrowableProto) {
    const message = new ThrowableProto([]);

    message.stackTraceList = data.stackTrace.map(StackTraceElementProto.create);
    return message;
  }
  static deserializeBinary(bytes: Uint8Array): ThrowableProto {
    return ThrowableProto.deserializeBinaryFromReader(
      new ThrowableProto([]),
      new jspb.BinaryReader(bytes)
    );
  }

  static deserializeBinaryFromReader(
    message: ThrowableProto,
    reader: jspb.BinaryReader
  ): ThrowableProto {
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
        case 3:
          const value = new StackTraceElementProto(undefined as any);
          reader.readMessage(
            value,
            StackTraceElementProto.deserializeBinaryFromReader
          );
          message.addStackTraceElementProto(value);
          break;
        case 4:
          jspb.Message.setWrapperField(
            message,
            1,
            ThrowableProto.deserializeBinaryFromReader(
              new ThrowableProto(undefined as any),
              reader
            )
          );
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
    message: ThrowableProto
  ): IThrowableProto {
    const list = jspb.Message.toObjectList(
      message.stackTraceList,
      StackTraceElementProto.toObject,
      includeInstance
    );

    return {
      originalClassName: message.originalClassName,
      originalMessage: message.originalMessage,
      stackTrace: list as StackTraceElementProto[],
      cause: message.cause?.toObject()
    };
  }

  constructor(data: jspb.Message.MessageArray) {
    super();

    jspb.Message.initialize(
      this,
      data,
      0,
      -1,
      ThrowableProto.repeatedFields_,
      null
    );
  }

  /*
  readonly originalClassName: string;
  readonly originalMessage: string;
  readonly stackTrace: IStackTraceElementProto[];
  readonly cause: IThrowableProto;
   */

  get originalClassName(): string {
    return jspb.Message.getField(this, 1) as string;
  }

  set originalClassName(value: string) {
    jspb.Message.setField(this, 1, value);
  }

  get originalMessage(): string {
    return jspb.Message.getField(this, 2) as string;
  }

  set originalMessage(value: string) {
    jspb.Message.setField(this, 2, value);
  }

  get stackTraceList(): StackTraceElementProto[] {
    return jspb.Message.getRepeatedWrapperField(
      this,
      StackTraceElementProto as any,
      3
    );
  }

  set stackTraceList(value: StackTraceElementProto[]) {
    jspb.Message.setRepeatedWrapperField(this, 3, value);
  }

  get cause(): ThrowableProto {
    return jspb.Message.getWrapperField(
      this,
      ThrowableProto as any,
      4
    ) as ThrowableProto;
  }

  set cause(value: ThrowableProto) {
    jspb.Message.setWrapperField(this, 4, value);
  }

  addStackTraceElementProto(value: StackTraceElementProto, opt_index?: number) {
    return jspb.Message.addToRepeatedWrapperField(
      this,
      3,
      value,
      StackTraceElementProto as any,
      opt_index
    );
  }

  serializeBinary(): Uint8Array {
    const writer = new jspb.BinaryWriter();
    this.serializeBinaryToWriter(writer);
    return writer.getResultBuffer();
  }

  serializeBinaryToWriter(writer: jspb.BinaryWriter) {
    /* originalClassName */
    let v;
    if ((v = this.originalClassName) != null) {
      writer.writeString(1, v);
    }
    /* originalMessage */
    if ((v = this.originalMessage) != null) {
      writer.writeString(2, v);
    }

    /* stackTrace */
    const list = this.stackTraceList;

    if (list.length > 0) {
      writer.writeRepeatedMessage(
        3,
        list,
        StackTraceElementProto.serializeBinaryToWriter
      );
    }

    /* cause */
    if ((v = this.cause) != null) {
      writer.writeMessage(3, v, this.serializeBinaryToWriter);
    }
  }

  toObject(includeInstance: boolean = false): IThrowableProto {
    return ThrowableProto.toObject(includeInstance, this);
  }
}
