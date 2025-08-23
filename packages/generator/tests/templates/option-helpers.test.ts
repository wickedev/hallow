/**
 * Comprehensive tests for option-helpers template utilities
 */

import { optionHelpers, registerOptionHelpers } from '../../src/templates/option-helpers';
import { TemplateOptionMetadata, ProcessedOption } from '../../src/utils/OptionProcessor';
import Handlebars from 'handlebars';

describe('Option Helpers', () => {
  let mockOptions: TemplateOptionMetadata;
  let emptyOptions: TemplateOptionMetadata;

  beforeEach(() => {
    mockOptions = {
      hasOptions: true,
      hasStandardOptions: true,
      hasCustomOptions: true,
      standardOptions: [
        {
          name: 'deprecated',
          value: false,
          isCustom: false,
          rawValue: false
        },
        {
          name: 'json_name',
          value: 'customJsonName',
          isCustom: false,
          rawValue: 'customJsonName'
        }
      ],
      customOptions: [
        {
          name: '(custom_validation)',
          value: 'required',
          isCustom: true,
          rawValue: 'required'
        },
        {
          name: '(custom_max_length)',
          value: 100,
          isCustom: true,
          rawValue: 100
        }
      ],
      allOptions: [],
      optionsMap: {}
    };

    // Create allOptions and optionsMap
    mockOptions.allOptions = [...mockOptions.standardOptions, ...mockOptions.customOptions];
    mockOptions.optionsMap = {};
    mockOptions.allOptions.forEach(option => {
      mockOptions.optionsMap[option.name] = option;
    });

    emptyOptions = {
      hasOptions: false,
      hasStandardOptions: false,
      hasCustomOptions: false,
      standardOptions: [],
      customOptions: [],
      allOptions: [],
      optionsMap: {}
    };
  });

  describe('hasOptions', () => {
    it('should return true when options exist', () => {
      expect(optionHelpers.hasOptions(mockOptions)).toBe(true);
    });

    it('should return false when options do not exist', () => {
      expect(optionHelpers.hasOptions(emptyOptions)).toBe(false);
    });

    it('should return false for undefined options', () => {
      expect(optionHelpers.hasOptions(undefined)).toBe(false);
    });

    it('should return false for null options', () => {
      expect(optionHelpers.hasOptions(null as any)).toBe(false);
    });
  });

  describe('hasStandardOptions', () => {
    it('should return true when standard options exist', () => {
      expect(optionHelpers.hasStandardOptions(mockOptions)).toBe(true);
    });

    it('should return false when no standard options exist', () => {
      expect(optionHelpers.hasStandardOptions(emptyOptions)).toBe(false);
    });

    it('should return false for undefined options', () => {
      expect(optionHelpers.hasStandardOptions(undefined)).toBe(false);
    });
  });

  describe('hasCustomOptions', () => {
    it('should return true when custom options exist', () => {
      expect(optionHelpers.hasCustomOptions(mockOptions)).toBe(true);
    });

    it('should return false when no custom options exist', () => {
      expect(optionHelpers.hasCustomOptions(emptyOptions)).toBe(false);
    });

    it('should return false for undefined options', () => {
      expect(optionHelpers.hasCustomOptions(undefined)).toBe(false);
    });
  });

  describe('getOption', () => {
    it('should return option by name', () => {
      const option = optionHelpers.getOption(mockOptions, 'deprecated');
      expect(option).toBeDefined();
      expect(option?.name).toBe('deprecated');
      expect(option?.value).toBe(false);
    });

    it('should return custom option by name', () => {
      const option = optionHelpers.getOption(mockOptions, '(custom_validation)');
      expect(option).toBeDefined();
      expect(option?.name).toBe('(custom_validation)');
      expect(option?.value).toBe('required');
    });

    it('should return undefined for non-existent option', () => {
      const option = optionHelpers.getOption(mockOptions, 'non_existent');
      expect(option).toBeUndefined();
    });

    it('should return undefined for undefined options', () => {
      const option = optionHelpers.getOption(undefined, 'any');
      expect(option).toBeUndefined();
    });

    it('should return undefined for undefined name', () => {
      const option = optionHelpers.getOption(mockOptions, undefined);
      expect(option).toBeUndefined();
    });
  });

  describe('hasOption', () => {
    it('should return true for existing option', () => {
      expect(optionHelpers.hasOption(mockOptions, 'deprecated')).toBe(true);
    });

    it('should return true for existing custom option', () => {
      expect(optionHelpers.hasOption(mockOptions, '(custom_validation)')).toBe(true);
    });

    it('should return false for non-existent option', () => {
      expect(optionHelpers.hasOption(mockOptions, 'non_existent')).toBe(false);
    });

    it('should return false for undefined options', () => {
      expect(optionHelpers.hasOption(undefined, 'any')).toBe(false);
    });

    it('should return false for undefined name', () => {
      expect(optionHelpers.hasOption(mockOptions, undefined)).toBe(false);
    });
  });

  describe('getOptionValue', () => {
    it('should return option value', () => {
      const value = optionHelpers.getOptionValue(mockOptions, 'json_name');
      expect(value).toBe('customJsonName');
    });

    it('should return numeric option value', () => {
      const value = optionHelpers.getOptionValue(mockOptions, '(custom_max_length)');
      expect(value).toBe(100);
    });

    it('should return default value for non-existent option', () => {
      const value = optionHelpers.getOptionValue(mockOptions, 'non_existent', 'default');
      expect(value).toBe('default');
    });

    it('should return default value for undefined options', () => {
      const value = optionHelpers.getOptionValue(undefined, 'any', 'default');
      expect(value).toBe('default');
    });

    it('should return default value for undefined name', () => {
      const value = optionHelpers.getOptionValue(mockOptions, undefined, 'default');
      expect(value).toBe('default');
    });
  });

  describe('optionEquals', () => {
    it('should return true when option value matches', () => {
      const result = optionHelpers.optionEquals(mockOptions, 'deprecated', false);
      expect(result).toBe(true);
    });

    it('should return true for string option value match', () => {
      const result = optionHelpers.optionEquals(mockOptions, '(custom_validation)', 'required');
      expect(result).toBe(true);
    });

    it('should return false when option value does not match', () => {
      const result = optionHelpers.optionEquals(mockOptions, 'deprecated', true);
      expect(result).toBe(false);
    });

    it('should return false for non-existent option', () => {
      const result = optionHelpers.optionEquals(mockOptions, 'non_existent', 'any');
      expect(result).toBe(false);
    });

    it('should return false for undefined options', () => {
      const result = optionHelpers.optionEquals(undefined, 'any', 'value');
      expect(result).toBe(false);
    });
  });

  describe('isDeprecated', () => {
    it('should return false when deprecated option is false', () => {
      expect(optionHelpers.isDeprecated(mockOptions)).toBe(false);
    });

    it('should return true when deprecated option is true', () => {
      const deprecatedOptions = { ...mockOptions };
      deprecatedOptions.optionsMap.deprecated = {
        name: 'deprecated',
        value: true,
        isCustom: false,
        rawValue: true
      };

      expect(optionHelpers.isDeprecated(deprecatedOptions)).toBe(true);
    });

    it('should return false when no deprecated option exists', () => {
      expect(optionHelpers.isDeprecated(emptyOptions)).toBe(false);
    });

    it('should return false for undefined options', () => {
      expect(optionHelpers.isDeprecated(undefined)).toBe(false);
    });
  });

  describe('formatOptionValue', () => {
    it('should format string values with quotes', () => {
      const option: ProcessedOption = {
        name: 'test',
        value: 'hello',
        isCustom: false,
        rawValue: 'hello'
      };

      expect(optionHelpers.formatOptionValue(option)).toBe('"hello"');
    });

    it('should format boolean values as strings', () => {
      const option: ProcessedOption = {
        name: 'test',
        value: true,
        isCustom: false,
        rawValue: true
      };

      expect(optionHelpers.formatOptionValue(option)).toBe('true');
    });

    it('should format number values as strings', () => {
      const option: ProcessedOption = {
        name: 'test',
        value: 42,
        isCustom: false,
        rawValue: 42
      };

      expect(optionHelpers.formatOptionValue(option)).toBe('42');
    });

    it('should format object values as JSON', () => {
      const option: ProcessedOption = {
        name: 'test',
        value: { nested: 'value' },
        isCustom: false,
        rawValue: { nested: 'value' }
      };

      expect(optionHelpers.formatOptionValue(option)).toBe('{"nested":"value"}');
    });

    it('should return empty string for undefined option', () => {
      expect(optionHelpers.formatOptionValue(undefined)).toBe('');
    });

    it('should handle other types by converting to string', () => {
      const option: ProcessedOption = {
        name: 'test',
        value: Symbol('test') as any,
        isCustom: false,
        rawValue: Symbol('test') as any
      };

      expect(optionHelpers.formatOptionValue(option)).toBe('Symbol(test)');
    });
  });

  describe('generateOptionsComment', () => {
    it('should generate comment with standard and custom options', () => {
      const comment = optionHelpers.generateOptionsComment(mockOptions);
      
      expect(comment).toContain('Standard options:');
      expect(comment).toContain('Custom options:');
      expect(comment).toContain('deprecated: false');
      expect(comment).toContain('json_name: "customJsonName"');
      expect(comment).toContain('(custom_validation): "required"');
      expect(comment).toContain('(custom_max_length): 100');
    });

    it('should return empty string for options without content', () => {
      const comment = optionHelpers.generateOptionsComment(emptyOptions);
      expect(comment).toBe('');
    });

    it('should return empty string for undefined options', () => {
      const comment = optionHelpers.generateOptionsComment(undefined);
      expect(comment).toBe('');
    });

    it('should handle options with only standard options', () => {
      const standardOnlyOptions = {
        ...emptyOptions,
        hasOptions: true,
        hasStandardOptions: true,
        standardOptions: mockOptions.standardOptions
      };

      const comment = optionHelpers.generateOptionsComment(standardOnlyOptions);
      expect(comment).toContain('Standard options:');
      expect(comment).not.toContain('Custom options:');
    });

    it('should handle options with only custom options', () => {
      const customOnlyOptions = {
        ...emptyOptions,
        hasOptions: true,
        hasCustomOptions: true,
        customOptions: mockOptions.customOptions
      };

      const comment = optionHelpers.generateOptionsComment(customOnlyOptions);
      expect(comment).toContain('Custom options:');
      expect(comment).not.toContain('Standard options:');
    });
  });

  describe('generateMetadataObject', () => {
    it('should generate metadata object as JSON string', () => {
      const metadata = optionHelpers.generateMetadataObject(mockOptions);
      const parsed = JSON.parse(metadata);

      expect(parsed).toHaveProperty('deprecated');
      expect(parsed.deprecated).toEqual({
        value: false,
        isCustom: false,
        rawValue: false
      });

      expect(parsed).toHaveProperty('(custom_validation)');
      expect(parsed['(custom_validation)']).toEqual({
        value: 'required',
        isCustom: true,
        rawValue: 'required'
      });
    });

    it('should return "undefined" for empty options', () => {
      const metadata = optionHelpers.generateMetadataObject(emptyOptions);
      expect(metadata).toBe('undefined');
    });

    it('should return "undefined" for undefined options', () => {
      const metadata = optionHelpers.generateMetadataObject(undefined);
      expect(metadata).toBe('undefined');
    });
  });

  describe('filterOptions', () => {
    it('should return standard options when type is "standard"', () => {
      const options = optionHelpers.filterOptions(mockOptions, 'standard');
      expect(options).toEqual(mockOptions.standardOptions);
    });

    it('should return custom options when type is "custom"', () => {
      const options = optionHelpers.filterOptions(mockOptions, 'custom');
      expect(options).toEqual(mockOptions.customOptions);
    });

    it('should return all options when type is not specified', () => {
      const options = optionHelpers.filterOptions(mockOptions);
      expect(options).toEqual(mockOptions.allOptions);
    });

    it('should return empty array for undefined options', () => {
      const options = optionHelpers.filterOptions(undefined, 'standard');
      expect(options).toEqual([]);
    });
  });

  describe('shouldIncludeInComments', () => {
    it('should return true for general options', () => {
      const option: ProcessedOption = {
        name: 'deprecated',
        value: true,
        isCustom: false,
        rawValue: true
      };

      expect(optionHelpers.shouldIncludeInComments(option)).toBe(true);
    });

    it('should return false for java_package option', () => {
      const option: ProcessedOption = {
        name: 'java_package',
        value: 'com.example',
        isCustom: false,
        rawValue: 'com.example'
      };

      expect(optionHelpers.shouldIncludeInComments(option)).toBe(false);
    });

    it('should return false for go_package option', () => {
      const option: ProcessedOption = {
        name: 'go_package',
        value: 'example.com/proto',
        isCustom: false,
        rawValue: 'example.com/proto'
      };

      expect(optionHelpers.shouldIncludeInComments(option)).toBe(false);
    });

    it('should return false for undefined option', () => {
      expect(optionHelpers.shouldIncludeInComments(undefined)).toBe(false);
    });
  });

  describe('generateDeprecationWarning', () => {
    it('should return empty string for non-deprecated options', () => {
      const warning = optionHelpers.generateDeprecationWarning(mockOptions);
      expect(warning).toBe('');
    });

    it('should generate warning for deprecated options', () => {
      const deprecatedOptions = { ...mockOptions };
      deprecatedOptions.optionsMap.deprecated = {
        name: 'deprecated',
        value: true,
        isCustom: false,
        rawValue: true
      };

      const warning = optionHelpers.generateDeprecationWarning(deprecatedOptions);
      expect(warning).toContain('/**');
      expect(warning).toContain('@deprecated');
      expect(warning).toContain('This element is deprecated');
      expect(warning).toContain('*/');
    });

    it('should use custom deprecation message when provided', () => {
      const deprecatedOptions = { ...mockOptions };
      deprecatedOptions.optionsMap.deprecated = {
        name: 'deprecated',
        value: 'Use newMethod instead',
        isCustom: false,
        rawValue: 'Use newMethod instead'
      };

      const warning = optionHelpers.generateDeprecationWarning(deprecatedOptions);
      expect(warning).toContain('Use newMethod instead');
    });

    it('should return empty string for undefined options', () => {
      const warning = optionHelpers.generateDeprecationWarning(undefined);
      expect(warning).toBe('');
    });
  });

  describe('getOptionNames', () => {
    it('should return array of option names', () => {
      const names = optionHelpers.getOptionNames(mockOptions);
      expect(names).toEqual(['deprecated', 'json_name', '(custom_validation)', '(custom_max_length)']);
    });

    it('should return empty array for empty options', () => {
      const names = optionHelpers.getOptionNames(emptyOptions);
      expect(names).toEqual([]);
    });

    it('should return empty array for undefined options', () => {
      const names = optionHelpers.getOptionNames(undefined);
      expect(names).toEqual([]);
    });
  });

  describe('sortOptions', () => {
    it('should sort options by name', () => {
      const unsortedOptions = [
        mockOptions.allOptions[3], // custom.max_length
        mockOptions.allOptions[0], // deprecated
        mockOptions.allOptions[2], // custom.validation
        mockOptions.allOptions[1], // json_name
      ];

      const sorted = optionHelpers.sortOptions(unsortedOptions);
      expect(sorted.map(o => o.name)).toEqual([
        '(custom_max_length)',
        '(custom_validation)',
        'deprecated',
        'json_name'
      ]);
    });

    it('should return empty array for undefined options', () => {
      const sorted = optionHelpers.sortOptions(undefined);
      expect(sorted).toEqual([]);
    });

    it('should not modify the original array', () => {
      const original = [...mockOptions.allOptions];
      const sorted = optionHelpers.sortOptions(mockOptions.allOptions);
      
      expect(original).toEqual(mockOptions.allOptions);
      expect(sorted).not.toBe(mockOptions.allOptions);
    });
  });

  describe('registerOptionHelpers', () => {
    it('should register all helpers with Handlebars', () => {
      const handlebars = Handlebars.create();
      const registerHelperSpy = jest.spyOn(handlebars, 'registerHelper');

      registerOptionHelpers(handlebars);

      // Check that all helpers were registered
      const expectedHelpers = Object.keys(optionHelpers);
      expect(registerHelperSpy).toHaveBeenCalledTimes(expectedHelpers.length);

      expectedHelpers.forEach(helperName => {
        expect(registerHelperSpy).toHaveBeenCalledWith(helperName, optionHelpers[helperName as keyof typeof optionHelpers]);
      });
    });

    it('should work with actual Handlebars templates', () => {
      const handlebars = Handlebars.create();
      registerOptionHelpers(handlebars);

      const template = handlebars.compile(`
        {{#if (hasOptions options)}}
          Options exist: {{#each (getOptionNames options)}}{{this}} {{/each}}
        {{/if}}
        {{#if (hasOption options "deprecated")}}
          Deprecated: {{getOptionValue options "deprecated"}}
        {{/if}}
      `);

      const result = template({ options: mockOptions });
      
      expect(result).toContain('Options exist:');
      expect(result).toContain('deprecated');
      expect(result).toContain('json_name');
      expect(result).toContain('Deprecated: false');
    });
  });

  describe('Integration Tests', () => {
    it('should work with complex template scenarios', () => {
      const handlebars = Handlebars.create();
      registerOptionHelpers(handlebars);

      const complexTemplate = handlebars.compile(`
        {{#if (hasOptions options)}}
          {{generateOptionsComment options}}
          {{#if (isDeprecated options)}}
            {{generateDeprecationWarning options}}
          {{/if}}
          Metadata: {{{generateMetadataObject options}}}
        {{/if}}
      `);

      const result = complexTemplate({ options: mockOptions });
      
      expect(result).toContain('Standard options:');
      expect(result).toContain('Custom options:');
      expect(result).toContain('Metadata:');
      expect(result).toContain('"deprecated"');
      expect(result).toContain('"(custom_validation)"');
    });

    it('should handle edge cases in templates', () => {
      const handlebars = Handlebars.create();
      registerOptionHelpers(handlebars);

      const template = handlebars.compile(`
        {{#if (hasOptions undefined)}}Should not show{{/if}}
        {{#if (hasOption options "nonexistent")}}Should not show{{/if}}
        {{getOptionValue options "nonexistent" "default"}}
      `);

      const result = template({ options: mockOptions });
      
      expect(result).not.toContain('Should not show');
      expect(result.trim()).toContain('default');
    });
  });
});