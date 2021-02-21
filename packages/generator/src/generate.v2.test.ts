import fs from "fs";
import { parse } from "@hallow/parser";
import { Project, ScriptTarget, StructureKind } from "ts-morph";
import { MessageInterfaceGenerator } from "./generator/interfaces";
import { createMemoryFiles, stripIndent } from "./utils";

describe("MessageInterfaceGenerator", () => {
  it("should generate code in fixtures", () => {
    const proto = fs.readFileSync("fixtures/greeting_proto.proto", "utf-8");
    const fixture = stripIndent(
      fs.readFileSync("fixtures/greeting-pb.ts", "utf-8")
    );
    const parser = parse(proto);
    const generator = new MessageInterfaceGenerator();
    const interfaces = generator.visit(parser.proto());
    const files = createMemoryFiles(interfaces);

    for (const file of files) {
      if (file.filePath.endsWith(".d.ts")) {
        console.log(file.text);
        
        expect(fixture).toContain(stripIndent(file.text));
      }
    }
  });
});
