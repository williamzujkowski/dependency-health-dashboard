#!/usr/bin/env node
/**
 * dep-health CLI entry point.
 */

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { scanDependencies } from './scanner.js';
import { formatMarkdown, formatJson, formatText } from './formatter.js';
import { FIXTURE_ADVISORIES } from './advisory-db.js';
import type { ScanOptions } from './types.js';

function main(): void {
  const { values } = parseArgs({
    options: {
      manifest: { type: 'string', short: 'm', default: 'package.json' },
      format: { type: 'string', short: 'f', default: 'text' },
      policy: { type: 'string', short: 'p', default: 'permissive-only' },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
  });

  if (values.help === true) {
    printHelp();
    process.exit(0);
  }

  const validFormats = new Set(['markdown', 'json', 'text']);
  const format = values.format as string;
  if (!validFormats.has(format)) {
    process.stderr.write(`Error: Invalid format "${format}"\n`);
    process.exit(1);
  }

  const validPolicies = new Set(['permissive-only', 'allow-copyleft', 'any']);
  const policy = values.policy as string;
  if (!validPolicies.has(policy)) {
    process.stderr.write(`Error: Invalid policy "${policy}"\n`);
    process.exit(1);
  }

  const options: ScanOptions = {
    manifestPath: resolve(values.manifest as string),
    advisoryDb: FIXTURE_ADVISORIES,
    licensePolicy: policy as ScanOptions['licensePolicy'],
  };

  const result = scanDependencies(options);

  let output: string;
  switch (format) {
    case 'markdown': output = formatMarkdown(result); break;
    case 'json': output = formatJson(result); break;
    default: output = formatText(result); break;
  }

  process.stdout.write(output + '\n');

  // Exit with non-zero if critical vulnerabilities found
  if (result.summary.criticalVulns > 0) {
    process.exit(2);
  }
}

function printHelp(): void {
  process.stdout.write(`
dep-health — Scan dependencies for security and health issues

Usage:
  dep-health [options]

Options:
  -m, --manifest <path>  Path to package.json (default: ./package.json)
  -f, --format <fmt>     Output: markdown, json, text (default: text)
  -p, --policy <pol>     License policy: permissive-only, allow-copyleft, any
  -h, --help             Show this help

Examples:
  dep-health                                    # Scan current project
  dep-health -m /path/to/package.json          # Scan specific manifest
  dep-health --format markdown --policy any    # Markdown report, any license
`);
}

main();
