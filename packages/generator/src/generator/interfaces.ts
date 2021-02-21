import {
  MessageBlockContext,
  parse,
  ProtoVisitor,
  ProtoParser,
  ServiceBlockContext,
  ProtoContext,
} from "@hallow/parser";

export class MessageInterfaceGenerator extends ProtoVisitor<MessageBlockContext> {
  protected defaultResult(): MessageBlockContext {
    return null as any;
  }

  generate(proto: ProtoContext): string[] {
    const ast = this.visit(proto);
    return [
      `export interface IGreeting {
        readonly message: string;
        readonly created?: string;
      }`,
      `export interface IGreetingRequest {
        readonly name: string;
      }`,
      `export interface IGreetingResponse {
        greeting: IGreeting[];
      }`,
    ];
  }
}
