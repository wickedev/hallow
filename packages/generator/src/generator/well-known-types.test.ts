import { convertTypeInfo } from "./well-known-types";

describe("WellKnownTypes", () => {
  it("should convernt google.protobuf.Int32Value to number", () => {
    const info = convertTypeInfo("google.protobuf.Int32Value");
    expect(info.type).toEqual("number");
    expect(info.protoType).toEqual("Int32Value");
  });

  it("should convernt google.protobuf.Empty to void", () => {
    const info = convertTypeInfo("google.protobuf.Empty");
    expect(info.type).toEqual("void");
    expect(info.protoType).toEqual("Empty");
  });

  it("should convernt Greeting to Greeting", () => {
    const info = convertTypeInfo("Greeting");
    expect(info.type).toEqual("Greeting");
  });

  it("should convernt as interface Greeting to IGreeting", () => {
    const info = convertTypeInfo("Greeting", true);
    expect(info.type).toEqual("IGreeting");
  });
});
