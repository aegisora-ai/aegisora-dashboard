# Aegisora

Runtime security and governance for AI agents. Every agent action is evaluated against workspace policy (ALLOW / BLOCK / ESCALATE), recorded in a tamper-evident evidence chain, and gated by human approval where required.

- API: `POST /api/v1/evaluate`
- Stack: Next.js, React, TypeScript, Supabase (Postgres, Auth)
- Deployment: see [DEPLOY.md](DEPLOY.md)
- Security reporting: see [SECURITY.md](SECURITY.md)
- Enterprise documents: [docs/enterprise](docs/enterprise)

## Development
```bash
npm install
cp .env.example .env.local   # fill in your own Supabase project
npm run dev
npm run typecheck
```