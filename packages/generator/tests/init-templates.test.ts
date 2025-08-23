import { TemplateEngine } from '../src/core/template-engine';
import * as path from 'path';

describe('Template Loading', () => {
  it('should load and render templates', async () => {
    const templateEngine = new TemplateEngine();
    
    // Load the message-serialization template
    const templatePath = path.join(__dirname, '../src/templates/message-serialization.hbs');
    await templateEngine.loadTemplate('message-serialization', templatePath);
    
    // Test context with oneofs
    const context = {
      interfaceName: 'TestMessage',
      name: 'TestMessage',
      fields: [],
      oneofs: [
        {
          camelCaseName: 'result',
          fields: [
            {
              name: 'success',
              camelCaseName: 'success',
              number: 1,
              serializerMethod: 'writeString',
              deserializerMethod: 'readString'
            },
            {
              name: 'error',
              camelCaseName: 'error',
              number: 2,
              serializerMethod: 'writeInt32',
              deserializerMethod: 'readInt32'
            }
          ]
        }
      ]
    };
    
    const result = templateEngine.render('message-serialization', context);
    console.log('Rendered template:', result);
    
    expect(result).toContain("if (message.result === 'success')");
    expect(result).toContain("writer.writeString(1, message.success)");
  });
});