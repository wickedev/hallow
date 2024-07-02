interface IType {
  readonly type: string;
  readonly protoType: string;
  readonly isEmpty?: boolean;
}
interface TypesInfos {
  [key: string]: IType;
}

interface ProtoFileInfos {
  [key: string]: IProtoFileInfo;
}

interface IProtoFileInfo {
  defaultImport: string;
  moduleSpecifier: string;
}

type OptionProtoType<T extends IType> = Pick<T, Exclude<keyof T, "protoType">> &
  Partial<Pick<T, "protoType">>;

const AnyTypes: TypesInfos = {
  "google.protobuf.Any": {
    type: "any",
    protoType: "any_pb.Any",
  },
};

const WrappersTypes: TypesInfos = {
  "google.protobuf.BoolValue": {
    type: "boolean",
    protoType: "wrappers_pb.BoolValue",
  },
  "google.protobuf.BytesValue": {
    type: "ArrayBuffer",
    protoType: "wrappers_pb.BytesValue",
  },
  "google.protobuf.DoubleValue": {
    type: "number",
    protoType: "wrappers_pb.DoubleValue",
  },
  "google.protobuf.FloatValue": {
    type: "number",
    protoType: "wrappers_pb.FloatValue",
  },
  "google.protobuf.Int32Value": {
    type: "number",
    protoType: "wrappers_pb.Int32Value",
  },
  "google.protobuf.Int64Value": {
    type: "number",
    protoType: "wrappers_pb.Int64Value",
  },
  "google.protobuf.StringValue": {
    type: "string",
    protoType: "wrappers_pb.StringValue",
  },
  "google.protobuf.UInt32Value": {
    type: "number",
    protoType: "wrappers_pb.UInt32Value",
  },
  "google.protobuf.UInt64Value": {
    type: "number",
    protoType: "wrappers_pb.UInt64Value",
  },
};

const EmptyTypes: TypesInfos = {
  "google.protobuf.Empty": {
    isEmpty: true,
    type: "void",
    protoType: "empty_pb.Empty",
  },
};
export const ImportProtoFiles: ProtoFileInfos = {
  'google/protobuf/empty.proto': {
    defaultImport: "empty_pb",
    moduleSpecifier: "google-protobuf/google/protobuf/empty_pb",
  },
  'google/protobuf/wrappers.proto': {
    defaultImport: "wrappers_pb",
    moduleSpecifier: "google-protobuf/google/protobuf/wrappers_pb",
  },
};

const WellKnowTypes: TypesInfos = {
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
