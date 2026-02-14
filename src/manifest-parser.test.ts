import { describe, it, expect } from 'vitest';
import { parseManifestString } from './manifest-parser.js';

describe('parseManifestString', () => {
  it('extracts production dependencies', () => {
    const { dependencies } = parseManifestString(JSON.stringify({
      name: 'test',
      dependencies: { lodash: '^4.17.21', express: '~4.18.0' },
    }));

    expect(dependencies).toHaveLength(2);
    expect(dependencies[0]?.name).toBe('lodash');
    expect(dependencies[0]?.currentVersion).toBe('4.17.21'); // ^ stripped
    expect(dependencies[0]?.type).toBe('production');
    expect(dependencies[1]?.currentVersion).toBe('4.18.0'); // ~ stripped
  });

  it('extracts dev dependencies', () => {
    const { dependencies } = parseManifestString(JSON.stringify({
      name: 'test',
      devDependencies: { vitest: '^3.2.0' },
    }));

    expect(dependencies).toHaveLength(1);
    expect(dependencies[0]?.type).toBe('development');
  });

  it('handles missing fields', () => {
    const { projectName, dependencies } = parseManifestString('{}');
    expect(projectName).toBe('unknown');
    expect(dependencies).toHaveLength(0);
  });

  it('strips range prefixes', () => {
    const { dependencies } = parseManifestString(JSON.stringify({
      dependencies: {
        a: '>=1.0.0',
        b: '<2.0.0',
        c: '1.0.0',
      },
    }));

    expect(dependencies[0]?.currentVersion).toBe('1.0.0');
    expect(dependencies[1]?.currentVersion).toBe('2.0.0');
    expect(dependencies[2]?.currentVersion).toBe('1.0.0');
  });
});
