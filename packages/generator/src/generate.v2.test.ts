import fs from "fs";
import { parse } from "@hallow/parser";
import { MessageInterfaceGenerator } from "./generator/interfaces";
import { stripIndent } from "./generate.test";

describe("Name of the group", () => {
  it("should ", () => {
    const proto = fs.readFileSync("fixtures/greeting_proto.proto", "utf-8");
    const fixture = stripIndent(
      fs.readFileSync("fixtures/greeting-pb.ts", "utf-8")
    );
    const parser = parse(proto);
    const generator = new MessageInterfaceGenerator();
    const interfaces = generator.generate(parser.proto());

    interfaces.forEach((code) => {
      expect(fixture).toContain(stripIndent(code));
    });
  });
});
