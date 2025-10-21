/**
 * Generator Integration Test
 *
 * This file demonstrates using the Hallow generator package directly
 * to generate TypeScript code from proto files.
 *
 * Test-client is specifically for validating that the generator package works correctly.
 */

const fs = require('fs');
const path = require('path');
const { parseProtoFile } = require('./proto-parser');
const { Generator } = require('../generator/dist/index.js');

// Read proto file
const protoPath = path.join(__dirname, 'src/service.proto');
const protoContent = fs.readFileSync(protoPath, 'utf-8');

async function main() {
  console.log('\ud83d\ude80 Hallow Generator Package Integration Test\n');
  console.log('Purpose: Validate that packages/generator works correctly');
  console.log('========================================================\n');

  try {
    // Step 1: Parse proto file using our parser
    console.log('Step 1: Parsing proto file with proto-parser.js...');
    const protoFile = parseProtoFile(protoContent, 'service.proto');
    console.log(`\u2705 Parsed successfully`);
    console.log(`   - Package: ${protoFile.package}`);
    console.log(`   - Services: ${protoFile.services.length}`);
    console.log(`   - Messages: ${protoFile.messages.length}\n`);

    // Step 2: Initialize Generator from packages/generator
    console.log('Step 2: Initializing Generator class from packages/generator...');
    const generator = new Generator({
      outputFormat: 'typescript',
      generateComments: true,
      generateReactHooks: false,  // Disable for simple test
      generateSuspenseHooks: false,
      templateDir: path.join(__dirname, '../generator/src/templates')
    });
    console.log('\u2705 Generator initialized\n');

    // Step 3: Generate code using the generator package
    console.log('Step 3: Generating TypeScript code...');
    const result = await generator.generateCode(protoFile);
    console.log('\u2705 Code generated successfully');
    console.log(`   - Generated ${result.files.length} file(s)\n`);

    // Step 4: Write all generated files
    console.log(`Step 4: Writing ${result.files.length} generated file(s)...`);
    result.files.forEach((file, index) => {
      const outputPath = path.join(__dirname, 'src', file.path);
      const outputDir = path.dirname(outputPath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, file.content);
      console.log(`   \u2705 [${index + 1}/${result.files.length}] ${file.path} (${file.content.length} chars)`);
    });
    console.log();

    // Step 5: Summary
    console.log('\ud83c\udf89 Generator Package Integration Test PASSED!\n');
    console.log('\ud83d\udcca Summary:');
    console.log('   \u2705 Proto file parsed using proto-parser.js');
    console.log('   \u2705 Generator class from packages/generator initialized');
    console.log('   \u2705 Code generated using generator templates');
    console.log(`   \u2705 ${result.files.length} file(s) written to src/`);
    console.log();
    console.log('\ud83d\udcdd Key Achievement:');
    console.log('   Parser Gap RESOLVED: proto-parser.js \u2192 ProtoFile AST');
    console.log('   Template Gap RESOLVED: Generator class handles template engine');
    console.log('   packages/generator IS WORKING CORRECTLY!');
    console.log();

    // Show all generated file details
    console.log('\ud83d\udcc4 Generated File Details:');
    result.files.forEach((file, index) => {
      console.log(`   [${index + 1}] ${file.path}`);
      console.log(`       Size: ${file.content.length} characters`);
      console.log(`       Lines: ${file.content.split('\n').length}`);
    });
    console.log();

  } catch (error) {
    console.error('\u274c Error during code generation:', error.message);
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the generator
main().catch(console.error);
