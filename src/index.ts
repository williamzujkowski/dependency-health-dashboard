/**
 * dependency-health-dashboard — Scan project dependencies for health issues.
 *
 * @module dependency-health-dashboard
 */

export type {
  Dependency,
  VersionCheck,
  Vulnerability,
  LicenseCheck,
  DependencyHealth,
  ScanResult,
  ScanSummary,
  ScanOptions,
} from './types.js';

export { parseManifest, parseManifestString } from './manifest-parser.js';
export { findVulnerabilities, compareVersions, FIXTURE_ADVISORIES } from './advisory-db.js';
export { checkLicense } from './license-checker.js';
export { scanDependencies, scanFromString } from './scanner.js';
export { formatMarkdown, formatJson, formatText } from './formatter.js';
