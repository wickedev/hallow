/**
 * Proto file path resolution module.
 *
 * This module provides the ProtoResolver class which handles resolving proto import paths
 * to absolute file system paths. It implements a multi-step resolution strategy that searches
 * for proto files in multiple locations following a defined priority order.
 *
 * Resolution Strategy:
 * 1. Check if path is a well-known type (google/protobuf/*)
 * 2. Try relative resolution from importing file directory
 * 3. Try absolute resolution from project root
 * 4. Try resolution from protoRoot
 * 5. Try resolution from importPaths in order
 * 6. Try resolution from node_modules
 *
 * Security:
 * - Validates all paths to prevent directory traversal attacks
 * - Normalizes paths before validation
 * - Rejects paths containing '..' after normalization
 *
 * @packageDocumentation
 */

import * as path from 'path';
import * as fs from 'fs';
import { ResolverOptions, ResolvedProto } from './types';

/**
 * ProtoResolver handles proto file path resolution with security validation.
 *
 * This class implements the proto import resolution strategy defined in the design document.
 * It provides methods for resolving proto imports, validating paths for security, and
 * determining search paths for proto files.
 *
 * @example
 * ```typescript
 * const resolver = new ProtoResolver({
 *   protoRoot: '/project/protos',
 *   importPaths: ['/project/vendor/protos'],
 *   projectRoot: '/project'
 * });
 *
 * const searchPaths = resolver.getSearchPaths('/project/src/service.proto');
 * // Returns: [
 * //   '/project/src',
 * //   '/project',
 * //   '/project/protos',
 * //   '/project/vendor/protos',
 * //   '/project/node_modules'
 * // ]
 * ```
 */
export class ProtoResolver {
  private readonly protoRoot: string;
  private readonly importPaths: string[];
  private readonly projectRoot: string;

  /**
   * Creates a new ProtoResolver instance.
   *
   * @param options - Resolution configuration options
   * @param options.protoRoot - Root directory for proto file resolution
   * @param options.importPaths - Additional directories to search for proto imports
   * @param options.projectRoot - Project root directory
   *
   * @example
   * ```typescript
   * const resolver = new ProtoResolver({
   *   protoRoot: '/project/protos',
   *   importPaths: ['/shared/protos', '/vendor/protos'],
   *   projectRoot: '/project'
   * });
   * ```
   */
  constructor(options: ResolverOptions) {
    this.protoRoot = path.resolve(options.protoRoot);
    this.importPaths = options.importPaths.map((p) => path.resolve(p));
    this.projectRoot = path.resolve(options.projectRoot);
  }

  /**
   * Gets ordered list of search paths for proto import resolution.
   *
   * Returns search paths in priority order for resolving proto imports.
   * The search order is:
   * 1. Directory of the importing file (for relative imports)
   * 2. Project root directory
   * 3. Proto root directory
   * 4. Additional import paths (in configured order)
   * 5. node_modules directory
   *
   * This method is used internally by the resolver to determine where to look
   * for proto files during import resolution.
   *
   * @param fromFile - Absolute path to the file that is importing
   * @returns Array of absolute directory paths to search, in priority order
   *
   * @example
   * ```typescript
   * const paths = resolver.getSearchPaths('/project/src/api/service.proto');
   * // Returns: [
   * //   '/project/src/api',      // Directory of importing file
   * //   '/project',              // Project root
   * //   '/project/protos',       // Proto root
   * //   '/shared/protos',        // Additional import paths
   * //   '/vendor/protos',
   * //   '/project/node_modules'  // node_modules
   * // ]
   * ```
   */
  getSearchPaths(fromFile: string): string[] {
    const searchPaths: string[] = [];

    // 1. Directory of the importing file (for relative imports)
    const fromDir = path.dirname(fromFile);
    searchPaths.push(fromDir);

    // 2. Project root directory
    if (this.projectRoot !== fromDir) {
      searchPaths.push(this.projectRoot);
    }

    // 3. Proto root directory (if different from project root)
    if (this.protoRoot !== this.projectRoot && this.protoRoot !== fromDir) {
      searchPaths.push(this.protoRoot);
    }

    // 4. Additional import paths (in configured order)
    for (const importPath of this.importPaths) {
      if (!searchPaths.includes(importPath)) {
        searchPaths.push(importPath);
      }
    }

    // 5. node_modules directory
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    if (!searchPaths.includes(nodeModulesPath)) {
      searchPaths.push(nodeModulesPath);
    }

    return searchPaths;
  }

