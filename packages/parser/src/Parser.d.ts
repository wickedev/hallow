/**
 * Parser wrapper for protobuf3 files
 *
 * Provides a high-level API for parsing .proto files into a ProtoFile AST.
 * Uses ANTLR4TS under the hood for lexing and parsing.
 *
 * @packageDocumentation
 */
import { ProtoFile } from './types';
/**
 * Parse error with location information
 */
export declare class ParseError extends Error {
    readonly line: number;
    readonly column: number;
    readonly filePath?: string | undefined;
    constructor(message: string, line: number, column: number, filePath?: string | undefined);
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
export declare class Parser {
    /**
     * Parse a proto file content into a ProtoFile AST
     *
     * @param content - Proto file content as string
     * @param filePath - Path to the proto file (for error reporting)
     * @returns Parsed ProtoFile AST
     * @throws ParseError if parsing fails
     */
    parse(content: string, filePath: string): ProtoFile;
}
//# sourceMappingURL=Parser.d.ts.map