import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';
import { Protobuf3Lexer } from '../src/generated/grammar/Protobuf3Lexer';
import { Protobuf3Parser } from '../src/generated/grammar/Protobuf3Parser';
import { Protobuf3Listener } from '../src/generated/grammar/Protobuf3Listener';
import { 
  ProtoContext, 
  ServiceDefContext, 
  MessageDefContext, 
  EnumDefContext,
  FieldContext,
  RpcContext,
  MessageElementContext,
  ServiceElementContext,
  EnumElementContext
} from '../src';

describe('Protobuf3Parser - Generated Code Tests', () => {
  function parseProto(content: string): ProtoContext {
    const inputStream = CharStreams.fromString(content);
    const lexer = new Protobuf3Lexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new Protobuf3Parser(tokenStream);
    return parser.proto();
  }

  describe('Basic Parsing', () => {
    test('should parse minimal proto file', () => {
      const proto = `syntax = "proto3";`;
      const tree = parseProto(proto);
      
      expect(tree).toBeDefined();
      expect(tree.syntax()).toBeDefined();
      expect(tree.syntax()!.SYNTAX()).toBeDefined();
      expect(tree.syntax()!.PROTO3_LIT_DOBULE() || tree.syntax()!.PROTO3_LIT_SINGLE()).toBeDefined();
    });

    test('should parse package statement', () => {
      const proto = `
        syntax = "proto3";
        package example.test;
      `;
      const tree = parseProto(proto);
      
      expect(tree.packageStatement()).toHaveLength(1);
      expect(tree.packageStatement(0).fullIdent().text).toBe('example.test');
    });

    test('should parse import statements', () => {
      const proto = `
        syntax = "proto3";
        import "google/protobuf/timestamp.proto";
        import public "other.proto";
        import weak "weak.proto";
      `;
      const tree = parseProto(proto);
      
      expect(tree.importStatement()).toHaveLength(3);
      expect(tree.importStatement(0).strLit().text).toContain('google/protobuf/timestamp.proto');
      expect(tree.importStatement(1).PUBLIC()).toBeDefined();
      expect(tree.importStatement(2).WEAK()).toBeDefined();
    });
  });

  describe('Service Parsing', () => {
    test('should parse service definition', () => {
      const proto = `
        syntax = "proto3";
        service Greeter {
          rpc SayHello (HelloRequest) returns (HelloReply);
        }
      `;
      const tree = parseProto(proto);
      
      const topLevelDefs = tree.topLevelDef();
      expect(topLevelDefs).toHaveLength(1);
      
      const serviceDef = topLevelDefs[0].serviceDef();
      expect(serviceDef).toBeDefined();
      expect(serviceDef!.serviceName().text).toBe('Greeter');
      
      const serviceElements = serviceDef!.serviceElement();
      expect(serviceElements).toHaveLength(1);
      
      const rpc = serviceElements[0].rpc();
      expect(rpc).toBeDefined();
      expect(rpc!.rpcName().text).toBe('SayHello');
      expect(rpc!.messageType(0).text).toBe('HelloRequest');
      expect(rpc!.messageType(1).text).toBe('HelloReply');
    });

    test('should parse streaming RPCs', () => {
      const proto = `
        syntax = "proto3";
        service Test {
          rpc Unary (Request) returns (Response);
          rpc ServerStream (Request) returns (stream Response);
          rpc ClientStream (stream Request) returns (Response);
          rpc BidiStream (stream Request) returns (stream Response);
        }
      `;
      const tree = parseProto(proto);
      const serviceDef = tree.topLevelDef(0).serviceDef()!;
      const rpcs = serviceDef.serviceElement().map(e => e.rpc()!);
      
      expect(rpcs).toHaveLength(4);
      
      // Check for STREAM tokens
      expect(rpcs[0].STREAM()).toHaveLength(0);
      expect(rpcs[1].STREAM()).toHaveLength(1);
      expect(rpcs[2].STREAM()).toHaveLength(1);
      expect(rpcs[3].STREAM()).toHaveLength(2);
    });
  });

  describe('Message Parsing', () => {
    test('should parse message definition', () => {
      const proto = `
        syntax = "proto3";
        message Person {
          string name = 1;
          int32 age = 2;
          repeated string emails = 3;
        }
      `;
      const tree = parseProto(proto);
      
      const messageDef = tree.topLevelDef(0).messageDef()!;
      expect(messageDef.messageName().text).toBe('Person');
      
      const messageElements = messageDef.messageBody()!.messageElement();
      expect(messageElements).toHaveLength(3);
      
      // First field
      const field1 = messageElements[0].field()!;
      expect(field1.fieldName().text).toBe('name');
      expect(field1.type_().text).toBe('string');
      expect(field1.fieldNumber().text).toBe('1');
      
      // Third field with repeated
      const field3 = messageElements[2].field()!;
      expect(field3.fieldLabel()?.REPEATED()).toBeDefined();
      expect(field3.fieldName().text).toBe('emails');
    });

    test('should parse nested messages', () => {
      const proto = `
        syntax = "proto3";
        message Outer {
          message Inner {
            string value = 1;
          }
          Inner inner = 1;
        }
      `;
      const tree = parseProto(proto);
      
      const outerMessage = tree.topLevelDef(0).messageDef()!;
      expect(outerMessage.messageName().text).toBe('Outer');
      
      const messageElements = outerMessage.messageBody()!.messageElement();
      expect(messageElements).toHaveLength(2);
      
      // Nested message
      const innerMessage = messageElements[0].messageDef()!;
      expect(innerMessage.messageName().text).toBe('Inner');
      
      // Field using nested type
      const field = messageElements[1].field()!;
      expect(field.type_().text).toBe('Inner');
    });

    test('should parse map fields', () => {
      const proto = `
        syntax = "proto3";
        message Test {
          map<string, string> metadata = 1;
          map<int32, Message> objects = 2;
        }
      `;
      const tree = parseProto(proto);
      
      const messageDef = tree.topLevelDef(0).messageDef()!;
      const messageElements = messageDef.messageBody()!.messageElement();
      
      const map1 = messageElements[0].mapField()!;
      expect(map1.keyType().text).toBe('string');
      expect(map1.type_().text).toBe('string');
      expect(map1.mapName().text).toBe('metadata');
      
      const map2 = messageElements[1].mapField()!;
      expect(map2.keyType().text).toBe('int32');
      expect(map2.type_().text).toBe('Message');
    });

    test('should parse oneof fields', () => {
      const proto = `
        syntax = "proto3";
        message Contact {
          oneof contact {
            string email = 1;
            string phone = 2;
          }
        }
      `;
      const tree = parseProto(proto);
      
      const messageDef = tree.topLevelDef(0).messageDef()!;
      const oneof = messageDef.messageBody()!.messageElement(0).oneof()!;
      
      expect(oneof.oneofName().text).toBe('contact');
      
      const oneofFields = oneof.oneofField();
      expect(oneofFields).toHaveLength(2);
      expect(oneofFields[0].fieldName().text).toBe('email');
      expect(oneofFields[1].fieldName().text).toBe('phone');
    });

    test('should parse reserved fields', () => {
      const proto = `
        syntax = "proto3";
        message Test {
          reserved 2, 15, 9 to 11;
          reserved "foo", "bar";
        }
      `;
      const tree = parseProto(proto);
      
      const messageDef = tree.topLevelDef(0).messageDef()!;
      const messageElements = messageDef.messageBody()!.messageElement();
      
      const reserved1 = messageElements[0].reserved()!;
      expect(reserved1.ranges()).toBeDefined();
      
      const reserved2 = messageElements[1].reserved()!;
      expect(reserved2.reservedFieldNames()).toBeDefined();
      expect(reserved2.reservedFieldNames()!.strLit()).toHaveLength(2);
    });
  });

  describe('Enum Parsing', () => {
    test('should parse enum definition', () => {
      const proto = `
        syntax = "proto3";
        enum Status {
          UNKNOWN = 0;
          ACTIVE = 1;
          INACTIVE = 2;
        }
      `;
      const tree = parseProto(proto);
      
      const enumDef = tree.topLevelDef(0).enumDef()!;
      expect(enumDef.enumName().text).toBe('Status');
      
      const enumElements = enumDef.enumBody()!.enumElement();
      expect(enumElements).toHaveLength(3);
      
      const field1 = enumElements[0].enumField()!;
      expect(field1.ident().text).toBe('UNKNOWN');
      expect(field1.intLit().text).toBe('0');
    });

    test('should parse enum with options', () => {
      const proto = `
        syntax = "proto3";
        enum Status {
          option allow_alias = true;
          UNKNOWN = 0;
          NOT_SET = 0;
        }
      `;
      const tree = parseProto(proto);
      
      const enumDef = tree.topLevelDef(0).enumDef()!;
      const enumElements = enumDef.enumBody()!.enumElement();
      
      const option = enumElements[0].optionStatement()!;
      expect(option.optionName().text).toBe('allow_alias');
      expect(option.constant().text).toBe('true');
    });
  });

  describe('Options Parsing', () => {
    test('should parse file options', () => {
      const proto = `
        syntax = "proto3";
        option java_package = "com.example";
        option go_package = "github.com/example/proto";
        option optimize_for = SPEED;
      `;
      const tree = parseProto(proto);
      
      const options = tree.optionStatement();
      expect(options).toHaveLength(3);
      
      expect(options[0].optionName().text).toBe('java_package');
      expect(options[0].constant().strLit()?.text).toContain('com.example');
      
      expect(options[2].optionName().text).toBe('optimize_for');
      expect(options[2].constant().fullIdent()?.text).toBe('SPEED');
    });

    test('should parse field options', () => {
      const proto = `
        syntax = "proto3";
        message Test {
          string field = 1 [deprecated = true, (custom_option) = "value"];
        }
      `;
      const tree = parseProto(proto);
      
      const field = tree.topLevelDef(0).messageDef()!.messageBody()!.messageElement(0).field()!;
      const fieldOptions = field.fieldOptions()!.fieldOption();
      
      expect(fieldOptions).toHaveLength(2);
      expect(fieldOptions[0].optionName().text).toBe('deprecated');
      expect(fieldOptions[0].constant().text).toBe('true');
      
      expect(fieldOptions[1].optionName().text).toBe('(custom_option)');
      expect(fieldOptions[1].constant().strLit()?.text).toContain('value');
    });
  });

  describe('Listener Pattern', () => {
    test('should walk parse tree with listener', () => {
      const proto = `
        syntax = "proto3";
        service Greeter {
          rpc SayHello (Request) returns (Response);
        }
        message Request {
          string name = 1;
        }
      `;
      
      const tree = parseProto(proto);
      
      let serviceCount = 0;
      let messageCount = 0;
      let rpcCount = 0;
      let fieldCount = 0;
      
      class TestListener implements Protobuf3Listener {
        visitTerminal = () => {};
        visitErrorNode = () => {};
        enterEveryRule = () => {};
        exitEveryRule = () => {};
        
        enterServiceDef(ctx: ServiceDefContext): void {
          serviceCount++;
        }
        
        enterMessageDef(ctx: MessageDefContext): void {
          messageCount++;
        }
        
        enterRpc(ctx: RpcContext): void {
          rpcCount++;
        }
        
        enterField(ctx: FieldContext): void {
          fieldCount++;
        }
      }
      
      const listener = new TestListener();
      ParseTreeWalker.DEFAULT.walk(listener, tree);
      
      expect(serviceCount).toBe(1);
      expect(messageCount).toBe(1);
      expect(rpcCount).toBe(1);
      expect(fieldCount).toBe(1);
    });
  });

  describe('Error Recovery', () => {
    test('should handle syntax errors gracefully', () => {
      const proto = `
        syntax = "proto3";
        service Test {
          rpc Method (Request returns (Response); // Missing )
        }
      `;
      
      expect(() => {
        const tree = parseProto(proto);
        // Parser should still return a tree, even if it's incomplete
        expect(tree).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Complex Proto Files', () => {
    test('should parse complete proto file', () => {
      const proto = `
        syntax = "proto3";
        
        package example.v1;
        
        import "google/protobuf/timestamp.proto";
        
        option java_package = "com.example.v1";
        option go_package = "example.com/proto/v1";
        
        enum Status {
          UNKNOWN = 0;
          ACTIVE = 1;
          INACTIVE = 2;
        }
        
        message User {
          string id = 1;
          string email = 2;
          Status status = 3;
          
          message Profile {
            string first_name = 1;
            string last_name = 2;
          }
          
          Profile profile = 4;
          
          map<string, string> metadata = 5;
          
          oneof contact {
            string phone = 6;
            string address = 7;
          }
          
          repeated string roles = 8;
          
          google.protobuf.Timestamp created_at = 9;
          
          reserved 10 to 15;
          reserved "old_field";
        }
        
        service UserService {
          rpc GetUser (GetUserRequest) returns (User) {}
          rpc ListUsers (ListUsersRequest) returns (stream User) {}
          rpc CreateUser (User) returns (User) {}
          rpc UpdateUser (stream UpdateUserRequest) returns (UpdateUserResponse) {}
        }
        
        message GetUserRequest {
          string id = 1;
        }
        
        message ListUsersRequest {
          int32 page_size = 1;
          string page_token = 2;
        }
        
        message UpdateUserRequest {
          User user = 1;
          repeated string update_mask = 2;
        }
        
        message UpdateUserResponse {
          User user = 1;
        }
      `;
      
      const tree = parseProto(proto);
      
      // Check package
      expect(tree.packageStatement(0).fullIdent().text).toBe('example.v1');
      
      // Check imports
      expect(tree.importStatement()).toHaveLength(1);
      
      // Check options
      expect(tree.optionStatement()).toHaveLength(2);
      
      // Count top-level definitions
      const topLevelDefs = tree.topLevelDef();
      let enumCount = 0;
      let messageCount = 0;
      let serviceCount = 0;
      
      topLevelDefs.forEach(def => {
        if (def.enumDef()) enumCount++;
        if (def.messageDef()) messageCount++;
        if (def.serviceDef()) serviceCount++;
      });
      
      expect(enumCount).toBe(1);
      expect(messageCount).toBe(5); // User, GetUserRequest, ListUsersRequest, UpdateUserRequest, UpdateUserResponse
      expect(serviceCount).toBe(1);
      
      // Check service has 4 RPCs
      const service = topLevelDefs.find(d => d.serviceDef())!.serviceDef()!;
      const rpcs = service.serviceElement().filter(e => e.rpc());
      expect(rpcs).toHaveLength(4);
    });
  });
});
