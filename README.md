# dependency-health-dashboard

Scan project dependencies for CVEs, outdated versions, and license issues. A standalone utility built as part of the [nexus-agents](https://github.com/williamzujkowski/nexus-agents) E2E test ecosystem.

## Quick start

```bash
pnpm install
pnpm test        # Run unit tests
pnpm typecheck   # TypeScript strict check
pnpm build       # Compile to dist/
```

## Usage

```typescript
import { scanDependencies } from 'dependency-health-dashboard';

const result = scanDependencies({
  packageJsonPath: './package.json',
});

console.log(result);
```

## License

MIT
