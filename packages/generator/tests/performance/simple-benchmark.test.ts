/**
 * Simple performance benchmark tests
 */

import { Generator } from '../../src/core/generator';
import { ProtoFile } from '../../src/core/proto-types';

describe('Simple Performance Tests', () => {
  it('should generate code with performance monitoring', async () => {
    const generator = new Generator({
      enablePerformanceMonitoring: true,
      optimization: {
        production: true,
      },
    });

    const protoFile: ProtoFile = {
      fileName: 'test.proto',
      package: 'test',
      imports: [],
      services: [
        {
          name: 'TestService',
          methods: [
            {
              name: 'TestMethod',
              inputType: 'TestRequest',
              outputType: 'TestResponse',
              clientStreaming: false,
              serverStreaming: false,
              options: {},
            },
          ],
          options: {},
        },
      ],
      messages: [
        {
          name: 'TestRequest',
          fields: [
            {
              name: 'id',
              type: 'string',
              number: 1,
              repeated: false,
              optional: false,
              map: false,
              options: {},
            },
          ],
          nestedMessages: [],
          nestedEnums: [],
          options: {},
          oneofs: [],
        },
        {
          name: 'TestResponse',
          fields: [
            {
              name: 'result',
              type: 'string',
              number: 1,
              repeated: false,
              optional: false,
              map: false,
              options: {},
            },
          ],
          nestedMessages: [],
          nestedEnums: [],
          options: {},
          oneofs: [],
        },
      ],
      enums: [],
      options: {},
    };

    const result = await generator.generateCode(protoFile);
    
    // Check that code was generated
    expect(result.files.length).toBeGreaterThan(0);
    
    // Check for performance report in development mode
    const perfReport = result.files.find(f => f.path === 'performance-report.md');
    // Since we're in production mode, performance report should not be included
    expect(perfReport).toBeUndefined();
    
    // Check for bundle report in production mode
    const bundleReport = result.files.find(f => f.path === 'bundle-report.md');
    expect(bundleReport).toBeDefined();
  });

  it('should handle large proto files with memory-efficient generation', async () => {
    const generator = new Generator({
      enablePerformanceMonitoring: true,
      optimization: {
        production: false,
      },
    });

    // Create a large proto file
    const protoFile: ProtoFile = {
      fileName: 'large.proto',
      package: 'large',
      imports: [],
      services: Array.from({ length: 60 }, (_, i) => ({
        name: `Service${i}`,
        methods: Array.from({ length: 5 }, (_, j) => ({
          name: `Method${j}`,
          inputType: `Request${i}Method${j}`,
          outputType: `Response${i}Method${j}`,
          clientStreaming: false,
          serverStreaming: false,
          options: {},
        })),
        options: {},
      })),
      messages: [
        // Generate Request and Response messages for each service method
        ...Array.from({ length: 60 }, (_, i) =>
          Array.from({ length: 5 }, (_, j) => [
            {
              name: `Request${i}Method${j}`,
              fields: [{
                name: 'data',
                type: 'string',
                number: 1,
                repeated: false,
                optional: false,
                map: false,
                options: {},
              }],
              nestedMessages: [],
              nestedEnums: [],
              options: {},
              oneofs: [],
            },
            {
              name: `Response${i}Method${j}`,
              fields: [{
                name: 'result',
                type: 'string',
                number: 1,
                repeated: false,
                optional: false,
                map: false,
                options: {},
              }],
              nestedMessages: [],
              nestedEnums: [],
              options: {},
              oneofs: [],
            },
          ])
        ).flat(2),
      ],
      enums: [],
      options: {},
    };

    const startTime = Date.now();
    const result = await generator.generateCode(protoFile);
    const duration = Date.now() - startTime;
    
    console.log(`Large file generation took ${duration}ms`);
    
    // Check that code was generated
    expect(result.files.length).toBeGreaterThan(0);
    
    // Check for performance report in non-production mode
    const perfReport = result.files.find(f => f.path === 'performance-report.md');
    expect(perfReport).toBeDefined();
    
    // Should complete within reasonable time (30 seconds)
    expect(duration).toBeLessThan(30000);
  });
});
