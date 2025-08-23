/**
 * Tests for OptionProcessor utility
 */

import { 
  OptionProcessor, 
  OptionHelpers, 
  ProcessedOption,
  OptionMetadata,
  TemplateOptionMetadata,
  DEFAULT_OPTION_CONFIG 
} from '../../src/utils/OptionProcessor';

describe('OptionProcessor', () => {
  let processor: OptionProcessor;

  beforeEach(() => {
    processor = new OptionProcessor();
  });

  describe('processOptions', () => {
    it('should process empty options', () => {
      const result = processor.processOptions({});
      
      expect(result.hasOptions).toBe(false);
      expect(result.standard).toEqual({});
      expect(result.custom).toEqual({});
      expect(result.all).toEqual({});
    });

    it('should process standard options', () => {
      const options = {
        deprecated: true,
        java_package: 'com.example',
        optimize_for: 'SPEED',
      };

      const result = processor.processOptions(options);
      
      expect(result.hasOptions).toBe(true);
      expect(Object.keys(result.standard)).toHaveLength(3);
      
      expect(result.standard.deprecated).toEqual({
        name: 'deprecated',
        value: true,
        isCustom: false,
        rawValue: true,
      });
      
      expect(result.standard.java_package).toEqual({
        name: 'java_package',
        value: 'com.example',
        isCustom: false,
        rawValue: 'com.example',
      });
      
      expect(result.standard.optimize_for).toEqual({
        name: 'optimize_for',
        value: 'SPEED',
        isCustom: false,
        rawValue: 'SPEED',
      });
    });

    it('should process custom options', () => {
      const options = {
        '(my_option)': 'custom_value',
        '(another_option)': 42,
      };

      const result = processor.processOptions(options);
      
      expect(result.hasOptions).toBe(true);
      expect(Object.keys(result.custom)).toHaveLength(2);
      
      expect(result.custom['(my_option)']).toEqual({
        name: '(my_option)',
        value: 'custom_value',
        isCustom: true,
        rawValue: 'custom_value',
      });
      
      expect(result.custom['(another_option)']).toEqual({
        name: '(another_option)',
        value: 42,
        isCustom: true,
        rawValue: 42,
      });
    });

    it('should process mixed standard and custom options', () => {
      const options = {
        deprecated: true,
        '(custom_option)': 'value',
        java_package: 'com.example',
      };

      const result = processor.processOptions(options);
      
      expect(result.hasOptions).toBe(true);
      expect(Object.keys(result.standard)).toHaveLength(2);
      expect(Object.keys(result.custom)).toHaveLength(1);
      expect(Object.keys(result.all)).toHaveLength(3);
    });

    it('should respect configuration filters', () => {
      const processorWithConfig = new OptionProcessor({
        includeStandard: false,
        excludeCustom: ['(excluded)'],
      });

      const options = {
        deprecated: true,
        '(custom_option)': 'value',
        '(excluded)': 'should_not_appear',
      };

      const result = processorWithConfig.processOptions(options);
      
      expect(Object.keys(result.standard)).toHaveLength(0);
      expect(Object.keys(result.custom)).toHaveLength(1);
      expect(result.custom['(custom_option)']).toBeDefined();
      expect(result.custom['(excluded)']).toBeUndefined();
    });
  });

  describe('value processing', () => {
    it('should process string values correctly', () => {
      const options = {
        string_option: '"quoted_string"',
        unquoted_string: 'unquoted',
      };

      const result = processor.processOptions(options);
      
      expect(result.all.string_option.value).toBe('quoted_string');
      expect(result.all.unquoted_string.value).toBe('unquoted');
    });

    it('should process boolean values correctly', () => {
      const options = {
        bool_true: 'true',
        bool_false: 'false',
        bool_native: true,
      };

      const result = processor.processOptions(options);
      
      expect(result.all.bool_true.value).toBe(true);
      expect(result.all.bool_false.value).toBe(false);
      expect(result.all.bool_native.value).toBe(true);
    });

    it('should process numeric values correctly', () => {
      const options = {
        int_string: '42',
        float_string: '3.14',
        int_native: 100,
        float_native: 2.718,
      };

      const result = processor.processOptions(options);
      
      expect(result.all.int_string.value).toBe(42);
      expect(result.all.float_string.value).toBe(3.14);
      expect(result.all.int_native.value).toBe(100);
      expect(result.all.float_native.value).toBe(2.718);
    });

    it('should process nested object values', () => {
      const options = {
        nested_object: {
          key1: 'value1',
          key2: 42,
          nested: {
            deep_key: true,
          },
        },
      };

      const result = processor.processOptions(options);
      
      expect(result.all.nested_object.value).toEqual({
        key1: 'value1',
        key2: 42,
        nested: {
          deep_key: true,
        },
      });
    });

    it('should process array values', () => {
      const options = {
        array_option: ['item1', 'item2', 42],
      };

      const result = processor.processOptions(options);
      
      expect(result.all.array_option.value).toEqual(['item1', 'item2', 42]);
    });
  });

  describe('helper methods', () => {
    it('should detect custom options', () => {
      expect(processor.hasOption({ '(custom)': 'value' }, '(custom)')).toBe(true);
      expect(processor.hasOption({ standard: 'value' }, 'standard')).toBe(true);
      expect(processor.hasOption({}, 'nonexistent')).toBe(false);
    });

    it('should get option values', () => {
      const options = {
        test_option: 'test_value',
        '(custom)': 42,
      };

      expect(processor.getOptionValue(options, 'test_option')).toBe('test_value');
      expect(processor.getOptionValue(options, '(custom)')).toBe(42);
      expect(processor.getOptionValue(options, 'nonexistent')).toBeUndefined();
    });

    it('should get custom option names', () => {
      const options = {
        standard: 'value',
        '(custom1)': 'value1',
        '(custom2)': 'value2',
        another_standard: 'value',
      };

      const customNames = processor.getCustomOptionNames(options);
      expect(customNames).toEqual(['(custom1)', '(custom2)']);
    });

    it('should get standard option names', () => {
      const options = {
        standard1: 'value',
        '(custom)': 'value1',
        standard2: 'value2',
      };

      const standardNames = processor.getStandardOptionNames(options);
      expect(standardNames).toEqual(['standard1', 'standard2']);
    });
  });

  describe('generateTemplateMetadata', () => {
    it('should generate template-friendly metadata', () => {
      const metadata: OptionMetadata = {
        standard: {
          deprecated: {
            name: 'deprecated',
            value: true,
            isCustom: false,
            rawValue: true,
          },
        },
        custom: {
          '(my_option)': {
            name: '(my_option)',
            value: 'value',
            isCustom: true,
            rawValue: 'value',
          },
        },
        all: {
          deprecated: {
            name: 'deprecated',
            value: true,
            isCustom: false,
            rawValue: true,
          },
          '(my_option)': {
            name: '(my_option)',
            value: 'value',
            isCustom: true,
            rawValue: 'value',
          },
        },
        hasOptions: true,
      };

      const result = processor.generateTemplateMetadata(metadata);
      
      expect(result.hasOptions).toBe(true);
      expect(result.hasStandardOptions).toBe(true);
      expect(result.hasCustomOptions).toBe(true);
      expect(result.standardOptions).toHaveLength(1);
      expect(result.customOptions).toHaveLength(1);
      expect(result.allOptions).toHaveLength(2);
      expect(result.optionsMap).toHaveProperty('deprecated');
      expect(result.optionsMap).toHaveProperty('(my_option)');
    });
  });
});

