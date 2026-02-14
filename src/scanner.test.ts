import { describe, it, expect } from 'vitest';
import { scanFromString } from './scanner.js';
import { FIXTURE_ADVISORIES } from './advisory-db.js';

/** Fixture manifest with known vulnerable/outdated deps. */
const VULNERABLE_MANIFEST = JSON.stringify({
  name: 'test-project',
  dependencies: {
    lodash: '^4.17.20',       // outdated + CVE-2021-23337 (high)
    jsonwebtoken: '^8.5.1',   // outdated + CVE-2022-23529 (critical)
    express: '^4.18.0',       // outdated + CVE-2024-29041 (medium)
  },
  devDependencies: {
    typescript: '^5.9.3',     // up to date, MIT
    vitest: '^3.2.4',         // up to date, MIT
  },
});

/** Clean manifest with no issues. */
const CLEAN_MANIFEST = JSON.stringify({
  name: 'clean-project',
  dependencies: {
    zod: '^3.22.0',
    chalk: '^5.3.0',
  },
});

describe('scanFromString', () => {
  it('detects vulnerable dependencies', () => {
    const result = scanFromString(VULNERABLE_MANIFEST, {
      advisoryDb: FIXTURE_ADVISORIES,
      licensePolicy: 'permissive-only',
    });

    expect(result.project).toBe('test-project');
    expect(result.totalDeps).toBe(5);
    expect(result.summary.vulnerableCount).toBeGreaterThan(0);
    expect(result.summary.criticalVulns).toBeGreaterThan(0);
  });

  it('identifies outdated packages', () => {
    const result = scanFromString(VULNERABLE_MANIFEST, {
      advisoryDb: FIXTURE_ADVISORIES,
      licensePolicy: 'permissive-only',
    });

    expect(result.summary.outdatedCount).toBeGreaterThan(0);
    const lodash = result.dependencies.find(
      (d) => d.dependency.name === 'lodash'
    );
    expect(lodash?.version.outdated).toBe(true);
  });

  it('reports clean project with high score', () => {
    const result = scanFromString(CLEAN_MANIFEST, {
      advisoryDb: FIXTURE_ADVISORIES,
      licensePolicy: 'permissive-only',
    });

    expect(result.summary.vulnerableCount).toBe(0);
    expect(result.summary.criticalVulns).toBe(0);
    expect(result.summary.healthScore).toBeGreaterThanOrEqual(90);
  });

  it('generates recommendations for vulnerable deps', () => {
    const result = scanFromString(VULNERABLE_MANIFEST, {
      advisoryDb: FIXTURE_ADVISORIES,
      licensePolicy: 'permissive-only',
    });

    expect(result.summary.recommendations.length).toBeGreaterThan(0);
    const hasUrgent = result.summary.recommendations.some(
      (r) => r.includes('URGENT')
    );
    expect(hasUrgent).toBe(true);
  });

  it('computes per-dependency health scores', () => {
    const result = scanFromString(VULNERABLE_MANIFEST, {
      advisoryDb: FIXTURE_ADVISORIES,
      licensePolicy: 'permissive-only',
    });

    const jwt = result.dependencies.find(
      (d) => d.dependency.name === 'jsonwebtoken'
    );
    // Critical CVE + outdated = very low score
    expect(jwt?.healthScore).toBeLessThan(50);

    const ts = result.dependencies.find(
      (d) => d.dependency.name === 'typescript'
    );
    // Up to date, no CVEs, MIT = perfect score
    expect(ts?.healthScore).toBe(100);
  });
});
