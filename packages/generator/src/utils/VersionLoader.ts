/**
 * VersionLoader - Utility for loading version information from package.json
 *
 * This module provides functionality to automatically load the generator version
 * from the package.json file, with proper error handling for missing or invalid files.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Package.json structure with required version field
 */
interface PackageJson {
  version: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Options for version loading
 */
export interface VersionLoaderOptions {
  /**
   * Path to package.json file (defaults to generator package.json)
   */
  packageJsonPath?: string;

  /**
   * Whether to cache the loaded version
   */
  cache?: boolean;
}

/**
 * Cached version to avoid repeated file reads
 */
let cachedVersion: string | null = null;

/**
 * Load version from package.json file
 *
 * @param options - Version loader options
 * @returns The version string from package.json
 * @throws {Error} If package.json is missing, invalid, or doesn't contain a version field
 */
export function loadVersion(options: VersionLoaderOptions = {}): string {
  // Return cached version if available and caching is enabled
  if (options.cache !== false && cachedVersion) {
    return cachedVersion;
  }

  // Determine package.json path
  // Note: When bundled, __dirname points to dist/ so we need ../package.json
  const packageJsonPath =
    options.packageJsonPath || path.join(__dirname, '../package.json');

  // Check if file exists
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(
      `Version loading failed: package.json not found at ${packageJsonPath}. ` +
        `Please ensure the package.json file exists in the expected location.`,
    );
  }

  // Read and parse package.json
  let packageJson: PackageJson;
  try {
    const fileContent = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(fileContent) as PackageJson;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Version loading failed: Unable to read or parse package.json at ${packageJsonPath}. ` +
        `Error: ${errorMessage}`,
    );
  }

  // Validate version field exists
  if (!packageJson.version) {
    throw new Error(
      `Version loading failed: package.json at ${packageJsonPath} does not contain a "version" field. ` +
        `Please ensure package.json has a valid semver version.`,
    );
  }

  // Validate version format (basic semver check)
  if (!isValidSemver(packageJson.version)) {
    throw new Error(
      `Version loading failed: Invalid version format "${packageJson.version}" in package.json. ` +
        `Expected valid semver format (e.g., "1.0.0", "0.1.0-beta", "2.1.3-alpha.1").`,
    );
  }

  // Cache the version
  cachedVersion = packageJson.version;

  return packageJson.version;
}

/**
 * Check if a string is a valid semver version
 *
 * @param version - Version string to validate
 * @returns True if the version is valid semver format
 */
function isValidSemver(version: string): boolean {
  // Basic semver regex pattern
  // Matches: major.minor.patch with optional pre-release and build metadata
  // Examples: 1.0.0, 0.1.0, 1.2.3-beta, 2.0.0-alpha.1, 1.0.0+build.123
  const semverPattern =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  return semverPattern.test(version);
}

/**
 * Clear the cached version (useful for testing)
 */
export function clearVersionCache(): void {
  cachedVersion = null;
}

/**
 * Get version with additional metadata
 *
 * @param options - Version loader options
 * @returns Version information object with version string and metadata
 */
export function getVersionInfo(options: VersionLoaderOptions = {}): {
  version: string;
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
} {
  const version = loadVersion(options);

  // Parse semver components
  const match = version.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/,
  );

  if (!match) {
    throw new Error(`Failed to parse version: ${version}`);
  }

  return {
    version,
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
    build: match[5],
  };
}
