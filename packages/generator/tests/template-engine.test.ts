import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TemplateEngine, TemplateEngineFactory, GenerationError, GenerationErrorCode } from '../src/core';

describe('TemplateEngine', () => {
  let tempDir: string;
  let templateEngine: TemplateEngine;

  beforeEach(() => {
    // Create temporary directory for test templates
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hallow-template-test-'));
    templateEngine = new TemplateEngine();
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    templateEngine.clearCache();
  });

  describe('Constructor and Options', () => {
    it('should create template engine with default options', () => {
      const engine = new TemplateEngine();
      expect(engine).toBeDefined();
      expect(engine.getLoadedTemplates()).toHaveLength(0);
    });

    it('should create template engine with custom options', () => {
      const customHelper = () => 'custom';
      const engine = new TemplateEngine({
        strict: false,
        cache: false,
        helpers: { customHelper },
        partials: { testPartial: 'test content' },
      });
      expect(engine).toBeDefined();
    });
  });

  describe('Template Loading', () => {
    it('should load template from string content', () => {
      const templateContent = 'Hello {{name}}!';
      
      templateEngine.loadTemplateFromString('greeting', templateContent);
      
      const result = templateEngine.render('greeting', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should load template from file', async () => {
      const templateContent = 'Service: {{serviceName}}';
      const templatePath = path.join(tempDir, 'service.hbs');
      
      fs.writeFileSync(templatePath, templateContent);
      
      await templateEngine.loadTemplate('service', templatePath);
      
      const result = templateEngine.render('service', { serviceName: 'TestService' });
      expect(result).toBe('Service: TestService');
    });

    it('should load templates from directory', async () => {
      const templates = {
        'service.hbs': 'Service: {{name}}',
        'message.hbs': 'Message: {{name}}',
        'other.txt': 'Should be ignored',
      };

      Object.entries(templates).forEach(([filename, content]) => {
        fs.writeFileSync(path.join(tempDir, filename), content);
      });

      await templateEngine.loadTemplatesFromDirectory(tempDir);

      expect(templateEngine.getLoadedTemplates()).toHaveLength(2);
      
      const serviceResult = templateEngine.render('service', { name: 'TestService' });
      expect(serviceResult).toBe('Service: TestService');
      
      const messageResult = templateEngine.render('message', { name: 'TestMessage' });
      expect(messageResult).toBe('Message: TestMessage');
    });

    it('should throw error for non-existent template file', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.hbs');
      
      await expect(templateEngine.loadTemplate('test', nonExistentPath))
        .rejects.toThrow(GenerationError);
    });

    it('should throw error for non-existent template directory', async () => {
      const nonExistentDir = path.join(tempDir, 'nonexistent');
      
      await expect(templateEngine.loadTemplatesFromDirectory(nonExistentDir))
        .rejects.toThrow(GenerationError);
    });

    it('should validate template syntax', () => {
      const invalidTemplate = 'Hello {{#if name}}{{name}}'; // Missing closing tag
      
      expect(() => {
        templateEngine.loadTemplateFromString('invalid', invalidTemplate);
      }).toThrow(GenerationError);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      templateEngine.loadTemplateFromString('simple', 'Hello {{name}}!');
      templateEngine.loadTemplateFromString('complex', `
{{#each items}}
  - {{name}}: {{description}}
{{/each}}
      `.trim());
    });

    it('should render simple template', () => {
      const result = templateEngine.render('simple', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should render complex template with arrays', () => {
      const context = {
        items: [
          { name: 'Item1', description: 'First item' },
          { name: 'Item2', description: 'Second item' },
        ],
      };
      
      const result = templateEngine.render('complex', context);
      expect(result).toContain('- Item1: First item');
      expect(result).toContain('- Item2: Second item');
    });

    it('should throw error for unknown template', () => {
      expect(() => {
        templateEngine.render('unknown', {});
      }).toThrow(GenerationError);
    });

    it('should handle missing context variables gracefully', () => {
      // Create a non-strict engine for this test
      const nonStrictEngine = new TemplateEngine({ strict: false });
      nonStrictEngine.loadTemplateFromString('simple', 'Hello {{name}}!');
      
      const result = nonStrictEngine.render('simple', {});
      expect(result).toBe('Hello !');
    });
  });

  describe('Built-in Helpers', () => {
    beforeEach(() => {
      templateEngine.loadTemplateFromString('helpers', `
camelCase: {{camelCase name}}
pascalCase: {{pascalCase name}}
snakeCase: {{snakeCase name}}
kebabCase: {{kebabCase name}}
join: {{join items ", "}}
mapType: {{mapType protoType}}
      `.trim());
    });

    it('should provide case conversion helpers', () => {
      const context = { name: 'TestName' };
      const result = templateEngine.render('helpers', context);
      
      expect(result).toContain('camelCase: testName');
      expect(result).toContain('pascalCase: TestName');
      expect(result).toContain('snakeCase: test_name');
      expect(result).toContain('kebabCase: test-name');
    });

    it('should provide join helper', () => {
      const context = { items: ['a', 'b', 'c'] };
      const result = templateEngine.render('helpers', context);
      
      expect(result).toContain('join: a, b, c');
    });

    it('should provide type mapping helper', () => {
      const context = { protoType: 'int32' };
      const result = templateEngine.render('helpers', context);
      
      expect(result).toContain('mapType: number');
    });
  });

  describe('Custom Helpers and Partials', () => {
    it('should register and use custom helpers', () => {
      templateEngine.registerHelper('uppercase', (str: string) => str.toUpperCase());
      templateEngine.loadTemplateFromString('custom', 'Hello {{uppercase name}}!');
      
      const result = templateEngine.render('custom', { name: 'world' });
      expect(result).toBe('Hello WORLD!');
    });

    it('should register and use custom partials', () => {
      templateEngine.registerPartial('greeting', 'Hello {{name}}');
      templateEngine.loadTemplateFromString('withPartial', '{{> greeting}}!');
      
      const result = templateEngine.render('withPartial', { name: 'World' });
      expect(result).toBe('Hello World!');
    });
  });

  describe('Template Caching and Reloading', () => {
    it('should cache templates by default', async () => {
      const templatePath = path.join(tempDir, 'cached.hbs');
      fs.writeFileSync(templatePath, 'Version 1: {{name}}');
      
      await templateEngine.loadTemplate('cached', templatePath);
      
      // Wait to ensure file modification time differs
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Modify file
      fs.writeFileSync(templatePath, 'Version 2: {{name}}');
      
      // Should still use cached version without explicit reload
      const result1 = templateEngine.render('cached', { name: 'Test' });
      expect(result1).toBe('Version 1: Test');
      
      // Force reload
      await templateEngine.reloadIfNecessary('cached');
      const result2 = templateEngine.render('cached', { name: 'Test' });
      expect(result2).toBe('Version 2: Test');
    });

    it('should detect when template needs reloading', async () => {
      const templatePath = path.join(tempDir, 'reload-test.hbs');
      fs.writeFileSync(templatePath, 'Original content');
      
      await templateEngine.loadTemplate('reload-test', templatePath);
      
      // Initially should not need reload
      expect(await templateEngine.needsReload('reload-test')).toBe(false);
      
      // Wait a bit and modify file
      await new Promise(resolve => setTimeout(resolve, 10));
      fs.writeFileSync(templatePath, 'Modified content');
      
      // Should now need reload
      expect(await templateEngine.needsReload('reload-test')).toBe(true);
    });

    it('should clear cache', () => {
      templateEngine.loadTemplateFromString('test', 'content');
      expect(templateEngine.getLoadedTemplates()).toHaveLength(1);
      
      templateEngine.clearCache();
      expect(templateEngine.getLoadedTemplates()).toHaveLength(0);
    });
  });

  describe('Template Metadata', () => {
    it('should provide template metadata', async () => {
      const templatePath = path.join(tempDir, 'metadata-test.hbs');
      fs.writeFileSync(templatePath, 'Test content');
      
      await templateEngine.loadTemplate('metadata-test', templatePath);
      
      const metadata = templateEngine.getLoadedTemplates();
      expect(metadata).toHaveLength(1);
      expect(metadata[0].name).toBe('metadata-test');
      expect(metadata[0].path).toBe(templatePath);
      expect(metadata[0].compiled).toBe(true);
      expect(typeof metadata[0].lastModified).toBe('object');
      expect(metadata[0].lastModified).not.toBeNull();
    });

    it('should handle string templates metadata', () => {
      templateEngine.loadTemplateFromString('string-template', 'content');
      
      const metadata = templateEngine.getLoadedTemplates();
      expect(metadata).toHaveLength(1);
      expect(metadata[0].name).toBe('string-template');
      expect(metadata[0].path).toBe('<string>');
    });
  });

  describe('Error Handling', () => {
    it('should throw GenerationError with appropriate codes', () => {
      // Template not found
      expect(() => templateEngine.render('nonexistent', {}))
        .toThrow(expect.objectContaining({
          name: 'GenerationError',
          code: GenerationErrorCode.TEMPLATE_NOT_FOUND,
        }));

      // Template parse error
      expect(() => templateEngine.loadTemplateFromString('invalid', '{{#invalid}}'))
        .toThrow(expect.objectContaining({
          name: 'GenerationError',
          code: GenerationErrorCode.TEMPLATE_PARSE_ERROR,
        }));
    });

    it('should provide helpful error messages', () => {
      try {
        templateEngine.render('nonexistent', {});
      } catch (error) {
        expect(error).toBeInstanceOf(GenerationError);
        expect((error as GenerationError).message).toContain('Available templates:');
      }
    });
  });

  describe('Performance and Security', () => {
    it('should handle large templates efficiently', () => {
      const largeTemplate = '{{#each items}}Item {{@index}}: {{name}}\n{{/each}}';
      const largeContext = {
        items: Array.from({ length: 1000 }, (_, i) => ({ name: `Item${i}` })),
      };
      
      templateEngine.loadTemplateFromString('large', largeTemplate);
      
      const startTime = Date.now();
      const result = templateEngine.render('large', largeContext);
      const endTime = Date.now();
      
      expect(result).toContain('Item 0: Item0');
      expect(result).toContain('Item 999: Item999');
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should not escape HTML by default (for code generation)', () => {
      templateEngine.loadTemplateFromString('code', 'Code: {{code}}');
      
      const result = templateEngine.render('code', { code: '<string>' });
      expect(result).toBe('Code: <string>');
    });
  });
});

describe('TemplateEngineFactory', () => {
  it('should create template engine for services', () => {
    const engine = TemplateEngineFactory.createForServices();
    expect(engine).toBeInstanceOf(TemplateEngine);
  });

  it('should create template engine for messages', () => {
    const engine = TemplateEngineFactory.createForMessages();
    expect(engine).toBeInstanceOf(TemplateEngine);
  });

  it('should create template engine for React hooks', () => {
    const engine = TemplateEngineFactory.createForReactHooks();
    expect(engine).toBeInstanceOf(TemplateEngine);
  });

  it('should merge custom options with factory defaults', () => {
    const customHelper = () => 'test';
    const engine = TemplateEngineFactory.createForServices({
      helpers: { customHelper },
      cache: false,
    });
    
    expect(engine).toBeInstanceOf(TemplateEngine);
  });
});

describe('Template Integration Tests', () => {
  let templateEngine: TemplateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
  });

  afterEach(() => {
    templateEngine.clearCache();
  });

  it('should generate realistic service stub code', () => {
    const serviceTemplate = `
export class {{pascalCase serviceName}}Stub {
  constructor(private readonly baseUrl: string) {}

  {{#each methods}}
  async {{camelCase name}}(request: {{inputType}}): Promise<{{outputType}}> {
    // gRPC call implementation
    return {} as {{outputType}};
  }

  {{/each}}
}
    `.trim();

    templateEngine.loadTemplateFromString('service', serviceTemplate);

    const context = {
      serviceName: 'greeting',
      methods: [
        { name: 'SayHello', inputType: 'HelloRequest', outputType: 'HelloReply' },
        { name: 'ListMessages', inputType: 'ListRequest', outputType: 'ListReply' },
      ],
    };

    const result = templateEngine.render('service', context);

    expect(result).toContain('export class GreetingStub');
    expect(result).toContain('async sayHello(request: HelloRequest): Promise<HelloReply>');
    expect(result).toContain('async listMessages(request: ListRequest): Promise<ListReply>');
  });

  it('should generate realistic message interface code', () => {
    const messageTemplate = `
export interface {{pascalCase name}} {
  {{#each fields}}
  {{camelCase name}}{{#if optional}}?{{/if}}: {{mapType type}}{{#if repeated}}[]{{/if}};
  {{/each}}
}
    `.trim();

    templateEngine.loadTemplateFromString('message', messageTemplate);

    const context = {
      name: 'HelloRequest',
      fields: [
        { name: 'name', type: 'string', optional: false, repeated: false },
        { name: 'age', type: 'int32', optional: true, repeated: false },
        { name: 'tags', type: 'string', optional: false, repeated: true },
      ],
    };

    const result = templateEngine.render('message', context);

    expect(result).toContain('export interface HelloRequest');
    expect(result).toContain('name: string;');
    expect(result).toContain('age?: number;');
    expect(result).toContain('tags: string[];');
  });

  it('should handle complex nested template structures', () => {
    const complexTemplate = `
{{#each services}}
export namespace {{pascalCase name}} {
  {{#each messages}}
  export interface {{pascalCase name}} {
    {{#each fields}}
    {{camelCase name}}: {{mapType type}};
    {{/each}}
  }
  
  {{/each}}
  export class Stub {
    {{#each methods}}
    async {{camelCase name}}(): Promise<void> {}
    {{/each}}
  }
}

{{/each}}
    `.trim();

    templateEngine.loadTemplateFromString('complex', complexTemplate);

    const context = {
      services: [
        {
          name: 'UserService',
          messages: [
            {
              name: 'User',
              fields: [
                { name: 'id', type: 'string' },
                { name: 'active', type: 'bool' },
              ],
            },
          ],
          methods: [
            { name: 'GetUser' },
            { name: 'CreateUser' },
          ],
        },
      ],
    };

    const result = templateEngine.render('complex', context);

    expect(result).toContain('export namespace UserService');
    expect(result).toContain('export interface User');
    expect(result).toContain('id: string;');
    expect(result).toContain('active: boolean;');
    expect(result).toContain('async getUser(): Promise<void>');
    expect(result).toContain('async createUser(): Promise<void>');
  });
});