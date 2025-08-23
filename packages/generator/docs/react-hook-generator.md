# ReactHookGenerator Documentation

## Overview

The `ReactHookGenerator` class generates type-safe React hooks for gRPC services. It supports both regular hooks (with loading/error states) and Suspense-compatible hooks for React Suspense.

## Features

- **Regular React Hooks**: Generate hooks with `data`, `loading`, `error` states and optional `refetch` functionality
- **Suspense Hooks**: Generate Suspense-compatible hooks that throw promises while loading
- **Type Safety**: Full TypeScript typing for request/response types
- **Configurable**: Extensive options for customizing generated code
- **JSDoc Comments**: Optional documentation generation
- **Request Memoization**: Optional request memoization using JSON.stringify
- **Batch Generation**: Can generate hooks for all services in a proto file

## Usage

### Basic Example

```typescript
import { ReactHookGenerator } from '@hallow/generator';

const generator = new ReactHookGenerator({
  generateRegularHooks: true,
  generateSuspenseHooks: true,
  includeRefetch: true,
  generateComments: true,
});

// Generate hooks for a single service
const file = generator.generateHooks(service, protoFile);

// Generate hooks for all services in a proto file
const files = await generator.generateAllHooks(protoFile);
```

### Generated Hook Example

For a service method like:
```proto
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
}
```

The generator creates:

#### Regular Hook
```typescript
export class UserServiceHooks {
  constructor(private readonly stub: UserServiceStub) {}

  public useGetUser(request: GetUserRequest): {
    data?: User;
    loading: boolean;
    error?: Error;
    refetch: () => void;
  } {
    const [data, setData] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(undefined);
        const result = await this.stub.getUser(request);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(request)]);

    useEffect(() => {
      fetchData();
    }, [request]);

    return { data, loading, error, refetch: fetchData };
  }
}
```

#### Suspense Hook
```typescript
export class UserServiceSuspenseHooks {
  constructor(private readonly stub: UserServiceStub) {}

  public useSuspenseGetUser(request: GetUserRequest): User {
    const [data, setData] = useState<User | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [promise, setPromise] = useState<Promise<User> | undefined>(undefined);

    if (error) {
      throw error;
    }

    if (!data && !promise) {
      const newPromise = this.stub.getUser(request)
        .then(result => {
          setData(result);
          return result;
        })
        .catch(err => {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          throw error;
        });
      
      setPromise(newPromise);
      throw newPromise;
    }

    if (!data && promise) {
      throw promise;
    }

    return data!;
  }
}
```

## Configuration Options

### ReactHookGeneratorOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `generateRegularHooks` | `boolean` | `true` | Generate regular React hooks with loading/error states |
| `generateSuspenseHooks` | `boolean` | `true` | Generate Suspense-compatible hooks |
| `generateComments` | `boolean` | `true` | Include JSDoc comments in generated code |
| `includeRefetch` | `boolean` | `true` | Include refetch functionality in regular hooks |
| `memoizeRequests` | `boolean` | `false` | Memoize requests using JSON.stringify |
| `templateDir` | `string` | `''` | Custom template directory path |
| `typeMapping` | `TypeMappingConfig` | `{}` | Type mapping configuration |
| `serviceImportPath` | `string` | `'./service'` | Import path for service stubs |

## Architecture

### Class Structure

```typescript
export class ReactHookGenerator {
  constructor(options?: ReactHookGeneratorOptions)
  
  // Generate hooks for a single service
  generateHooks(service: ServiceDefinition, protoFile: ProtoFile): GeneratedFile
  
  // Generate hooks for all services in a proto file
  generateAllHooks(protoFile: ProtoFile): Promise<GeneratedFile[]>
  
  // Update generator options
  updateOptions(options: Partial<ReactHookGeneratorOptions>): void
  
  // Get current options
  getOptions(): Readonly<Required<ReactHookGeneratorOptions>>
}
```

### Integration with Other Components

- **TemplateEngine**: Uses Handlebars templates for code generation
- **TypeMapper**: Maps protobuf types to TypeScript types
- **ImportManager**: Manages and deduplicates import statements
- **NameResolver**: Resolves names following TypeScript conventions

## Testing

The generator includes comprehensive unit and integration tests:

- **Unit Tests**: Test individual methods and error handling
- **Integration Tests**: Test complete generation workflows
- **Validation Tests**: Ensure proper error handling for invalid inputs

Run tests with:
```bash
npm test -- tests/generators/ReactHookGenerator.test.ts
npm test -- tests/integration/ReactHookGenerator.integration.test.ts
```

## Error Handling

The generator validates input and provides clear error messages:

- Service must have a name
- Service must have at least one method
- Each method must have name, input type, and output type
- At least one hook type must be enabled
- Warns about streaming methods (not fully supported yet)

## Limitations

- Streaming methods (client/server) are not fully supported yet
- Generated hooks assume the service stub is already implemented
- Request memoization uses JSON.stringify which may not work for all types

## Future Enhancements

- Full streaming support with observables
- Custom error handling strategies
- Request caching and deduplication
- Optimistic updates support
- Integration with React Query or SWR