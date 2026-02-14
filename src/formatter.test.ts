import { describe, it, expect } from 'vitest';
import { formatMarkdown, formatJson, formatText } from './formatter.js';
import { scanFromString } from './scanner.js';
import { FIXTURE_ADVISORIES } from './advisory-db.js';

const MANIFEST = JSON.stringify({
  name: 'test-project',
  dependencies: {
    lodash: '^4.17.20',
    jsonwebtoken: '^8.5.1',
  },
});

function getResult() {
  return scanFromString(MANIFEST, {
    advisoryDb: FIXTURE_ADVISORIES,
    licensePolicy: 'permissive-only',
  });
}

describe('formatMarkdown', () => {
  it('includes project name and score', () => {
    const md = formatMarkdown(getResult());
    expect(md).toContain('test-project');
    expect(md).toContain('Health Score:');
  });

  it('includes vulnerability details', () => {
    const md = formatMarkdown(getResult());
    expect(md).toContain('CVE-');
  });
});

describe('formatJson', () => {
  it('produces valid JSON', () => {
    const json = formatJson(getResult());
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed['project']).toBe('test-project');
    expect(parsed['totalDeps']).toBe(2);
  });
});

describe('formatText', () => {
  it('shows summary line', () => {
    const text = formatText(getResult());
    expect(text).toContain('Dependency Health:');
    expect(text).toContain('Score:');
  });
});
