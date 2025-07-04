import { Plugin } from 'vite';
import { transformSync } from '@swc/core';
import path from 'path';
import fs from 'fs';

interface HallowPluginOptions {
  enabled?: boolean;
}

export function hallowPlugin(options: HallowPluginOptions = {}): Plugin {
  const { enabled = true } = options;

  return {
    name: 'vite-plugin-hallow',
    enforce: 'pre',
    
    transform(code: string, id: string) {
      if (!enabled) return null;
      
      // Only process .ts and .tsx files
      if (!/\.(ts|tsx)$/.test(id)) return null;
      
      // Check if the file contains .proto imports
      const protoImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+\.proto)['"]/g;
      
      if (!protoImportRegex.test(code)) return null;
      
      console.log(`🔄 Hallow Plugin: Processing ${id}`);
      
      try {
        // Transform the code using SWC with our plugin
        const result = transformSync(code, {
          filename: id,
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: id.endsWith('.tsx'),
              decorators: true,
            },
            target: 'es2020',
            experimental: {
              plugins: [
                // For now, we'll do a simple string replacement
                // Later this will be replaced with the actual SWC plugin
              ],
            },
          },
          module: {
            type: 'es6',
          },
        });

        // Manual transformation for now (will be replaced by SWC plugin)
        let transformedCode = code;
        
        // Replace .proto imports with generated stub classes
        transformedCode = transformedCode.replace(
          protoImportRegex,
          (match, imports, protoPath) => {
            const absoluteProtoPath = path.resolve(path.dirname(id), protoPath);
            
            // Generate stub class based on proto file
            const stubClass = generateStubClass(imports.trim(), absoluteProtoPath);
            
            return `
// Generated from ${protoPath}
import { Client } from "@hallow/grpc-web";

${stubClass}`;
          }
        );

        console.log(`✅ Hallow Plugin: Transformed ${id}`);
        return {
          code: transformedCode,
          map: null, // TODO: Generate source map
        };
      } catch (error) {
        console.error(`❌ Hallow Plugin: Error transforming ${id}:`, error);
        return null;
      }
    },
  };
}

function generateStubClass(importName: string, protoPath: string): string {
  try {
    // Read and parse the .proto file
    if (!fs.existsSync(protoPath)) {
      console.warn(`⚠️ Proto file not found: ${protoPath}`);
      return generatePlaceholderClass(importName);
    }

    const protoContent = fs.readFileSync(protoPath, 'utf-8');
    const serviceInfo = parseProtoFile(protoContent);
    
    if (!serviceInfo) {
      console.warn(`⚠️ No service found in proto file: ${protoPath}`);
      return generatePlaceholderClass(importName);
    }

    return generateActualStubClass(importName, serviceInfo);
  } catch (error) {
    console.error(`❌ Error generating stub class:`, error);
    return generatePlaceholderClass(importName);
  }
}

function parseProtoFile(content: string) {
  // Simple regex-based parsing (matches our Rust implementation)
  const serviceRegex = /service\s+(\w+)\s*\{([^}]+)\}/g;
  const methodRegex = /rpc\s+(\w+)\s*\(\s*(stream\s+)?(\w+)\s*\)\s*returns\s*\(\s*(stream\s+)?(\w+)\s*\)/g;
  
  const serviceMatch = serviceRegex.exec(content);
  if (!serviceMatch) return null;
  
  const serviceName = serviceMatch[1];
  const serviceBody = serviceMatch[2];
  
  const methods = [];
  let methodMatch;
  while ((methodMatch = methodRegex.exec(serviceBody)) !== null) {
    methods.push({
      name: methodMatch[1],
      clientStreaming: !!methodMatch[2],
      inputType: methodMatch[3],
      serverStreaming: !!methodMatch[4],
      outputType: methodMatch[5],
    });
  }
  
  return { serviceName, methods };
}

function generateActualStubClass(className: string, serviceInfo: any): string {
  const { serviceName, methods } = serviceInfo;
  
  const methodImpls = methods.map((method: any) => {
    const methodName = camelCase(method.name);
    const isStreaming = method.clientStreaming || method.serverStreaming;
    
    if (isStreaming) {
      return `
  ${methodName}(request?: any) {
    return this.client.stream('/${serviceName}/${method.name}', request);
  }`;
    } else {
      return `
  async ${methodName}(request?: any): Promise<any> {
    return await this.client.invokeSimple('/${serviceName}/${method.name}', request);
  }`;
    }
  }).join('');

  const hookMethods = methods.map((method: any) => {
    const methodName = camelCase(method.name);
    const hookName = `use${method.name}`;
    return `      ${hookName}: (params?: any) => this.${methodName}(params)`;
  }).join(',\n');

  return `
class ${className} {
  constructor(private client: Client) {}
${methodImpls}

  createHooks() {
    return {
${hookMethods}
    };
  }
}`;
}

function generatePlaceholderClass(className: string): string {
  return `
class ${className} {
  constructor(private client: Client) {}
  
  // Placeholder methods - proto file parsing failed
  async exampleMethod(request?: any): Promise<any> {
    console.warn('${className}: Proto file parsing failed, using placeholder');
    return await this.client.invokeSimple('/PlaceholderService/ExampleMethod', request);
  }
  
  createHooks() {
    return {
      useExampleMethod: (params?: any) => this.exampleMethod(params)
    };
  }
}`;
}

function camelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}