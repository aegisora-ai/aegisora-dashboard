# Aegisora Dashboard

The web dashboard for Aegisora runtime security and governance.

## Requirements

- Node.js 22 or newer
- npm
- Git

## Quick start

```bash
git clone https://github.com/aegisora-ai/aegisora-dashboard.git
cd aegisora-dashboard
npm ci
npm run dev
```

Open the local URL printed by Next.js.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e:smoke
```

Some authentication and database tests require a dedicated test environment.
Never use production credentials or customer data for development tests.

## Contributing

Small, focused contributions are welcome: bug reproductions, documentation,
accessibility, dashboard UX improvements, and tests.

1. Check the existing issues.
2. Create a feature branch.
3. Include reproduction steps and relevant test results.
4. Open a pull request with a clear summary.
5. Never commit credentials or customer data.

Core runtime: https://github.com/aegisora-ai/aegisora

Examples: https://github.com/aegisora-ai/aegisora-examples

Community: https://discord.gg/8CM3PpQRT5
