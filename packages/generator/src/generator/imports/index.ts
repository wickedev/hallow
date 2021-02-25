import { ImportStatementContext, ProtoContext } from "@hallow/parser";
import {
  CodeBlockWriter,
  ImportDeclarationStructure,
  OptionalKind,
  StructureKind,
  WriterFunction,
} from "ts-morph";
import { ImportProtoFiles } from "../well-known-types";

export function defaultImportsWriter(writer: CodeBlockWriter) {
  writer
    .write("import {")
    .indent(() => {
      writer.writeLine("createUnaryOnEndHandler,");
      writer.writeLine("IClient,");
      writer.writeLine("IObject,");
      writer.writeLine("Optional,");
      writer.writeLine("Resource,");
      writer.writeLine("useForceUpdate,");
    })
    .writeLine('} from "@hallow/core";');
  writer.writeLine('import { grpc } from "@improbable-eng/grpc-web";');
  writer.writeLine(
    'import { ProtobufMessageClass } from "@improbable-eng/grpc-web/dist/typings/message";'
  );
  writer.writeLine('import * as jspb from "google-protobuf";');
  writer.writeLine('import { useEffect } from "react";');
}

export function transformToImports(
  importStatement: ImportStatementContext
): ImportDeclarationStructure {
  const fileReference = importStatement
    .fileReference()
    .STRING_VALUE()
    .text.replace(/\"/g, "");
  const info = ImportProtoFiles[fileReference];
  const moduleName = fileReference.replace(/.proto$/i, "");

  const defaultImport = info ? info.defaultImport : moduleName;
  const moduleSpecifier = info ? info.moduleSpecifier : `./${moduleName}`;

  return {
    kind: StructureKind.ImportDeclaration,
    defaultImport,
    moduleSpecifier,
  };
}
