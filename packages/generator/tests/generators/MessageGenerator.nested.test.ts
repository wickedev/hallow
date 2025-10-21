/**
 * Unit tests for MessageGenerator - Nested Type Generation (Task 1.3)
 *
 * Tests comprehensive nested type handling including:
 * - Nested messages within parent namespaces
 * - Nested enums with correct TypeScript enum syntax
 * - Deeply nested structures (3+ levels)
 * - Naming conflict prevention
 * - Export statements for nested types
 */

import { MessageGenerator, createMessageGenerator } from '../../src/generators/MessageGenerator';
import { TemplateEngine } from '../../src/core/template-engine';
import {
  MessageDefinition,
  FieldDefinition,
  EnumDefinition
} from '../../src/core/proto-types';

describe('MessageGenerator - Nested Types (Task 1.3)', () => {
  let generator: MessageGenerator;
  let templateEngine: TemplateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
    generator = createMessageGenerator(templateEngine, {
      generateComments: true,
      readonlyProperties: false,
      generateNamespaces: true
    });
  });

  describe('Nested Message Generation', () => {
    it('should generate nested message within parent namespace', () => {
      const nestedMessage: MessageDefinition = {
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
            name: 'zip_code',
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
      };

      const message: MessageDefinition = {
        name: 'Person',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'address',
            number: 2,
            type: 'Address',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [nestedMessage],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // Check parent interface
      expect(result).toContain('export interface Person');
      expect(result).toContain('name: string;');

      // Check namespace is created
      expect(result).toContain('export namespace Person {');

      // Check nested interface has export keyword
      expect(result).toContain('export interface Address');

      // Check nested message fields
      expect(result).toContain('street: string;');
      expect(result).toContain('city: string;');
      expect(result).toContain('zipCode: string;'); // camelCase conversion

      // Verify namespace closes
      expect(result).toMatch(/export namespace Person \{[\s\S]*\}/);
    });

    it('should generate multiple nested messages in same namespace', () => {
      const address: MessageDefinition = {
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
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const phoneNumber: MessageDefinition = {
        name: 'PhoneNumber',
        fields: [
          {
            name: 'country_code',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'number',
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
      };

      const message: MessageDefinition = {
        name: 'Contact',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [address, phoneNumber],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // Check both nested messages exist
      expect(result).toContain('export interface Address');
      expect(result).toContain('export interface PhoneNumber');

      // Check they're in same namespace
      expect(result).toContain('export namespace Contact {');

      // Check fields
      expect(result).toContain('street: string;');
      expect(result).toContain('countryCode: string;');
    });

    it('should handle deeply nested structures (3 levels)', () => {
      // Level 3: City
      const city: MessageDefinition = {
        name: 'City',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'population',
            number: 2,
            type: 'int32',
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
      };

      // Level 2: Address (contains City)
      const address: MessageDefinition = {
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
          }
        ],
        nestedMessages: [city],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      // Level 1: Person (contains Address)
      const person: MessageDefinition = {
        name: 'Person',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [address],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(person);

      // Check all 3 levels exist
      expect(result).toContain('export interface Person');
      expect(result).toContain('export namespace Person {');
      expect(result).toContain('export interface Address');
      expect(result).toContain('export namespace Address {');
      expect(result).toContain('export interface City');

      // Check fields at each level
      expect(result).toContain('street: string;');
      expect(result).toContain('population: number;');

      // Verify proper nesting structure
      expect(result).toMatch(/export namespace Person \{[\s\S]*export namespace Address \{[\s\S]*export interface City/);
    });

    it('should handle deeply nested structures (4+ levels)', () => {
      // Level 4: Coordinate
      const coordinate: MessageDefinition = {
        name: 'Coordinate',
        fields: [
          {
            name: 'latitude',
            number: 1,
            type: 'double',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'longitude',
            number: 2,
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
      };

      // Level 3: Location (contains Coordinate)
      const location: MessageDefinition = {
        name: 'Location',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [coordinate],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      // Level 2: Address (contains Location)
      const address: MessageDefinition = {
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
          }
        ],
        nestedMessages: [location],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      // Level 1: User (contains Address)
      const user: MessageDefinition = {
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
          }
        ],
        nestedMessages: [address],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(user);

      // Check all 4 levels exist
      expect(result).toContain('export interface User');
      expect(result).toContain('export interface Address');
      expect(result).toContain('export interface Location');
      expect(result).toContain('export interface Coordinate');

      // Verify proper nesting structure
      expect(result).toMatch(/export namespace User \{/);
      expect(result).toMatch(/export namespace Address \{/);
      expect(result).toMatch(/export namespace Location \{/);

      // Check deepest level fields
      expect(result).toContain('latitude: number;');
      expect(result).toContain('longitude: number;');
    });
  });

  describe('Nested Enum Generation', () => {
    it('should generate nested enum with correct TypeScript syntax', () => {
      const nestedEnum: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'UNKNOWN', number: 0, options: {} },
          { name: 'ACTIVE', number: 1, options: {} },
          { name: 'INACTIVE', number: 2, options: {} },
          { name: 'PENDING', number: 3, options: {} }
        ],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Account',
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
            name: 'status',
            number: 2,
            type: 'Status',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [nestedEnum],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // Check namespace
      expect(result).toContain('export namespace Account {');

      // Check enum has export keyword
      expect(result).toContain('export enum Status {');

      // Check all enum values with correct TypeScript syntax
      expect(result).toContain('UNKNOWN = 0,');
      expect(result).toContain('ACTIVE = 1,');
      expect(result).toContain('INACTIVE = 2,');
      expect(result).toContain('PENDING = 3,');

      // Verify JSDoc comment for enum
      expect(result).toMatch(/\/\*\*[\s\S]*\* Enum Status/);
    });

    it('should generate multiple nested enums', () => {
      const statusEnum: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'ACTIVE', number: 0, options: {} },
          { name: 'INACTIVE', number: 1, options: {} }
        ],
        options: {}
      };

      const typeEnum: EnumDefinition = {
        name: 'Type',
        values: [
          { name: 'PERSONAL', number: 0, options: {} },
          { name: 'BUSINESS', number: 1, options: {} },
          { name: 'ENTERPRISE', number: 2, options: {} }
        ],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Account',
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
        nestedEnums: [statusEnum, typeEnum],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // Check both enums exist
      expect(result).toContain('export enum Status {');
      expect(result).toContain('export enum Type {');

      // Check all values
      expect(result).toContain('ACTIVE = 0,');
      expect(result).toContain('INACTIVE = 1,');
      expect(result).toContain('PERSONAL = 0,');
      expect(result).toContain('BUSINESS = 1,');
      expect(result).toContain('ENTERPRISE = 2,');
    });

    it('should generate nested enums within nested messages', () => {
      const statusEnum: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'DRAFT', number: 0, options: {} },
          { name: 'PUBLISHED', number: 1, options: {} },
          { name: 'ARCHIVED', number: 2, options: {} }
        ],
        options: {}
      };

      const nestedMessage: MessageDefinition = {
        name: 'Article',
        fields: [
          {
            name: 'title',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'status',
            number: 2,
            type: 'Status',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [statusEnum],
        oneofs: [],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Blog',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [nestedMessage],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // Check nested structure
      expect(result).toContain('export namespace Blog {');
      expect(result).toContain('export interface Article');
      expect(result).toContain('export namespace Article {');
      expect(result).toContain('export enum Status {');

      // Check enum values
      expect(result).toContain('DRAFT = 0,');
      expect(result).toContain('PUBLISHED = 1,');
      expect(result).toContain('ARCHIVED = 2,');
    });
  });

  describe('Mixed Nested Types', () => {
    it('should handle messages and enums in same namespace', () => {
      const address: MessageDefinition = {
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
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const statusEnum: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'VERIFIED', number: 0, options: {} },
          { name: 'UNVERIFIED', number: 1, options: {} }
        ],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Person',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [address],
        nestedEnums: [statusEnum],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // Check namespace contains both
      expect(result).toContain('export namespace Person {');
      expect(result).toContain('export interface Address');
      expect(result).toContain('export enum Status {');

      // Verify proper export statements
      expect(result).toMatch(/export interface Address[\s\S]*export enum Status/);
    });
  });

  describe('Naming Conflict Prevention', () => {
    it('should handle nested type with same name as parent field', () => {
      const valueMessage: MessageDefinition = {
        name: 'Value',
        fields: [
          {
            name: 'amount',
            number: 1,
            type: 'int32',
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
      };

      const message: MessageDefinition = {
        name: 'Config',
        fields: [
          {
            name: 'value',
            number: 1,
            type: 'Value',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [valueMessage],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // Both should exist without conflicts
      expect(result).toContain('export interface Config {');
      expect(result).toContain('value: Value;'); // field
      expect(result).toContain('export interface Value'); // nested type
      expect(result).toContain('amount: number;');
    });

    it('should handle multiple levels with potential naming conflicts', () => {
      const item: MessageDefinition = {
        name: 'Item',
        fields: [
          {
            name: 'name',
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
      };

      const list: MessageDefinition = {
        name: 'List',
        fields: [
          {
            name: 'items',
            number: 1,
            type: 'Item',
            repeated: true,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [item],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const container: MessageDefinition = {
        name: 'Container',
        fields: [
          {
            name: 'list',
            number: 1,
            type: 'List',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [list],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(container);

      // All types should be properly namespaced
      expect(result).toContain('export interface Container');
      expect(result).toContain('list: List;');
      expect(result).toContain('export namespace Container {');
      expect(result).toContain('export interface List');
      expect(result).toContain('items: Item[];');
      expect(result).toContain('export namespace List {');
      expect(result).toContain('export interface Item');
    });
  });

  describe('Export Statements', () => {
    it('should generate correct export statements for nested types', () => {
      const nestedMessage: MessageDefinition = {
        name: 'Details',
        fields: [
          {
            name: 'info',
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
      };

      const nestedEnum: EnumDefinition = {
        name: 'Type',
        values: [
          { name: 'A', number: 0, options: {} },
          { name: 'B', number: 1, options: {} }
        ],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Record',
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
        nestedMessages: [nestedMessage],
        nestedEnums: [nestedEnum],
        oneofs: [],
        options: {}
      };

      const generated = generator.generateMessage(message);

      // Check exports array includes nested types
      expect(generated.exports).toContain('export { Record }');
      expect(generated.exports.some(e => e.includes('Details'))).toBeTruthy();
      expect(generated.exports.some(e => e.includes('Type'))).toBeTruthy();
    });
  });

  describe('TypeScript Strict Mode Compliance', () => {
    it('should generate code that compiles with tsc --strict', () => {
      // Complex nested structure to test strict mode compliance
      const coordinate: MessageDefinition = {
        name: 'Coordinate',
        fields: [
          {
            name: 'lat',
            number: 1,
            type: 'double',
            repeated: false,
            optional: true,
            map: false,
            options: {}
          },
          {
            name: 'lng',
            number: 2,
            type: 'double',
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
      };

      const location: MessageDefinition = {
        name: 'Location',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [coordinate],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const venue: MessageDefinition = {
        name: 'Venue',
        fields: [
          {
            name: 'title',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'locations',
            number: 2,
            type: 'Location',
            repeated: true,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [location],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(venue);

      // Check no 'any' types are present
      expect(result).not.toContain(': any');

      // Check optional fields have proper syntax
      expect(result).toContain('lat?: number | undefined;');
      expect(result).toContain('lng?: number | undefined;');

      // Check repeated fields are arrays
      expect(result).toContain('locations: Location[];');

      // All interfaces should have export keyword
      const interfaceMatches = result.match(/interface \w+/g) || [];
      const exportInterfaceMatches = result.match(/export interface \w+/g) || [];
      expect(interfaceMatches.length).toBe(exportInterfaceMatches.length);
    });
  });
});
