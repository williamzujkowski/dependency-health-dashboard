/**
 * Advisory database — fixture CVE data for testing.
 *
 * In production, this would fetch from npm audit / GitHub Advisory DB.
 * For E2E testing, we use a static fixture database.
 */

import type { Vulnerability } from './types.js';

/**
 * Fixture advisory database with known test vulnerabilities.
 *
 * These are realistic but synthetic entries for testing.
 */
export const FIXTURE_ADVISORIES: readonly Vulnerability[] = [
  {
    name: 'lodash',
    cveId: 'CVE-2021-23337',
    severity: 'high',
    description: 'Command injection via template function',
    affectedVersions: '<4.17.21',
    fixedIn: '4.17.21',
  },
  {
    name: 'axios',
    cveId: 'CVE-2023-45857',
    severity: 'medium',
    description: 'SSRF via URL parsing',
    affectedVersions: '<1.6.0',
    fixedIn: '1.6.0',
  },
  {
    name: 'express',
    cveId: 'CVE-2024-29041',
    severity: 'medium',
    description: 'Open redirect in res.location',
    affectedVersions: '<4.19.2',
    fixedIn: '4.19.2',
  },
  {
    name: 'jsonwebtoken',
    cveId: 'CVE-2022-23529',
    severity: 'critical',
    description: 'Improper token validation allows forgery',
    affectedVersions: '<9.0.0',
    fixedIn: '9.0.0',
  },
  {
    name: 'minimist',
    cveId: 'CVE-2021-44906',
    severity: 'critical',
    description: 'Prototype pollution via constructor',
    affectedVersions: '<1.2.6',
    fixedIn: '1.2.6',
  },
];

/**
 * Look up vulnerabilities for a dependency name and version.
 */
export function findVulnerabilities(
  name: string,
  version: string,
  db: readonly Vulnerability[] = FIXTURE_ADVISORIES
): readonly Vulnerability[] {
  return db.filter((v) => {
    if (v.name !== name) return false;
    // Simple version comparison: check if current version is below fixedIn
    if (v.fixedIn === undefined) return true;
    return compareVersions(version, v.fixedIn) < 0;
  });
}

/**
 * Simple semver comparison.
 * Returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const va = partsA[i] ?? 0;
    const vb = partsB[i] ?? 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}
