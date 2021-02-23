import { ServiceBlockContext } from "@hallow/parser";
import {
  ClassDeclarationStructure,
  Scope,
  VariableDeclarationKind,
} from "ts-morph";

export function transformToStub(
  ctx: ServiceBlockContext
): ClassDeclarationStructure {
  return {
    decorators: [],
    typeParameters: [],
    docs: [],
    isAbstract: false,
    implements: [],
    name: "GreetingStub",
    isExported: true,
    isDefaultExport: false,
    hasDeclareKeyword: false,
    kind: 1,
    ctors: [
      {
        statements: [
          "this.sayHelloResource = new Resource(this.greeting.bind(this));",
        ],
        parameters: [
          {
            name: "client",
            type: "IClient",
            isReadonly: true,
            scope: Scope.Private,
            decorators: [],
            hasQuestionToken: false,
            kind: 28,
            isRestParameter: false,
          },
        ],
        typeParameters: [],
        docs: [],
        kind: 3,
        overloads: [],
      },
    ],
    methods: [
      {
        name: "greeting",
        statements: [
          'return new Promise<IGreetingResponse>((resolve, reject) => {\n  grpc.unary(GreetingService.Greeting, {\n    host: this.client.host,\n    debug: false,\n    onEnd(output: grpc.UnaryOutput<GreetingResponse>): void {\n      if (output.status === grpc.Code.OK) {\n        const result = output.message?.toObject();\n\n        result\n          ? resolve(result)\n          : reject({\n              message: "deserialize failed",\n              code: output.status,\n              metadata: output.trailers,\n            });\n      } else {\n        const proto = (output as any)?.trailers?.headersMap?.[\n          "armeria.grpc.throwableproto-bin"\n        ];\n\n        let throwable: Optional<ThrowableProto> = proto?.[0]\n          ? ThrowableProto.deserializeBinary(proto[0])\n          : undefined;\n\n        reject({\n          message: getMessage(output),\n          code: output.status,\n          status: statusMap[output.status],\n          metadata: {\n            throwable: throwable?.toObject(),\n            trailers: output.trailers,\n          },\n        });\n      }\n    },\n    request: GreetingRequest.create(greetingRequest),\n  });\n});',
        ],
        parameters: [
          {
            name: "greetingRequest",
            type: "IGreetingRequest",
            isReadonly: false,
            decorators: [],
            hasQuestionToken: false,
            kind: 28,
            isRestParameter: false,
          },
        ],
        returnType: "Promise<IGreetingResponse>",
        typeParameters: [],
        docs: [],
        isGenerator: false,
        isAsync: false,
        isStatic: false,
        hasQuestionToken: false,
        isAbstract: false,
        decorators: [],
        kind: 24,
        overloads: [],
      },
      {
        name: "useGreeting",
        statements: [
          "this.sayHelloResource.forceUpdate = useForceUpdate();",
          {
            isExported: false,
            isDefaultExport: false,
            hasDeclareKeyword: false,
            docs: [],
            kind: 39,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
              {
                name: "capturedArgs",
                initializer: "arguments",
                hasExclamationToken: false,
                kind: 38,
              },
            ],
          },
          "this.sayHelloResource.arguments = capturedArgs;",
          "useEffect(() => {\n  if (this.sayHelloResource.mustBeIgnored) {\n    this.sayHelloResource.mustBeIgnored = false;\n  } else {\n    this.sayHelloResource.mustBeIgnored = true;\n    this.sayHelloResource.arguments = capturedArgs;\n    this.sayHelloResource.refresh();\n  }\n}, [capturedArgs]);",
          "return this.sayHelloResource;",
        ],
        parameters: [
          {
            name: "request",
            type: "IGreetingRequest",
            isReadonly: false,
            decorators: [],
            hasQuestionToken: false,
            kind: 28,
            isRestParameter: false,
          },
        ],
        returnType: "Resource<IGreetingResponse>",
        typeParameters: [],
        docs: [],
        isGenerator: false,
        isAsync: false,
        isStatic: false,
        hasQuestionToken: false,
        isAbstract: false,
        decorators: [],
        kind: 24,
        overloads: [],
      },
    ],
    properties: [
      {
        name: "sayHelloResource",
        type: "Resource<IGreetingResponse>",
        hasQuestionToken: false,
        hasExclamationToken: false,
        isReadonly: true,
        docs: [],
        isStatic: false,
        scope: Scope.Private,
        isAbstract: false,
        decorators: [],
        hasDeclareKeyword: false,
        kind: 29,
      },
    ],
    getAccessors: [],
    setAccessors: [],
  };
}
