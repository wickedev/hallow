/**
 * Parser wrapper for protobuf3 files
 *
 * Provides a high-level API for parsing .proto files into a ProtoFile AST.
 * Uses ANTLR4TS under the hood for lexing and parsing.
 *
 * @packageDocumentation
 */

import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { Protobuf3Lexer } from './generated/grammar/Protobuf3Lexer';
import { Protobuf3Parser, ProtoContext } from './generated/grammar/Protobuf3Parser';
import { ProtoFileBuilder } from './ProtoFileBuilder';
import { ProtoFile } from './types';

/**
 * Parse error with location information
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
    public readonly filePath?: string
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Main Parser class for protobuf3 files
 *
 * @example
 * ```typescript
 * const parser = new Parser();
 * const ast = parser.parse(protoContent, 'service.proto');
 * ```
 */
export class Parser {
  /**
   * Parse a proto file content into a ProtoFile AST
   *
   * @param content - Proto file content as string
   * @param filePath - Path to the proto file (for error reporting)
   * @returns Parsed ProtoFile AST
   * @throws ParseError if parsing fails
   */
  parse(content: string, filePath: string): ProtoFile {
    try {
      // Create character stream from content
      const inputStream = CharStreams.fromString(content);

      // Create lexer
      const lexer = new Protobuf3Lexer(inputStream);

      // Create token stream
      const tokenStream = new CommonTokenStream(lexer);

      // Create parser
      const parser = new Protobuf3Parser(tokenStream);

      // Remove default error listeners
      parser.removeErrorListeners();

      // Add custom error listener
      parser.addErrorListener({
        syntaxError: (recognizer, offendingSymbol, line, charPositionInLine, msg) => {
          throw new ParseError(msg, line, charPositionInLine + 1, filePath);
        },
      });

      // Parse the proto file
      const parseTree: ProtoContext = parser.proto();

      // Build ProtoFile AST from parse tree
      const builder = new ProtoFileBuilder(filePath);
      const protoFile = builder.build(parseTree);

      return protoFile;
    } catch (error) {
      if (error instanceof ParseError) {
        throw error;
      }

      // Wrap other errors
      throw new ParseError(
        `Failed to parse proto file: ${error instanceof Error ? error.message : String(error)}`,
        0,
        0,
        filePath
      );
    }
  }
}
