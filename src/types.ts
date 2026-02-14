/**
 * Core types for dependency health scanning.
 */

/** A parsed dependency from a manifest file. */
export interface Dependency {
  readonly name: string;
  readonly currentVersion: string;
  readonly type: 'production' | 'development';
}

/** Version check result for a dependency. */
export interface VersionCheck {
  readonly name: string;
  readonly current: string;
  readonly latest: string | undefined;
  readonly outdated: boolean;
  readonly majorsBehind: number;
}

/** Known vulnerability (CVE) for a dependency. */
export interface Vulnerability {
  readonly name: string;
  readonly cveId: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly description: string;
  readonly affectedVersions: string;
  readonly fixedIn: string | undefined;
}

/** License classification for a dependency. */
export interface LicenseCheck {
  readonly name: string;
  readonly license: string;
  readonly category: 'permissive' | 'copyleft' | 'proprietary' | 'unknown';
  readonly compatible: boolean;
}

/** Overall health score for a dependency. */
export interface DependencyHealth {
  readonly dependency: Dependency;
  readonly version: VersionCheck;
  readonly vulnerabilities: readonly Vulnerability[];
  readonly license: LicenseCheck;
  readonly healthScore: number; // 0-100
}

/** Complete scan result. */
export interface ScanResult {
  readonly project: string;
  readonly scannedAt: string;
  readonly totalDeps: number;
  readonly dependencies: readonly DependencyHealth[];
  readonly summary: ScanSummary;
}

/** Summary statistics. */
export interface ScanSummary {
  readonly healthScore: number;
  readonly outdatedCount: number;
  readonly vulnerableCount: number;
  readonly criticalVulns: number;
  readonly incompatibleLicenses: number;
  readonly recommendations: readonly string[];
}

/** Scan configuration. */
export interface ScanOptions {
  readonly manifestPath: string;
  readonly advisoryDb: readonly Vulnerability[];
  readonly licensePolicy: 'permissive-only' | 'allow-copyleft' | 'any';
}
