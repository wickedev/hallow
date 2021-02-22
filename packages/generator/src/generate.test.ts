import fs from "fs";
import { parse } from "@hallow/parser";
import { gRpcProtoGenerator as GRpcProtoGenerator } from "./generator";
import { createMemoryFiles, stripSpace } from "./utils";

describe("MessageInterfaceGenerator", () => {
  it("should generate code in fixtures", () => {
    const proto = fs.readFileSync("fixtures/greeting_proto.proto", "utf-8");
    const fixture = stripSpace(
      fs.readFileSync("fixtures/greeting.ts.fixture", "utf-8")
    );

    const parser = parse(proto);
    const generator = new GRpcProtoGenerator();
    const interfaces = generator.visit(parser.proto());

    expect(interfaces.length).toBeGreaterThan(0);

    const files = createMemoryFiles(interfaces);

    for (const file of files) {
      if (file.filePath.endsWith(".d.ts")) {
        console.log(file.text);

        expect(fixture).toContain(stripSpace(file.text));
      }
    }
  });
});
