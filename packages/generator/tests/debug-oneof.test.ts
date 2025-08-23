import { MessageGenerator, createMessageGenerator } from '../src/generators/MessageGenerator';
import { TemplateEngine } from '../src/core/template-engine';
import { MessageDefinition } from '../src/core/proto-types';

describe('Debug Oneof', () => {
  it('should debug oneof context', () => {
    const templateEngine = new TemplateEngine();
    const generator = createMessageGenerator(templateEngine);
    
    const message: MessageDefinition = {
      name: 'OneofMessage',
      fields: [],
      nestedMessages: [],
      nestedEnums: [],
      oneofs: [
        {
          name: 'result',
          fields: [
            {
              name: 'success',
              number: 1,
              type: 'string',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            },
            {
              name: 'error',
              number: 2,
              type: 'int32',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ]
        }
      ],
      options: {}
    };
    
    // Access private method via any cast for debugging
    const context = (generator as any).createMessageContext(message);
    
    console.log('Message Context:', JSON.stringify(context, null, 2));
    console.log('Oneofs:', context.oneofs);
    console.log('Oneof fields:', context.oneofs[0]?.fields);
    
    const serialization = generator.generateSerialization(message);
    console.log('Serialization:', serialization);
  });
});