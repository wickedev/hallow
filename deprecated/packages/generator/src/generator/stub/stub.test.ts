import { parse } from "@hallow/parser";
import fs from "fs";
import { ClassDeclarationStructure } from "ts-morph";
import { transformToStub } from ".";
import {
  readStructureFrom,
  ServiceVisitor,
  toStructure,
} from "../../test-utils";

describe("transformToStub", () => {
  it("should transform greeting-service.proto to typescript stub", () => {
    const proto = fs.readFileSync(
      "fixtures/proto/greeting-service.proto",
      "utf-8"
    );
    const fixtuere = readStructureFrom(
      "fixtures/stub/greeting-stub.ts.fixture"
    );

    const parser = parse(proto);

    const generator = new ServiceVisitor<ClassDeclarationStructure>(
      transformToStub
    );

    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls)).toEqual(fixtuere);
  });
});
