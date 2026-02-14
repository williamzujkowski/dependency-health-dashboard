import { describe, it, expect } from 'vitest';
import { findVulnerabilities, compareVersions, FIXTURE_ADVISORIES } from './advisory-db.js';

describe('compareVersions', () => {
  it('compares major versions', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
    expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });

  it('compares minor versions', () => {
    expect(compareVersions('1.2.0', '1.3.0')).toBe(-1);
    expect(compareVersions('1.3.0', '1.2.0')).toBe(1);
  });

  it('compares patch versions', () => {
    expect(compareVersions('1.0.1', '1.0.2')).toBe(-1);
    expect(compareVersions('4.17.20', '4.17.21')).toBe(-1);
  });
});

describe('findVulnerabilities', () => {
  it('finds lodash vulnerability for old version', () => {
    const vulns = findVulnerabilities('lodash', '4.17.20', FIXTURE_ADVISORIES);
    expect(vulns).toHaveLength(1);
    expect(vulns[0]?.cveId).toBe('CVE-2021-23337');
  });

  it('returns empty for fixed version', () => {
    const vulns = findVulnerabilities('lodash', '4.17.21', FIXTURE_ADVISORIES);
    expect(vulns).toHaveLength(0);
  });

  it('finds critical jsonwebtoken CVE', () => {
    const vulns = findVulnerabilities('jsonwebtoken', '8.5.1', FIXTURE_ADVISORIES);
    expect(vulns).toHaveLength(1);
    expect(vulns[0]?.severity).toBe('critical');
  });

  it('returns empty for unknown package', () => {
    const vulns = findVulnerabilities('unknown-pkg', '1.0.0', FIXTURE_ADVISORIES);
    expect(vulns).toHaveLength(0);
  });
});
