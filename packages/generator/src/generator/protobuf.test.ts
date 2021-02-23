import { parse } from "@hallow/parser";
import fs from "fs";
import {
  ClassDeclarationStructure,
  IndentationText,
  Project,
  SourceFileStructure,
  StatementStructures,
} from "ts-morph";
import { transformToProtobufMessage } from "./protobuf";
import { MessageVisitor } from "./utils";

describe("transformToProtobufMessage", () => {
  it("should transform greeting.proto to typescript", () => {
    const proto = fs.readFileSync("fixtures/proto/greeting.proto", "utf-8");
    const fixtuere = readStructureFrom("fixtures/class/greeting.ts.fixture");

    const parser = parse(proto);
    const generator = new MessageVisitor<ClassDeclarationStructure>(
      transformToProtobufMessage
    );
    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls[0])).toEqual(fixtuere);
  });

  it("should transform greeting-request.proto to typescript", () => {
    const proto = fs.readFileSync(
      "fixtures/proto/greeting-request.proto",
      "utf-8"
    );
    const fixture = readStructureFrom(
      "fixtures/class/greeting-request.ts.fixture"
    );
    const parser = parse(proto);
    const generator = new MessageVisitor<ClassDeclarationStructure>(
      transformToProtobufMessage
    );
    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls[0])).toEqual(fixture);
  });

  it("should transform greeting-response.proto to typescript", () => {
    const proto = fs.readFileSync(
      "fixtures/proto/greeting-response.proto",
      "utf-8"
    );
    const fixture = readStructureFrom(
      "fixtures/class/greeting-response.ts.fixture"
    );
    const parser = parse(proto);
    const generator = new MessageVisitor<ClassDeclarationStructure>(
      transformToProtobufMessage
    );
    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls[0])).toEqual(fixture);
  });
});

function toStructure(statement: StatementStructures): SourceFileStructure {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    },
  });
  const file = project.createSourceFile("fixture.ts", {
    statements: [statement],
  });
  return file.getStructure();
}

function readStructureFrom(path: string): SourceFileStructure {
  const fixture = fs.readFileSync(path, "utf-8");

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    },
  });
  const file = project.createSourceFile("fixture.ts", {
    statements: [fixture],
  });
  return file.getStructure();
}
