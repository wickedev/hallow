import { parse } from "@hallow/parser";
import fs from "fs";
import {
  Project,
  ScriptTarget,
  StatementStructures,
  WriterFunction,
} from "ts-morph";
import { GrpcProtoGenerator as GRpcProtoGenerator } from "./generator";
import { readStructureFrom, toStructure } from "./test-utils";

describe("MessageInterfaceGenerator", () => {
  it("should generate code in fixtures", () => {
    const proto = fs.readFileSync("fixtures/greeting_proto.proto", "utf-8");
    const fixture = readStructureFrom("fixtures/greeting.ts.fixture");

    const parser = parse(proto);
    const generator = new GRpcProtoGenerator();
    const result = generator.visit(parser.proto());

    expect(result.length).toBeGreaterThan(0);
    // expect(toStructure(result)).toEqual(fixture);
    createFiles(result);
  });
});

export function createFiles(
  statements:
    | (string | WriterFunction | StatementStructures)[]
    | string
    | WriterFunction
) {
  const project = new Project({
    compilerOptions: {
      outDir: "dist",
      declaration: true,
      target: ScriptTarget.ESNext,
    },
  });

  project.createSourceFile(
    "dist/result.ts",
    {
      statements,
    },
    { overwrite: true }
  );

  project.save();
}
