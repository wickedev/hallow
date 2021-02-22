/// <reference types="google-protobuf" />
import * as jspb from "google-protobuf";
import { grpc } from "@improbable-eng/grpc-web";
type Optional<T> = T | undefined;
declare enum Status {
    PENDING = 0,
    FULLFILED = 1,
    REJECTED = 2
}
type PromiseFactory<T> = (...args: any[]) => Promise<T>;
type ForceUpdate = () => void;
declare class Resource<T> {
    private readonly factory;
    status: Status;
    forceUpdate: Optional<ForceUpdate>;
    arguments: Optional<IArguments>;
    mustBeIgnored: boolean;
    private result;
    private suspender;
    constructor(factory: PromiseFactory<T>);
    get canFetch(): boolean;
    read(): Optional<T>;
    refresh(): void;
    private fetch;
}
interface IStackTraceElementProto {
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
declare class StackTraceElementProto extends jspb.Message {
    static create(data: IStackTraceElementProto): StackTraceElementProto;
    static toObject(includeInstance: boolean, message: StackTraceElementProto): IStackTraceElementProto;
    static deserializeBinaryFromReader(message: jspb.Message, reader: jspb.BinaryReader): jspb.Message;
    constructor(data: jspb.Message.MessageArray);
    get className(): string;
    set className(value: string);
    get methodName(): string;
    set methodName(value: string);
    get fileName(): string;
    set fileName(value: string);
    get lineNumber(): number;
    set lineNumber(value: number);
    serializeBinary(): Uint8Array;
    serializeBinaryToWriter(writer: jspb.BinaryWriter): void;
    toObject(includeInstance?: boolean): IStackTraceElementProto;
}
interface IThrowableProto {
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
declare class ThrowableProto extends jspb.Message {
    static repeatedFields_: number[];
    static create(data: IThrowableProto): ThrowableProto;
    static deserializeBinary(bytes: Uint8Array): ThrowableProto;
    static deserializeBinaryFromReader(message: ThrowableProto, reader: jspb.BinaryReader): ThrowableProto;
    static toObject(includeInstance: boolean, message: ThrowableProto): IThrowableProto;
    constructor(data: jspb.Message.MessageArray);
    /*
    readonly originalClassName: string;
    readonly originalMessage: string;
    readonly stackTrace: IStackTraceElementProto[];
    readonly cause: IThrowableProto;
    */
    get originalClassName(): string;
    set originalClassName(value: string);
    get originalMessage(): string;
    set originalMessage(value: string);
    get stackTraceList(): StackTraceElementProto[];
    set stackTraceList(value: StackTraceElementProto[]);
    get cause(): ThrowableProto;
    set cause(value: ThrowableProto);
    addStackTraceElementProto(value: StackTraceElementProto, opt_index?: number): StackTraceElementProto;
    serializeBinary(): Uint8Array;
    serializeBinaryToWriter(writer: jspb.BinaryWriter): void;
    toObject(includeInstance?: boolean): IThrowableProto;
}
declare const statusMap: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    13: string;
    14: string;
    15: string;
    16: string;
};
interface IgRPCError {
    message: string;
    code: number;
    status: string;
    metadata: IMetadata;
}
interface IMetadata {
    throwable: IThrowableProto;
    trailers: any;
}
declare function getMessage<R extends grpc.ProtobufMessage>(output: grpc.UnaryOutput<R>): string;
interface IObject {
    $messageInstance?: jspb.Message;
}
interface IClient {
    host: string;
}
declare function useForceUpdate(): () => void;
export { Resource, Optional, IThrowableProto, ThrowableProto, IStackTraceElementProto, StackTraceElementProto, statusMap, IgRPCError, IMetadata, getMessage, IObject, IClient, useForceUpdate };
