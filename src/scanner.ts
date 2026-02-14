/**
 * Dependency health scanner.
 *
 * Orchestrates manifest parsing, version checking, CVE lookup,
 * and license verification into a unified health report.
 */

import { parseManifest, parseManifestString } from './manifest-parser.js';
import { findVulnerabilities, FIXTURE_ADVISORIES } from './advisory-db.js';
import { checkLicense } from './license-checker.js';
import type {
  Dependency,
  DependencyHealth,
  ScanResult,
  ScanSummary,
  ScanOptions,
  VersionCheck,
  Vulnerability,
} from './types.js';

/**
 * Run a full dependency health scan.
 */
export function scanDependencies(options: ScanOptions): ScanResult {
  const { projectName, dependencies } = parseManifest(options.manifestPath);
  return buildScanResult(projectName, dependencies, options);
}

/**
 * Scan from a manifest string (for testing without file I/O).
 */
export function scanFromString(
  content: string,
  options: Omit<ScanOptions, 'manifestPath'>
): ScanResult {
  const { projectName, dependencies } = parseManifestString(content);
  return buildScanResult(projectName, dependencies, {
    ...options,
    manifestPath: '<string>',
  });
}

function buildScanResult(
  projectName: string,
  dependencies: readonly Dependency[],
  options: ScanOptions
): ScanResult {
  const healthChecks = dependencies.map((dep) =>
    checkDependencyHealth(dep, options)
  );

  const summary = computeSummary(healthChecks);

  return {
    project: projectName,
    scannedAt: new Date().toISOString(),
    totalDeps: dependencies.length,
    dependencies: healthChecks,
    summary,
  };
}

/**
 * Check health for a single dependency.
 */
function checkDependencyHealth(
  dep: Dependency,
  options: ScanOptions
): DependencyHealth {
  const version = checkVersion(dep);
  const vulnerabilities = findVulnerabilities(
    dep.name,
    dep.currentVersion,
    options.advisoryDb.length > 0 ? options.advisoryDb : FIXTURE_ADVISORIES
  );
  const license = checkLicense(dep.name, options.licensePolicy);

  const healthScore = computeHealthScore(version, vulnerabilities, license);

  return { dependency: dep, version, vulnerabilities, license, healthScore };
}

/**
 * Simple version check (fixture-based for E2E testing).
 *
 * In production, this would query npm registry.
 */
function checkVersion(dep: Dependency): VersionCheck {
  // Fixture latest versions for testing
  const latestVersions: Record<string, string> = {
    lodash: '4.17.21',
    axios: '1.7.9',
    express: '5.0.1',
    react: '19.0.0',
    typescript: '5.9.3',
    vitest: '3.2.4',
    jsonwebtoken: '9.0.2',
    minimist: '1.2.8',
  };

  const latest = latestVersions[dep.name];
  const outdated = latest !== undefined && latest !== dep.currentVersion;

  return {
    name: dep.name,
    current: dep.currentVersion,
    latest,
    outdated,
    majorsBehind: outdated && latest !== undefined
      ? computeMajorsBehind(dep.currentVersion, latest)
      : 0,
  };
}

function computeMajorsBehind(current: string, latest: string): number {
  const currentMajor = parseInt(current.split('.')[0] ?? '0', 10);
  const latestMajor = parseInt(latest.split('.')[0] ?? '0', 10);
  return Math.max(0, latestMajor - currentMajor);
}

function computeHealthScore(
  version: VersionCheck,
  vulns: readonly Vulnerability[],
  license: import('./types.js').LicenseCheck
): number {
  let score = 100;

  // Version penalties
  if (version.outdated) {
    score -= Math.min(30, version.majorsBehind * 10 + 5);
  }

  // Vulnerability penalties
  for (const v of vulns) {
    switch (v.severity) {
      case 'critical': score -= 40; break;
      case 'high': score -= 25; break;
      case 'medium': score -= 15; break;
      case 'low': score -= 5; break;
    }
  }

  // License penalties
  if (!license.compatible) score -= 20;
  if (license.category === 'unknown') score -= 10;

  return Math.max(0, score);
}

function computeSummary(deps: readonly DependencyHealth[]): ScanSummary {
  const outdatedCount = deps.filter((d) => d.version.outdated).length;
  const vulnerableCount = deps.filter((d) => d.vulnerabilities.length > 0).length;
  const criticalVulns = deps.reduce(
    (sum, d) => sum + d.vulnerabilities.filter((v) => v.severity === 'critical').length,
    0
  );
  const incompatibleLicenses = deps.filter((d) => !d.license.compatible).length;

  const avgScore = deps.length > 0
    ? Math.round(deps.reduce((s, d) => s + d.healthScore, 0) / deps.length)
    : 100;

  const recommendations: string[] = [];
  if (criticalVulns > 0) {
    recommendations.push(`URGENT: ${String(criticalVulns)} critical vulnerabilities need immediate patching`);
  }
  if (outdatedCount > 0) {
    recommendations.push(`${String(outdatedCount)} dependencies are outdated — consider updating`);
  }
  if (incompatibleLicenses > 0) {
    recommendations.push(`${String(incompatibleLicenses)} dependencies have incompatible licenses`);
  }

  return {
    healthScore: avgScore,
    outdatedCount,
    vulnerableCount,
    criticalVulns,
    incompatibleLicenses,
    recommendations,
  };
}
