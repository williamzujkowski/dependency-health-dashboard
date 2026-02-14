/**
 * Manifest file parser.
 *
 * Parses package.json to extract dependency information.
 */

import { readFileSync } from 'node:fs';
import type { Dependency } from './types.js';

/** Raw package.json shape (relevant fields only). */
interface PackageJson {
  readonly name?: string;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
}

/**
 * Parse a package.json file and extract dependencies.
 *
 * @param manifestPath - Path to package.json
 * @returns Tuple of [projectName, dependencies]
 */
export function parseManifest(
  manifestPath: string
): { projectName: string; dependencies: readonly Dependency[] } {
  const raw = readFileSync(manifestPath, 'utf-8');
  const pkg = JSON.parse(raw) as PackageJson;

  const deps: Dependency[] = [];

  if (pkg.dependencies !== undefined) {
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      deps.push({ name, currentVersion: cleanVersion(version), type: 'production' });
    }
  }

  if (pkg.devDependencies !== undefined) {
    for (const [name, version] of Object.entries(pkg.devDependencies)) {
      deps.push({ name, currentVersion: cleanVersion(version), type: 'development' });
    }
  }

  return {
    projectName: pkg.name ?? 'unknown',
    dependencies: deps,
  };
}

/**
 * Parse a package.json string directly (for testing).
 */
export function parseManifestString(
  content: string
): { projectName: string; dependencies: readonly Dependency[] } {
  const pkg = JSON.parse(content) as PackageJson;
  const deps: Dependency[] = [];

  if (pkg.dependencies !== undefined) {
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      deps.push({ name, currentVersion: cleanVersion(version), type: 'production' });
    }
  }

  if (pkg.devDependencies !== undefined) {
    for (const [name, version] of Object.entries(pkg.devDependencies)) {
      deps.push({ name, currentVersion: cleanVersion(version), type: 'development' });
    }
  }

  return {
    projectName: pkg.name ?? 'unknown',
    dependencies: deps,
  };
}

/** Strip semver range prefix (^, ~, >=, etc). */
function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]+/, '');
}
