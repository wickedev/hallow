import base64 from "base64-js";
import { grpc } from "@improbable-eng/grpc-web";

const utf8Decoder = new TextDecoder("UTF-8");

export function base64Decode(message: string) {
  const bytes = base64.toByteArray(message);
  return utf8Decoder.decode(bytes);
}

export type Optional<T> = T | undefined;

export const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

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
  [grpc.Code.Unauthenticated]: "Unauthenticated"
};
