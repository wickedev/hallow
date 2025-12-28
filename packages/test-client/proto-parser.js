/**
 * Simplified Proto Parser
 * Converts raw .proto file content into ProtoFile AST structure
 * that matches the generator's expected format
 */

/**
 * Parse a proto file and return a ProtoFile AST
 * @param {string} content - Raw proto file content
 * @param {string} fileName - Name of the proto file
 * @returns {ProtoFile} Parsed proto file AST
 */
function parseProtoFile(content, fileName) {
  const protoFile = {
    fileName,
    package: '',
    syntax: 'proto3',
    imports: [],
    services: [],
    messages: [],
    enums: [],
    options: {}
  };

  // Extract package name
  const packageMatch = content.match(/package\s+([^;]+);/);
  if (packageMatch) {
    protoFile.package = packageMatch[1].trim();
  }

  // Extract syntax
  const syntaxMatch = content.match(/syntax\s*=\s*"([^"]+)";/);
  if (syntaxMatch) {
    protoFile.syntax = syntaxMatch[1];
  }

  // Extract imports
  const importRegex = /import\s+"([^"]+)";/g;
  let importMatch;
  while ((importMatch = importRegex.exec(content)) !== null) {
    protoFile.imports.push(importMatch[1]);
  }

  // Extract service definitions
  protoFile.services = parseServices(content);

  // Extract message definitions
  protoFile.messages = parseMessages(content);

  // Extract enum definitions
  protoFile.enums = parseEnums(content);

  return protoFile;
}

/**
 * Parse service definitions from proto content
 */
function parseServices(content) {
  const services = [];
  const serviceRegex = /service\s+(\w+)\s*\{([^}]+)\}/g;
  let serviceMatch;

  while ((serviceMatch = serviceRegex.exec(content)) !== null) {
    const serviceName = serviceMatch[1];
    const serviceBody = serviceMatch[2];

    const service = {
      name: serviceName,
      methods: parseMethods(serviceBody),
      options: {}
    };

    services.push(service);
  }

  return services;
}

/**
 * Parse RPC methods from service body
 */
function parseMethods(serviceBody) {
  const methods = [];
  const methodRegex = /rpc\s+(\w+)\s*\(([^)]+)\)\s+returns\s+\(([^)]+)\)/g;
  let methodMatch;

  while ((methodMatch = methodRegex.exec(serviceBody)) !== null) {
    const methodName = methodMatch[1];
    const inputDef = methodMatch[2].trim();
    const outputDef = methodMatch[3].trim();

    const method = {
      name: methodName,
      inputType: inputDef.replace(/stream\s+/, ''),
      outputType: outputDef.replace(/stream\s+/, ''),
      clientStreaming: inputDef.includes('stream'),
      serverStreaming: outputDef.includes('stream'),
      options: {}
    };

    methods.push(method);
  }

  return methods;
}

/**
 * Parse message definitions from proto content
 */
function parseMessages(content) {
  const messages = [];
  const messageRegex = /message\s+(\w+)\s*\{/g;
  let messageMatch;

  while ((messageMatch = messageRegex.exec(content)) !== null) {
    const messageName = messageMatch[1];
    const openBraceIndex = messageMatch.index + messageMatch[0].length - 1;

    const [messageBody, endIndex] = extractBalancedBody(content, openBraceIndex);

    if (messageBody !== null) {
      const message = {
        name: messageName,
        fields: parseFields(messageBody),
        nestedMessages: [], // TODO: Handle nested messages
        nestedEnums: [],    // TODO: Handle nested enums
        oneofs: parseOneofs(messageBody),
        options: {}
      };

      messages.push(message);
      messageRegex.lastIndex = endIndex;
    }
  }

  return messages;
}

/**
 * Parse field definitions from message body
 */
function parseFields(messageBody) {
  const fields = [];
  const fieldRegex = /(repeated\s+)?(\w+)\s+(\w+)\s*=\s*(\d+);/g;
  let fieldMatch;

  while ((fieldMatch = fieldRegex.exec(messageBody)) !== null) {
    const repeated = !!fieldMatch[1];
    const typeName = fieldMatch[2];
    const fieldName = fieldMatch[3];
    const fieldNumber = parseInt(fieldMatch[4]);

    const field = {
      name: fieldName,
      number: fieldNumber,
      type: typeName,
      repeated: repeated,
      optional: false,
      map: false,
      options: {}
    };

    fields.push(field);
  }

  return fields;
}

/**
 * Parse enum definitions from proto content
 */
function parseEnums(content) {
  const enums = [];
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g;
  let enumMatch;

  while ((enumMatch = enumRegex.exec(content)) !== null) {
    const enumName = enumMatch[1];
    const enumBody = enumMatch[2];

    const enumDef = {
      name: enumName,
      values: parseEnumValues(enumBody),
      options: {}
    };

    enums.push(enumDef);
  }

  return enums;
}

/**
 * Parse enum value definitions from enum body
 */
function parseEnumValues(enumBody) {
  const values = [];
  const valueRegex = /(\w+)\s*=\s*(\d+);/g;
  let valueMatch;

  while ((valueMatch = valueRegex.exec(enumBody)) !== null) {
    const valueName = valueMatch[1];
    const valueNumber = parseInt(valueMatch[2]);

    const value = {
      name: valueName,
      number: valueNumber,
      options: {}
    };

    values.push(value);
  }

  return values;
}

module.exports = {
  parseProtoFile
};

/**
 * Parse oneof definitions from message body
 */
function parseOneofs(messageBody) {
  const oneofs = [];
  const oneofRegex = /oneof\s+(\w+)\s*\{/g;
  let oneofMatch;

  while ((oneofMatch = oneofRegex.exec(messageBody)) !== null) {
    const oneofName = oneofMatch[1];
    const openBraceIndex = oneofMatch.index + oneofMatch[0].length - 1;

    const [oneofBody, endIndex] = extractBalancedBody(messageBody, openBraceIndex);

    if (oneofBody !== null) {
      const oneof = {
        name: oneofName,
        fields: parseFields(oneofBody)
      };

      oneofs.push(oneof);
      oneofRegex.lastIndex = endIndex;
    }
  }

  return oneofs;
}

/**
 * Helper to extract content inside balanced braces
 * @param {string} content - Full content
 * @param {number} startIndex - Index of the opening brace
 * @returns {[string|null, number]} - [extracted content, end index]
 */
function extractBalancedBody(content, startIndex) {
  let depth = 1;
  let i = startIndex + 1;

  while (i < content.length && depth > 0) {
    if (content[i] === '{') {
      depth++;
    } else if (content[i] === '}') {
      depth--;
    }
    i++;
  }

  if (depth === 0) {
    return [content.substring(startIndex + 1, i - 1), i];
  }

  return [null, i];
}