  /**
   * Validates a file path for security to prevent directory traversal attacks.
   *
   * This method performs security validation on file paths to prevent malicious
   * path traversal attacks (e.g., using '..' to access files outside allowed directories).
   *
   * Validation rules:
   * - Path must not contain '..' after normalization
   * - Path must not attempt to escape the project root (for relative paths)
   * - Windows absolute paths (C:\) are allowed but validated
   * - Unix absolute paths (/) are allowed but validated
   *
   * @param filePath - Path to validate (can be relative or absolute)
   * @returns true if path is valid and safe, false otherwise
   *
   * @example
   * ```typescript
   * resolver.validatePath('./service.proto');        // true - safe relative path
   * resolver.validatePath('../../../etc/passwd');    // false - traversal attempt
   * resolver.validatePath('/project/protos/api.proto'); // true - safe absolute path
   * resolver.validatePath('../../outside/file.proto'); // false - escapes project root
   * ```
   *
   * @remarks
   * This method is critical for security. It prevents attackers from using proto imports
   * to read arbitrary files from the file system.
   */
  validatePath(filePath: string): boolean {
    // Normalize the path to resolve any '..' or '.' segments
    const normalizedPath = path.normalize(filePath);

    // Check if normalized path still contains '..' which would indicate traversal
    if (normalizedPath.includes('..')) {
      return false;
    }

    // For relative paths, ensure they don't escape the project root
    if (!path.isAbsolute(filePath)) {
      const resolvedPath = path.resolve(this.projectRoot, filePath);
      const relativeToProjRoot = path.relative(this.projectRoot, resolvedPath);

      // If relative path starts with '..', it's trying to escape project root
      if (relativeToProjRoot.startsWith('..')) {
        return false;
      }
    }

    // Path is valid
    return true;
  }

  /**
   * Resolves a proto import path to an absolute file system path.
   *
   * Implements a 7-step resolution strategy:
   * 1. Check if path is a well-known type (google/protobuf/*)
   * 2. Try relative resolution from importing file directory
   * 3. Try absolute resolution from project root
   * 4. Try resolution from protoRoot
   * 5. Try resolution from importPaths in order
   * 6. Try resolution from node_modules
   * 7. Throw resolution error with searched paths
   *
   * @param importPath - Proto import path to resolve (e.g., "service.proto", "common/types.proto")
   * @param fromFile - Absolute path to the file that contains this import
   * @returns Resolved proto file information
   * @throws Error if the import cannot be resolved or path validation fails
   *
   * @example
   * ```typescript
   * // Relative import
   * const resolved = resolver.resolve('./types.proto', '/project/src/service.proto');
   * // Returns: { absolutePath: '/project/src/types.proto', originalImport: './types.proto', isWellKnown: false }
   *
   * // Well-known type
   * const timestamp = resolver.resolve('google/protobuf/timestamp.proto', '/project/service.proto');
   * // Returns: { absolutePath: '/project/node_modules/google-protobuf/...', originalImport: 'google/protobuf/timestamp.proto', isWellKnown: true }
   * ```
   */
  resolve(importPath: string, fromFile: string): ResolvedProto {
    // Step 0: Validate the import path for security
    if (!this.validatePath(importPath)) {
      throw new Error(
        `[Hallow Plugin] Path validation failed\n` +
          `Invalid import path: ${importPath}\n` +
          `Reason: Path contains directory traversal attempt`
      );
    }

    // Step 1: Check if path is a well-known type (google/protobuf/*)
    if (importPath.startsWith('google/protobuf/')) {
      return this.resolveWellKnownType(importPath);
    }

    // Get all search paths in priority order
    const searchPaths = this.getSearchPaths(fromFile);

    // Track all paths we searched for error reporting
    const searchedPaths: string[] = [];

    // Step 2-6: Try resolving from each search path
    for (const searchPath of searchPaths) {
      const candidatePath = path.resolve(searchPath, importPath);
      searchedPaths.push(candidatePath);

      // Check if file exists
      if (fs.existsSync(candidatePath)) {
        // Check if it's a file (not a directory)
        const stats = fs.statSync(candidatePath);
        if (stats.isFile()) {
          // Determine if this was resolved from node_modules
          const isFromNodeModules = candidatePath.includes('node_modules');
          const packagePath = isFromNodeModules
            ? this.extractPackagePath(candidatePath)
            : undefined;

          return {
            absolutePath: candidatePath,
            originalImport: importPath,
            isWellKnown: false,
            packagePath,
          };
        }
      }
    }

    // Step 7: Throw resolution error with all searched paths
    throw new Error(
      `[Hallow Plugin] Import resolution failed\n` +
        `File: ${fromFile}\n` +
        `Cannot resolve import: "${importPath}"\n` +
        `Searched in:\n${searchedPaths.map((p) => `  - ${p}`).join('\n')}\n\n` +
        `Suggestion: Check if the file exists and the path is correct.`
    );
  }

