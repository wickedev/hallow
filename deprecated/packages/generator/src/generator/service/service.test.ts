import { parse } from "@hallow/parser";
import fs from "fs";
import { ClassDeclarationStructure } from "ts-morph";
import { transformToService } from ".";
import {
  readStructureFrom,
  ServiceVisitor,
  toStructure,
} from "../../test-utils";

describe("transformToService", () => {
  it("should transform greeting-service.proto to typescript service", () => {
    const proto = fs.readFileSync(
      "fixtures/proto/greeting-service.proto",
      "utf-8"
    );
    const fixtuere = readStructureFrom(
      "fixtures/service/greeting-service.ts.fixture"
    );

    const parser = parse(proto);

    const generator = new ServiceVisitor<ClassDeclarationStructure>(
      transformToService
    );

    const impls = generator.visit(parser.proto());
    expect(impls.length).toEqual(1);
    expect(toStructure(impls)).toEqual(fixtuere);
  });
});
