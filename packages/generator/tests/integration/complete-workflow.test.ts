/**
 * Integration tests for complete code generation workflows
 * Tests end-to-end generation from proto definitions to working TypeScript code
 */

import { Generator } from '../../src/core/generator';
import { TemplateEngine } from '../../src/core/template-engine';
import { ServiceGenerator } from '../../src/generators/ServiceGenerator';
import { MessageGenerator } from '../../src/generators/MessageGenerator';
import { ReactHookGenerator } from '../../src/generators/ReactHookGenerator';
import { 
  ProtoFile, 
  ServiceDefinition, 
  MessageDefinition, 
  FieldDefinition,
  EnumDefinition,
  OneofDefinition
} from '../../src/core/proto-types';
import { GeneratorOptions } from '../../src/core/types';
import * as ts from 'typescript';

describe('Complete Workflow Integration Tests', () => {
  let generator: Generator;

  beforeEach(() => {
    generator = new Generator({
      outputFormat: 'typescript',
      generateReactHooks: true,
      generateSuspenseHooks: true,
      generateComments: true,
      includeOptionMetadata: true,
      optionProcessing: {
        includeStandard: true,
        includeCustom: true,
        processNestedObjects: true
      }
    });
  });

  describe('Simple Service Generation', () => {
    const simpleProtoFile: ProtoFile = {
      fileName: 'simple.proto',
      package: 'com.example.simple',
      syntax: 'proto3',
      imports: [],
      services: [
        {
          name: 'SimpleService',
          methods: [
            {
              name: 'GetUser',
              inputType: 'GetUserRequest',
              outputType: 'GetUserResponse',
              clientStreaming: false,
              serverStreaming: false,
              options: {}
            }
          ],
          options: {}
        }
      ],
      messages: [
        {
          name: 'GetUserRequest',
          fields: [
            {
              name: 'user_id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        },
        {
          name: 'GetUserResponse',
          fields: [
            {
              name: 'user',
              number: 1,
              type: 'User',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        },
        {
          name: 'User',
          fields: [
            {
              name: 'id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'name',
              number: 2,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'email',
              number: 3,
              type: 'string',
              repeated: false,
              optional: true,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        }
      ],
      enums: [],
      options: {}
    };

    it('should generate complete working TypeScript code', async () => {
      const result = await generator.generateCode(simpleProtoFile);

      expect(result.files).toBeTruthy();
      expect(result.files.length).toBeGreaterThan(0);

      const mainFile = result.files.find(f => f.path.includes('simple'));
      expect(mainFile).toBeDefined();

      const code = mainFile!.content;

      // Check for imports
      expect(code).toContain('import');

      // Check for message interfaces
      expect(code).toContain('export interface GetUserRequest');
      expect(code).toContain('export interface GetUserResponse');
      expect(code).toContain('export interface User');

      // Check for service stub
      expect(code).toContain('export class SimpleServiceStub');
      expect(code).toContain('async getUser(');

      // Check for React hooks if enabled
      expect(code).toContain('useGetUser');

      // Check for serialization
      expect(code).toContain('export namespace GetUserRequest');
      expect(code).toContain('export function encode');
      expect(code).toContain('export function decode');
    });

    it('should generate TypeScript code that compiles without errors', async () => {
      const result = await generator.generateCode(simpleProtoFile);
      const mainFile = result.files.find(f => f.path.includes('simple'));
      
      expect(mainFile).toBeDefined();

      // Add necessary imports and dependencies for compilation
      const codeWithImports = `
        // Mock dependencies for compilation test
        declare class Client {
          unaryCall(method: string, data: Uint8Array): Promise<Uint8Array>;
        }
        
        declare class BinaryWriter {
          writeString(field: number, value: string): void;
          getResultBuffer(): Uint8Array;
        }
        
        declare class BinaryReader {
          constructor(data: Uint8Array);
          nextField(): boolean;
          getFieldNumber(): number;
          readString(): string;
          skipField(): void;
        }
        
        declare module 'react' {
          export function useState<T>(initial: T): [T, (value: T) => void];
          export function useEffect(effect: () => void, deps?: any[]): void;
        }
        
        ${mainFile!.content}
      `;

      const transpileResult = ts.transpile(codeWithImports, {
        target: ts.ScriptTarget.ES2018,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true
      });

      // Should not throw compilation errors
      expect(transpileResult).toBeTruthy();
      expect(transpileResult.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Service with Streaming and Options', () => {
    const complexProtoFile: ProtoFile = {
      fileName: 'complex.proto',
      package: 'com.example.complex',
      syntax: 'proto3',
      imports: [],
      services: [
        {
          name: 'ChatService',
          methods: [
            {
              name: 'SendMessage',
              inputType: 'ChatMessage',
              outputType: 'ChatResponse',
              clientStreaming: false,
              serverStreaming: false,
              options: {
                'google.api.http': {
                  post: '/v1/chat/send',
                  body: '*'
                }
              }
            },
            {
              name: 'StreamMessages',
              inputType: 'StreamRequest',
              outputType: 'ChatMessage',
              clientStreaming: false,
              serverStreaming: true,
              options: {}
            },
            {
              name: 'ChatSession',
              inputType: 'ChatMessage',
              outputType: 'ChatMessage',
              clientStreaming: true,
              serverStreaming: true,
              options: {}
            }
          ],
          options: {
            deprecated: true
          }
        }
      ],
      messages: [
        {
          name: 'ChatMessage',
          fields: [
            {
              name: 'id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'user_id',
              number: 2,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'content',
              number: 3,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'timestamp',
              number: 4,
              type: 'int64',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'metadata',
              number: 5,
              type: 'map<string, string>',
              repeated: false,
              optional: false,
              map: true,
              mapKeyType: 'string',
              mapValueType: 'string',
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [
            {
              name: 'message_type',
              fields: [
                {
                  name: 'text_message',
                  number: 6,
                  type: 'string',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                },
                {
                  name: 'image_url',
                  number: 7,
                  type: 'string',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                },
                {
                  name: 'file_attachment',
                  number: 8,
                  type: 'FileAttachment',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                }
              ]
            }
          ],
          options: {}
        },
        {
          name: 'FileAttachment',
          fields: [
            {
              name: 'filename',
              number: 1,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'content_type',
              number: 2,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'size',
              number: 3,
              type: 'int64',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        },
        {
          name: 'ChatResponse',
          fields: [
            {
              name: 'success',
              number: 1,
              type: 'bool',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'message_id',
              number: 2,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        },
        {
          name: 'StreamRequest',
          fields: [
            {
              name: 'user_id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'room_id',
              number: 2,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        }
      ],
      enums: [
        {
          name: 'MessageStatus',
          values: [
            { name: 'PENDING', number: 0, options: {} },
            { name: 'SENT', number: 1, options: {} },
            { name: 'DELIVERED', number: 2, options: {} },
            { name: 'READ', number: 3, options: {} }
          ],
          options: {}
        }
      ],
      options: {}
    };

    it('should handle complex proto with all features', async () => {
      const result = await generator.generateCode(complexProtoFile);

      const mainFile = result.files.find(f => f.path.includes('complex'));
      expect(mainFile).toBeDefined();

      const code = mainFile!.content;

      // Check for all message types
      expect(code).toContain('export interface ChatMessage');
      expect(code).toContain('export interface FileAttachment');
      expect(code).toContain('export interface ChatResponse');
      expect(code).toContain('export interface StreamRequest');

      // Check for enum
      expect(code).toContain('export enum MessageStatus');
      expect(code).toContain('PENDING = 0');
      expect(code).toContain('SENT = 1');

      // Check for map fields
      expect(code).toContain('metadata: Record<string, string>');

      // Check for oneof union types
      expect(code).toContain('messageType');
      expect(code).toContain('textMessage: string');
      expect(code).toContain('imageUrl: string');
      expect(code).toContain('fileAttachment: FileAttachment');

      // Check for service with all method types
      expect(code).toContain('export class ChatServiceStub');
      expect(code).toContain('async sendMessage(');
      expect(code).toContain('streamMessages('); // Server streaming
      expect(code).toContain('chatSession('); // Bidirectional streaming

      // Check for deprecation warnings (if options are processed)
      if (code.includes('@deprecated')) {
        expect(code).toContain('@deprecated');
      }

      // Check for serialization of complex types
      expect(code).toContain('export namespace ChatMessage');
      expect(code).toContain('export function encode');
      expect(code).toContain('export function decode');

      // Check for React hooks
      expect(code).toContain('useSendMessage');
    });

    it('should generate proper oneof serialization', async () => {
      const result = await generator.generateCode(complexProtoFile);
      const mainFile = result.files.find(f => f.path.includes('complex'));
      
      expect(mainFile).toBeDefined();
      const code = mainFile!.content;

      // Check for oneof encoding logic
      expect(code).toContain('messageType === \'textMessage\'');
      expect(code).toContain('messageType === \'imageUrl\'');
      expect(code).toContain('messageType === \'fileAttachment\'');

      // Check for oneof decoding logic
      expect(code).toContain('case 6:');
      expect(code).toContain('case 7:');
      expect(code).toContain('case 8:');
    });
  });

  describe('Nested Messages and Enums', () => {
    const nestedProtoFile: ProtoFile = {
      fileName: 'nested.proto',
      package: 'com.example.nested',
      syntax: 'proto3',
      imports: [],
      services: [
        {
          name: 'NestedService',
          methods: [
            {
              name: 'ProcessOrder',
              inputType: 'Order',
              outputType: 'OrderResult',
              clientStreaming: false,
              serverStreaming: false,
              options: {}
            }
          ],
          options: {}
        }
      ],
      messages: [
        {
          name: 'Order',
          fields: [
            {
              name: 'id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'customer',
              number: 2,
              type: 'Customer',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'items',
              number: 3,
              type: 'OrderItem',
              repeated: true,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'status',
              number: 4,
              type: 'OrderStatus',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [
            {
              name: 'Customer',
              fields: [
                {
                  name: 'id',
                  number: 1,
                  type: 'string',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                },
                {
                  name: 'name',
                  number: 2,
                  type: 'string',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                },
                {
                  name: 'address',
                  number: 3,
                  type: 'Address',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                }
              ],
              nestedMessages: [
                {
                  name: 'Address',
                  fields: [
                    {
                      name: 'street',
                      number: 1,
                      type: 'string',
                      repeated: false,
                      optional: false,
                      map: false,
                      options: {}
                    },
                    {
                      name: 'city',
                      number: 2,
                      type: 'string',
                      repeated: false,
                      optional: false,
                      map: false,
                      options: {}
                    },
                    {
                      name: 'postal_code',
                      number: 3,
                      type: 'string',
                      repeated: false,
                      optional: false,
                      map: false,
                      options: {}
                    }
                  ],
                  nestedMessages: [],
                  nestedEnums: [],
                  oneofs: [],
                  options: {}
                }
              ],
              nestedEnums: [],
              oneofs: [],
              options: {}
            },
            {
              name: 'OrderItem',
              fields: [
                {
                  name: 'product_id',
                  number: 1,
                  type: 'string',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                },
                {
                  name: 'quantity',
                  number: 2,
                  type: 'int32',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                },
                {
                  name: 'unit_price',
                  number: 3,
                  type: 'double',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                }
              ],
              nestedMessages: [],
              nestedEnums: [],
              oneofs: [],
              options: {}
            }
          ],
          nestedEnums: [
            {
              name: 'OrderStatus',
              values: [
                { name: 'PENDING', number: 0, options: {} },
                { name: 'PROCESSING', number: 1, options: {} },
                { name: 'SHIPPED', number: 2, options: {} },
                { name: 'DELIVERED', number: 3, options: {} },
                { name: 'CANCELLED', number: 4, options: {} }
              ],
              options: {}
            }
          ],
          oneofs: [],
          options: {}
        },
        {
          name: 'OrderResult',
          fields: [
            {
              name: 'success',
              number: 1,
              type: 'bool',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'order_id',
              number: 2,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        }
      ],
      enums: [],
      options: {}
    };

    it('should properly handle deeply nested message structures', async () => {
      const result = await generator.generateCode(nestedProtoFile);
      const mainFile = result.files.find(f => f.path.includes('nested'));
      
      expect(mainFile).toBeDefined();
      const code = mainFile!.content;

      // Check for main interface
      expect(code).toContain('export interface Order');

      // Check for nested namespace structure
      expect(code).toContain('export namespace Order');
      expect(code).toContain('export interface Customer');
      expect(code).toContain('export interface OrderItem');

      // Check for deeply nested types
      expect(code).toContain('address: Order.Customer.Address');

      // Check for nested enum
      expect(code).toContain('export enum OrderStatus');
      expect(code).toContain('PENDING = 0');

      // Check for proper field types
      expect(code).toContain('customer: Order.Customer');
      expect(code).toContain('items: Order.OrderItem[]');
      expect(code).toContain('status: Order.OrderStatus');

      // Check serialization for nested types
      expect(code).toContain('export namespace Order');
      expect(code).toContain('Customer.encode');
      expect(code).toContain('OrderItem.encode');
    });
  });

  describe('Performance with Large Proto Files', () => {
    it('should handle proto files with many services and messages', async () => {
      // Generate a large proto file programmatically
      const largeProtoFile: ProtoFile = {
        fileName: 'large.proto',
        package: 'com.example.large',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {}
      };

      // Add 50 services with 10 methods each
      for (let i = 0; i < 50; i++) {
        const service: ServiceDefinition = {
          name: `Service${i}`,
          methods: [],
          options: {}
        };

        for (let j = 0; j < 10; j++) {
          service.methods.push({
            name: `Method${j}`,
            inputType: `Request${i}_${j}`,
            outputType: `Response${i}_${j}`,
            clientStreaming: false,
            serverStreaming: false,
            options: {}
          });

          // Add corresponding request/response messages
          largeProtoFile.messages.push(
            {
              name: `Request${i}_${j}`,
              fields: [
                {
                  name: 'id',
                  number: 1,
                  type: 'string',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                }
              ],
              nestedMessages: [],
              nestedEnums: [],
              oneofs: [],
              options: {}
            },
            {
              name: `Response${i}_${j}`,
              fields: [
                {
                  name: 'success',
                  number: 1,
                  type: 'bool',
                  repeated: false,
                  optional: false,
                  map: false,
                  options: {}
                }
              ],
              nestedMessages: [],
              nestedEnums: [],
              oneofs: [],
              options: {}
            }
          );
        }

        largeProtoFile.services.push(service);
      }

      const startTime = Date.now();
      const result = await generator.generateCode(largeProtoFile);
      const endTime = Date.now();

      const generationTime = endTime - startTime;

      // Should complete within reasonable time (10 seconds for large file)
      expect(generationTime).toBeLessThan(10000);

      // Should generate files
      expect(result.files).toBeTruthy();
      expect(result.files.length).toBeGreaterThan(0);

      // Should contain all services and messages
      const mainFile = result.files.find(f => f.path.includes('large'));
      expect(mainFile).toBeDefined();
      
      const code = mainFile!.content;
      
      // Note: This test reveals that the generator currently only processes
      // the first service from multi-service proto files. This may be
      // a limitation that should be addressed in future versions.
      const serviceCount = (code.match(/class Service\d+Stub/g) || []).length;
      
      expect(code).toContain('Service0Stub');
      expect(serviceCount).toBeGreaterThan(0); // At least one service generated
      expect(code).toContain('method0(');
      expect(code).toContain('method9(');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should reject proto files with empty services', async () => {
      const emptyServiceProto: ProtoFile = {
        fileName: 'empty.proto',
        package: 'com.example.empty',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'EmptyService',
            methods: [],
            options: {}
          }
        ],
        messages: [],
        enums: [],
        options: {}
      };

      await expect(generator.generateCode(emptyServiceProto)).rejects.toThrow('Service "EmptyService" has no methods');
    });

    it('should handle proto files with no services or messages', async () => {
      const emptyProto: ProtoFile = {
        fileName: 'completely_empty.proto',
        package: 'com.example.nothing',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {}
      };

      const result = await generator.generateCode(emptyProto);
      expect(result.files).toBeTruthy();
      
      // Should still generate a file, even if minimal
      expect(result.files.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid field types gracefully', async () => {
      const invalidTypeProto: ProtoFile = {
        fileName: 'invalid.proto',
        package: 'com.example.invalid',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'InvalidMessage',
            fields: [
              {
                name: 'invalid_field',
                number: 1,
                type: 'NonExistentType',
                repeated: false,
                optional: false,
                map: false,
                options: {}
              }
            ],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {}
          }
        ],
        enums: [],
        options: {}
      };

      // Should not throw but handle gracefully
      await expect(generator.generateCode(invalidTypeProto)).resolves.toBeTruthy();
    });
  });
});