describe('OptionHelpers', () => {
  describe('standard option helpers', () => {
    it('should detect deprecated options', () => {
      expect(OptionHelpers.isDeprecated({ deprecated: true })).toBe(true);
      expect(OptionHelpers.isDeprecated({ deprecated: false })).toBe(false);
      expect(OptionHelpers.isDeprecated({})).toBe(false);
    });

    it('should get Java package', () => {
      expect(OptionHelpers.getJavaPackage({ java_package: 'com.example' })).toBe('com.example');
      expect(OptionHelpers.getJavaPackage({})).toBeUndefined();
    });

    it('should get Go package', () => {
      expect(OptionHelpers.getGoPackage({ go_package: 'github.com/example' })).toBe('github.com/example');
      expect(OptionHelpers.getGoPackage({})).toBeUndefined();
    });

    it('should get optimization mode', () => {
      expect(OptionHelpers.getOptimizeFor({ optimize_for: 'SPEED' })).toBe('SPEED');
      expect(OptionHelpers.getOptimizeFor({})).toBeUndefined();
    });

    it('should check allow alias', () => {
      expect(OptionHelpers.getAllowAlias({ allow_alias: true })).toBe(true);
      expect(OptionHelpers.getAllowAlias({ allow_alias: false })).toBe(false);
      expect(OptionHelpers.getAllowAlias({})).toBe(false);
    });

    it('should get custom options', () => {
      const options = {
        '(my_option)': 'value',
        '(another_option)': 42,
        standard: 'value',
      };

      expect(OptionHelpers.getCustomOption(options, 'my_option')).toBe('value');
      expect(OptionHelpers.getCustomOption(options, '(another_option)')).toBe(42);
      expect(OptionHelpers.getCustomOption(options, 'nonexistent')).toBeUndefined();
    });
  });
});

describe('Template integration', () => {
  it('should work with template metadata structure', () => {
    const processor = new OptionProcessor();
    const options = {
      deprecated: true,
      java_package: 'com.example',
      '(custom_option)': 'custom_value',
    };

    const metadata = processor.processOptions(options);
    const templateMetadata = processor.generateTemplateMetadata(metadata);

    // Verify template can access standard options
    expect(templateMetadata.hasStandardOptions).toBe(true);
    expect(templateMetadata.standardOptions.find(opt => opt.name === 'deprecated')?.value).toBe(true);
    expect(templateMetadata.standardOptions.find(opt => opt.name === 'java_package')?.value).toBe('com.example');

    // Verify template can access custom options
    expect(templateMetadata.hasCustomOptions).toBe(true);
    expect(templateMetadata.customOptions.find(opt => opt.name === '(custom_option)')?.value).toBe('custom_value');

    // Verify template can access all options via map
    expect(templateMetadata.optionsMap['deprecated'].value).toBe(true);
    expect(templateMetadata.optionsMap['java_package'].value).toBe('com.example');
    expect(templateMetadata.optionsMap['(custom_option)'].value).toBe('custom_value');
  });

  it('should handle edge cases gracefully', () => {
    const processor = new OptionProcessor();
    
    // Empty options
    const emptyMetadata = processor.processOptions({});
    const emptyTemplate = processor.generateTemplateMetadata(emptyMetadata);
    
    expect(emptyTemplate.hasOptions).toBe(false);
    expect(emptyTemplate.allOptions).toHaveLength(0);
    
    // Null/undefined values
    const nullOptions = {
      null_option: null,
      undefined_option: undefined,
      empty_string: '',
    };
    
    const nullMetadata = processor.processOptions(nullOptions);
    const nullTemplate = processor.generateTemplateMetadata(nullMetadata);
    
    expect(nullTemplate.hasOptions).toBe(true);
    expect(nullTemplate.optionsMap['null_option'].value).toBe(null);
    expect(nullTemplate.optionsMap['undefined_option'].value).toBe(undefined);
    expect(nullTemplate.optionsMap['empty_string'].value).toBe('');
  });
});