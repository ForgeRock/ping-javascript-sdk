# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, GitHub Copilot, Gemini, etc.) when working with code in this repository. It follows the open AGENTS.md convention.

> **Note:** CLAUDE.md, GEMINI.md, and `.github/copilot-instructions.md` in this repository are redirects to AGENTS.md. Edit AGENTS.md only.

## Development Commands

```sh
# Install dependencies
pnpm install --frozen-lockfile

# Full repo checks (affected projects only)
pnpm build
pnpm lint
pnpm test
pnpm test:e2e

# CI-parity (build + lint + test + e2e on affected)
pnpm exec nx affected -t build lint test e2e-ci

# Build all publishable packages
pnpm nx run-many -t build --no-agents

# Package-scoped commands (preferred for focused work)
pnpm --filter @forgerock/davinci-client build
pnpm --filter @forgerock/davinci-client lint
pnpm --filter @forgerock/davinci-client test

# Single test file
pnpm --filter @forgerock/davinci-client test -- --run src/lib/<file>.test.ts

# Single e2e suite
pnpm nx e2e <suite-project>

# Keep TS project references in sync
pnpm nx sync:check
```

## Architecture Overview

### Module Structure

The SDK is an **Nx + pnpm monorepo** with a strictly unidirectional dependency hierarchy. Higher layers may depend on lower layers — never the reverse. Enforced via Nx module boundary rules in `eslint.config.mjs`.

**Types layer** (`scope:sdk-types`):

- `@forgerock/sdk-types` — shared TypeScript contracts used across all packages

**Utilities / Effects layer** (`scope:sdk-utilities`, `scope:sdk-effects`):

- `@forgerock/sdk-utilities` — pure, stateless helpers shared across packages
- `packages/sdk-effects/logger` — structured logging
- `packages/sdk-effects/oidc` — OIDC session effects
- `packages/sdk-effects/storage` — storage abstraction
- `packages/sdk-effects/sdk-request-middleware` — request pipeline middleware
- `packages/sdk-effects/iframe-manager` — iframe lifecycle management

**Product client layer** (`scope:package`):

- `@forgerock/oidc-client` — OIDC/OAuth2 authentication
- `@forgerock/journey-client` — PingAM/ForgeRock Journey orchestration
- `@forgerock/davinci-client` — PingOne DaVinci flow orchestration
- `@forgerock/device-client` — device binding and attestation
- `@forgerock/protect` — Ping Protect fraud detection integration

### Key Directory Structure

```
packages/
├── sdk-types/               # Shared TypeScript types (no runtime code)
├── sdk-utilities/           # Pure helper functions
├── sdk-effects/
│   ├── logger/
│   ├── oidc/
│   ├── storage/
│   ├── sdk-request-middleware/
│   └── iframe-manager/
├── davinci-client/src/lib/
│   ├── client.store.ts      # Public client facade (factory function)
│   ├── davinci.api.ts       # Network layer (RTK Query)
│   ├── client.store.effects.ts  # Side-effect orchestration
│   ├── node.reducer.ts      # Redux state transitions
│   ├── node.slice.ts        # Redux slice
│   ├── davinci.utils.ts     # Pure helpers
│   └── davinci.types.ts     # Type contracts
├── oidc-client/
├── journey-client/
├── device-client/
└── protect/

e2e/
├── davinci-suites/          # Playwright e2e for DaVinci flows
├── journey-suites/          # Playwright e2e for Journey flows
├── oidc-suites/             # Playwright e2e for OIDC flows
├── protect-suites/
├── am-mock-api/             # Mock AM server for journey e2e
└── mock-api-v2/             # Mock API v2
```

### Internal File Conventions

Architecture is encoded in file names — this is a constraint mechanism, not cosmetic:

| File suffix                   | Responsibility                                                              |
| ----------------------------- | --------------------------------------------------------------------------- |
| `store.ts`                    | Public client facade and network orchestration entrypoint                   |
| `*.api.ts`                    | Network/request boundary (RTK Query, middleware, error handling)            |
| `*.effects.ts`                | Single isolated side-effect — non-network async, storage, logging           |
| `*.micros.ts`                 | Side-effectful workflows — multi-step async orchestration, polling, retries |
| `*.utils.ts`                  | Pure helpers and transformations — no side-effects, no state                |
| `*.reducer.ts` / `*.slice.ts` | Redux state transitions and mapping                                         |
| `*.types.ts`                  | Type contracts — no runtime code                                            |

**Key rules:**

- Never put effectful logic in `*.utils.ts` — utils must be pure and stateless; side-effects belong in `*.effects.ts` (single isolated effect) or `*.micros.ts` (multi-step workflow)
- `*.types.ts` files have no runtime code — `type` and `interface` only, no `enum`
- Client packages are initialized via factory functions, never classes or singletons

## Development Notes

### Key Conventions

- **pnpm only.** `preinstall` enforces with `only-allow pnpm`.
- Workspace dependency versions are centralized via **pnpm catalogs** in `pnpm-workspace.yaml`.
- Releases are Changesets-driven (`pnpm ci:version`, `pnpm ci:release`), published from `main`.
- PRs target `main`, pass `pnpm run lint/build/test`, and use Conventional Commit style.

### Branch Strategy

- `main`: production branch, all releases published from here
- Feature branches target `main` via PR

### CI/CD

- GitHub Actions runs `pnpm exec nx affected -t build lint test e2e-ci` on PR/push
- E2E suites are Playwright projects — they start workspace apps via `pnpm nx serve` and, for journey flows, also start `am-mock-api`
- Releases are automated via Changesets on merge to `main`