  /**
   * Resolves a well-known proto type to its TypeScript equivalent.
   *
   * Well-known types are standard protobuf types provided by google-protobuf package.
   * These include: Timestamp, Duration, Any, Empty, Struct, Value, etc.
   *
   * This method resolves these types from the google-protobuf package in node_modules.
   *
   * @param typePath - Path to well-known type (e.g., "google/protobuf/timestamp.proto")
   * @returns Resolved proto file information with well-known type metadata
   * @throws Error if the well-known type cannot be found in google-protobuf package
   *
   * @example
   * ```typescript
   * const timestamp = resolver.resolveWellKnownType('google/protobuf/timestamp.proto');
   * // Returns: {
   * //   absolutePath: '/project/node_modules/google-protobuf/google/protobuf/timestamp.proto',
   * //   originalImport: 'google/protobuf/timestamp.proto',
   * //   isWellKnown: true,
   * //   packagePath: 'google-protobuf'
   * // }
   * ```
   */
  resolveWellKnownType(typePath: string): ResolvedProto {
    // Well-known types should be resolved from google-protobuf package
    const googleProtobufPath = path.join(
      this.projectRoot,
      'node_modules',
      'google-protobuf'
    );

    // Try to find the well-known type in google-protobuf package
    const candidatePath = path.join(googleProtobufPath, typePath);

    if (fs.existsSync(candidatePath)) {
      const stats = fs.statSync(candidatePath);
      if (stats.isFile()) {
        return {
          absolutePath: candidatePath,
          originalImport: typePath,
          isWellKnown: true,
          packagePath: 'google-protobuf',
        };
      }
    }

    // If not found in google-protobuf, throw error
    throw new Error(
      `[Hallow Plugin] Well-known type resolution failed\n` +
        `Cannot resolve well-known type: "${typePath}"\n` +
        `Searched in: ${candidatePath}\n\n` +
        `Suggestion: Install google-protobuf package: npm install google-protobuf`
    );
  }

  /**
   * Extracts the package name from a path resolved from node_modules.
   *
   * This helper method extracts the npm package name from an absolute path
   * that points to a file within node_modules.
   *
   * @param absolutePath - Absolute path to a file in node_modules
   * @returns Package name (e.g., "google-protobuf", "@grpc/proto-loader")
   *
   * @example
   * ```typescript
   * extractPackagePath('/project/node_modules/google-protobuf/google/protobuf/timestamp.proto');
   * // Returns: 'google-protobuf'
   *
   * extractPackagePath('/project/node_modules/@grpc/proto-loader/index.js');
   * // Returns: '@grpc/proto-loader'
   * ```
   *
   * @private
   */
  private extractPackagePath(absolutePath: string): string | undefined {
    const nodeModulesIndex = absolutePath.indexOf('node_modules');
    if (nodeModulesIndex === -1) {
      return undefined;
    }

    // Get the part after node_modules/
    const afterNodeModules = absolutePath.substring(
      nodeModulesIndex + 'node_modules/'.length
    );

    // Handle scoped packages (e.g., @grpc/proto-loader)
    if (afterNodeModules.startsWith('@')) {
      const parts = afterNodeModules.split(path.sep);
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
    }

    // Handle regular packages
    const parts = afterNodeModules.split(path.sep);
    return parts[0];
  }
}
