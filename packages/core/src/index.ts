export { Resource } from "./resource";
export { Optional } from "./type";
export {
  IThrowableProto,
  ThrowableProto,
  IStackTraceElementProto,
  StackTraceElementProto,
} from "./internal_exception_messages";
import * as jspb from "google-protobuf";
import { useRef, useState } from "react";
import { grpc } from "@improbable-eng/grpc-web";
import { IThrowableProto } from "./internal_exception_messages";

export const statusMap = {
  [grpc.Code.OK]: "OK",
  [grpc.Code.Canceled]: "Canceled",
  [grpc.Code.Unknown]: "Unknown",
  [grpc.Code.InvalidArgument]: "Invalid Argument",
  [grpc.Code.DeadlineExceeded]: "Deadline Exceeded",
  [grpc.Code.NotFound]: "NotFound",
  [grpc.Code.AlreadyExists]: "Already Exists",
  [grpc.Code.PermissionDenied]: "Permission Denied",
  [grpc.Code.ResourceExhausted]: "Resource Exhausted",
  [grpc.Code.FailedPrecondition]: "Failed Precondition",
  [grpc.Code.Aborted]: "Aborted",
  [grpc.Code.OutOfRange]: "Out Of Range",
  [grpc.Code.Unimplemented]: "Unimplemented",
  [grpc.Code.Internal]: "Internal",
  [grpc.Code.Unavailable]: "Unavailable",
  [grpc.Code.DataLoss]: "DataLoss",
  [grpc.Code.Unauthenticated]: "Unauthenticated",
};

export interface IgRPCError {
  message: string;
  code: number;
  status: string;
  metadata: IMetadata;
}

export interface IMetadata {
  throwable: IThrowableProto;
  trailers: any;
}

export function getMessage<R extends grpc.ProtobufMessage>(
  output: grpc.UnaryOutput<R>
): string {
  return output.statusMessage || "Unknown Error";
}

export interface IObject {
  $messageInstance?: jspb.Message;
}

export interface IClient {
  host: string;
}

export function useForceUpdate(): () => void {
  const setValue = useState(0)[1];
  return useRef(() => setValue((v) => ~v)).current;
}
