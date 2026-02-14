/**
 * Output formatters for dependency health reports.
 */

import type { ScanResult, DependencyHealth } from './types.js';

/**
 * Format scan result as markdown.
 */
export function formatMarkdown(result: ScanResult): string {
  const lines: string[] = [];
  lines.push(`# Dependency Health Report: ${result.project}\n`);
  lines.push(`**Scanned:** ${result.scannedAt}`);
  lines.push(`**Total Dependencies:** ${String(result.totalDeps)}`);
  lines.push(`**Health Score:** ${String(result.summary.healthScore)}/100\n`);

  // Summary
  lines.push('## Summary\n');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Outdated | ${String(result.summary.outdatedCount)} |`);
  lines.push(`| Vulnerable | ${String(result.summary.vulnerableCount)} |`);
  lines.push(`| Critical CVEs | ${String(result.summary.criticalVulns)} |`);
  lines.push(`| License Issues | ${String(result.summary.incompatibleLicenses)} |`);
  lines.push('');

  // Recommendations
  if (result.summary.recommendations.length > 0) {
    lines.push('## Recommendations\n');
    for (const rec of result.summary.recommendations) {
      lines.push(`- ${rec}`);
    }
    lines.push('');
  }

  // Dependencies with issues
  const withIssues = result.dependencies.filter((d) => d.healthScore < 100);
  if (withIssues.length > 0) {
    lines.push('## Dependencies with Issues\n');
    for (const dep of withIssues) {
      lines.push(formatDepMarkdown(dep));
    }
  }

  return lines.join('\n');
}

function formatDepMarkdown(dep: DependencyHealth): string {
  const lines: string[] = [];
  const icon = dep.healthScore >= 70 ? '🟡' : '🔴';
  lines.push(`### ${icon} ${dep.dependency.name} (score: ${String(dep.healthScore)}/100)\n`);

  if (dep.version.outdated) {
    lines.push(`- **Outdated:** ${dep.version.current} → ${dep.version.latest ?? 'unknown'}`);
  }

  for (const v of dep.vulnerabilities) {
    lines.push(`- **${v.severity.toUpperCase()}** ${v.cveId}: ${v.description}`);
  }

  if (!dep.license.compatible) {
    lines.push(`- **License:** ${dep.license.license} (${dep.license.category}) — not compatible with policy`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format scan result as JSON.
 */
export function formatJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Format scan result as terminal text.
 */
export function formatText(result: ScanResult): string {
  const lines: string[] = [];
  lines.push(`Dependency Health: ${result.project}`);
  lines.push('='.repeat(50));
  lines.push(`Score: ${String(result.summary.healthScore)}/100  |  Deps: ${String(result.totalDeps)}  |  Vulnerable: ${String(result.summary.vulnerableCount)}  |  Outdated: ${String(result.summary.outdatedCount)}`);
  lines.push('');

  for (const rec of result.summary.recommendations) {
    lines.push(`  ! ${rec}`);
  }

  const withIssues = result.dependencies.filter((d) => d.healthScore < 100);
  if (withIssues.length > 0) {
    lines.push('\nIssues:');
    for (const dep of withIssues) {
      lines.push(`  ${dep.dependency.name} [${String(dep.healthScore)}/100]`);
      if (dep.version.outdated) {
        lines.push(`    outdated: ${dep.version.current} -> ${dep.version.latest ?? '?'}`);
      }
      for (const v of dep.vulnerabilities) {
        lines.push(`    ${v.severity}: ${v.cveId} — ${v.description}`);
      }
    }
  }

  return lines.join('\n');
}
