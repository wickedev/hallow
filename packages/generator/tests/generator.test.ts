import { Generator, GeneratorOptions, ProtoFile, GenerationError } from '../src/core';

describe('Generator', () => {
  let generator: Generator;
  
  beforeEach(() => {
    generator = new Generator();
  });
  
  describe('constructor', () => {
    it('should create instance with default options', () => {
      const options = generator.getOptions();
      expect(options.outputFormat).toBe('typescript');
      expect(options.generateReactHooks).toBe(false);
      expect(options.generateSuspenseHooks).toBe(false);
      expect(options.sourceMaps).toBe(false);
      expect(options.generateComments).toBe(true);
      expect(options.treeShaking).toBe(false);
    });
    
    it('should create instance with custom options', () => {
      const customOptions: GeneratorOptions = {
        outputFormat: 'javascript',
        generateReactHooks: true,
        serverUrl: 'http://localhost:8080',
      };
      
      generator = new Generator(customOptions);
      const options = generator.getOptions();
      
      expect(options.outputFormat).toBe('javascript');
      expect(options.generateReactHooks).toBe(true);
      expect(options.serverUrl).toBe('http://localhost:8080');
    });
  });
  
  describe('updateOptions', () => {
    it('should update options', () => {
      generator.updateOptions({ generateReactHooks: true });
      expect(generator.getOptions().generateReactHooks).toBe(true);
    });
  });
  
  describe('generateCode', () => {
    it('should throw error for null proto file', async () => {
      await expect(generator.generateCode(null as any)).rejects.toThrow(GenerationError);
    });
    
    it('should generate empty result for valid proto file', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };
      
      const result = await generator.generateCode(protoFile);
      
      expect(result.files).toEqual([]);
      expect(result.metadata.generatorVersion).toBe('0.1.0');
      expect(result.metadata.servicesCount).toBe(0);
      expect(result.metadata.messagesCount).toBe(0);
      expect(result.metadata.enumsCount).toBe(0);
    });
  });
});