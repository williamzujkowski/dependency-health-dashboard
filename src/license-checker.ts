/**
 * License compatibility checker.
 *
 * Classifies licenses and checks compatibility with project policy.
 */

import type { LicenseCheck } from './types.js';

/** Known permissive licenses. */
const PERMISSIVE = new Set([
  'MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0',
  '0BSD', 'Unlicense', 'CC0-1.0', 'Zlib',
]);

/** Known copyleft licenses. */
const COPYLEFT = new Set([
  'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0',
  'AGPL-3.0', 'MPL-2.0', 'EUPL-1.2', 'CC-BY-SA-4.0',
]);

/** Fixture license database. */
const LICENSE_DB: Record<string, string> = {
  lodash: 'MIT',
  axios: 'MIT',
  express: 'MIT',
  react: 'MIT',
  typescript: 'Apache-2.0',
  webpack: 'MIT',
  eslint: 'MIT',
  prettier: 'MIT',
  vitest: 'MIT',
  jsonwebtoken: 'MIT',
  minimist: 'MIT',
  chalk: 'MIT',
  commander: 'MIT',
  zod: 'MIT',
  'date-fns': 'MIT',
  moment: 'MIT',
  '@types/node': 'MIT',
  tsx: 'MIT',
};

/**
 * Check license for a dependency.
 */
export function checkLicense(
  name: string,
  policy: 'permissive-only' | 'allow-copyleft' | 'any'
): LicenseCheck {
  const license = LICENSE_DB[name] ?? 'UNKNOWN';
  const category = classifyLicense(license);

  let compatible: boolean;
  switch (policy) {
    case 'permissive-only':
      compatible = category === 'permissive';
      break;
    case 'allow-copyleft':
      compatible = category === 'permissive' || category === 'copyleft';
      break;
    case 'any':
      compatible = true;
      break;
  }

  return { name, license, category, compatible };
}

/** Classify a license string. */
function classifyLicense(
  license: string
): 'permissive' | 'copyleft' | 'proprietary' | 'unknown' {
  if (PERMISSIVE.has(license)) return 'permissive';
  if (COPYLEFT.has(license)) return 'copyleft';
  if (license === 'UNKNOWN') return 'unknown';
  return 'proprietary';
}
