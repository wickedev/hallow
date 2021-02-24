interface IType {
  readonly packages?: string;
  readonly type: string;
  readonly protoType: string;
  readonly isEmpty?: boolean;
}
interface TypesInfo {
  [key: string]: IType;
}

type OptionProtoType<T extends IType> = Pick<T, Exclude<keyof T, "protoType">> &
  Partial<Pick<T, "protoType">>;

const AnyTypes: TypesInfo = {
  "google.protobuf.Any": {
    packages: "google-protobuf/google/protobuf/any_pb.js",
    type: "any",
    protoType: "Any",
  },
};

const WrappersTypes: TypesInfo = {
  "google.protobuf.BoolValue": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "boolean",
    protoType: "BoolValue",
  },
  "google.protobuf.BytesValue": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "ArrayBuffer",
    protoType: "BytesValue",
  },
  "google.protobuf.DoubleValue": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "number",
    protoType: "DoubleValue",
  },
  "google.protobuf.FloatValue": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "number",
    protoType: "FloatValue",
  },
  "google.protobuf.Int32Value": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "number",
    protoType: "Int32Value",
  },
  "google.protobuf.Int64Value": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "number",
    protoType: "Int64Value",
  },
  "google.protobuf.StringValue": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "string",
    protoType: "StringValue",
  },
  "google.protobuf.UInt32Value": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "number",
    protoType: "UInt32Value",
  },
  "google.protobuf.UInt64Value": {
    packages: "google-protobuf/google/protobuf/wrappers_pb.js",
    type: "number",
    protoType: "UInt64Value",
  },
};

const EmptyTypes: TypesInfo = {
  "google.protobuf.Empty": {
    packages: "google-protobuf/google/protobuf/empty_pb.js",
    isEmpty: true,
    type: "void",
    protoType: "Empty",
  },
};

const WellKnowTypes: TypesInfo = {
  ...AnyTypes,
  ...EmptyTypes,
  ...WrappersTypes,
};

export function convertTypeInfo(
  type: string,
  asInterface: boolean = false
): IType {
  const wrapperType = WellKnowTypes[type];

  if (wrapperType) {
    return wrapperType;
  }

  if (asInterface) {
    return { type: `I${type}`, protoType: `I${type}` };
  }

  return { type, protoType: type };
}
