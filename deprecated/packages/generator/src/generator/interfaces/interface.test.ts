import { parse } from "@hallow/parser";
import fs from "fs";
import {
  IndentationText,
  InterfaceDeclarationStructure,
  Project,
  SourceFileStructure,
  StatementStructures,
} from "ts-morph";
import { transformToInterface } from ".";
import { MessageVisitor, toStructure } from "../../test-utils";

describe("transformToInterface", () => {
  it("should transform greeting.proto to typescript", () => {
    const proto = fs.readFileSync("fixtures/proto/greeting.proto", "utf-8");
    const fixtuere = readStructureFrom(
      "fixtures/interfaces/greeting.ts.fixture"
    );

    const parser = parse(proto);
    const generator = new MessageVisitor<InterfaceDeclarationStructure>(
      transformToInterface
    );
    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls)).toEqual(fixtuere);
  });

  it("should transform greeting-request.proto to typescript", () => {
    const proto = fs.readFileSync(
      "fixtures/proto/greeting-request.proto",
      "utf-8"
    );
    const fixture = readStructureFrom(
      "fixtures/interfaces/greeting-request.ts.fixture"
    );
    const parser = parse(proto);
    const generator = new MessageVisitor<InterfaceDeclarationStructure>(
      transformToInterface
    );
    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls)).toEqual(fixture);
  });

  it("should transform greeting-response.proto to typescript interface", () => {
    const proto = fs.readFileSync(
      "fixtures/proto/greeting-response.proto",
      "utf-8"
    );
    const fixture = readStructureFrom(
      "fixtures/interfaces/greeting-response.ts.fixture"
    );
    const parser = parse(proto);
    const generator = new MessageVisitor<InterfaceDeclarationStructure>(
      transformToInterface
    );
    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls)).toEqual(fixture);
  });
});

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
