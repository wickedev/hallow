import { parse } from "@hallow/parser";
import fs from "fs";
import { ImportDeclarationStructure, OptionalKind } from "ts-morph";
import { defaultImportsWriter, transformToImports } from ".";
import {
  ImportsVisitor,
  readStructureFrom,
  toStructure,
} from "../../test-utils";

describe("transformToImports", () => {
  it("should transform import.proto to typescript", () => {
    const proto = fs.readFileSync("fixtures/import/import.proto", "utf-8");
    const fixtuere = readStructureFrom("fixtures/import/import.ts.fixture");

    const parser = parse(proto);

    const generator = new ImportsVisitor<ImportDeclarationStructure>(
      transformToImports
    );
    const impls = generator.visit(parser.proto());

    expect(impls.length).toBeGreaterThan(0);
    expect(toStructure([defaultImportsWriter, ...impls])).toEqual(fixtuere);
  });
});
