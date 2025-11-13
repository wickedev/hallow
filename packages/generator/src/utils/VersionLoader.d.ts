/**
 * VersionLoader - Utility for loading version information from package.json
 *
 * This module provides functionality to automatically load the generator version
 * from the package.json file, with proper error handling for missing or invalid files.
 */
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
 * Load version from package.json file
 *
 * @param options - Version loader options
 * @returns The version string from package.json
 * @throws {Error} If package.json is missing, invalid, or doesn't contain a version field
 */
export declare function loadVersion(options?: VersionLoaderOptions): string;
/**
 * Clear the cached version (useful for testing)
 */
export declare function clearVersionCache(): void;
/**
 * Get version with additional metadata
 *
 * @param options - Version loader options
 * @returns Version information object with version string and metadata
 */
export declare function getVersionInfo(options?: VersionLoaderOptions): {
    version: string;
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
    build?: string;
};
//# sourceMappingURL=VersionLoader.d.ts.map