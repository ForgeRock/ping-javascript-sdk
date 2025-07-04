# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Ping JavaScript SDK - a monorepo containing multiple packages for web applications integrating with the Ping platform. The SDK provides APIs for user authentication, device management, and accessing Ping-secured resources.

## Development Commands

### Core Commands

- `pnpm build` - Build all affected packages
- `pnpm test` - Run tests for all affected packages
- `pnpm lint` - Lint all affected packages
- `pnpm format` - Format code using Prettier
- `pnpm nx typecheck` - Run TypeScript type checking

### Package Management

- `pnpm create-package` - Generate a new library package using Nx
- `pnpm nx serve <package-name>` - Serve a specific package in development
- `pnpm nx test <package-name> --watch` - Run tests for a specific package in watch mode

### E2E Testing

- `pnpm test:e2e` - Run end-to-end tests for affected packages
- Individual e2e apps are in `e2e/` directory with their own test suites

## Architecture

### Monorepo Structure

The repository uses **Nx** as the monorepo tool with the following structure:

```
packages/
├── davinci-client/          # DaVinci flow orchestration client
├── device-client/           # Device management (binding, profiles, WebAuthn)
├── oidc-client/            # OpenID Connect authentication client
├── protect/                # Ping Protect fraud detection
├── sdk-effects/            # Effect-based utilities (logger, storage, etc.)
│   ├── iframe-manager/
│   ├── logger/
│   ├── oidc/
│   ├── sdk-request-middleware/
│   └── storage/
├── sdk-types/              # Shared TypeScript types
└── sdk-utilities/          # Common utilities (PKCE, URL handling)
```

### Key Packages

- **davinci-client**: State management for DaVinci authentication flows using Redux Toolkit
- **oidc-client**: OIDC authentication with token management and storage
- **device-client**: Device binding, profiles, OATH, Push, and WebAuthn capabilities
- **protect**: Fraud detection and risk assessment integration
- **sdk-effects**: Effect-based architecture packages for common functionalities

### Technology Stack

- **Package Manager**: pnpm with workspace configuration
- **Build Tool**: Vite for building and bundling
- **Testing**: Vitest for unit tests, Playwright for e2e tests
- **State Management**: Redux Toolkit (in davinci-client)
- **TypeScript**: Strict typing with composite project configuration
- **Linting**: ESLint with Prettier integration

### Nx Configuration

- Uses target defaults for build, test, lint, and typecheck
- Caching enabled for build and test targets
- Workspace layout configured for packages and e2e apps
- Parallel execution limited to 1 for consistency

### Package Dependencies

Packages use workspace references (`workspace:*`) for internal dependencies and catalog references (`catalog:`) for shared external dependencies like `@reduxjs/toolkit`.

### Testing Strategy

- Unit tests: Vitest with coverage reporting
- E2E tests: Playwright with dedicated test apps in `e2e/` directory
- Mock API server available in `e2e/mock-api-v2/` for testing

## Development Notes

- All packages are built as ES modules with TypeScript declarations
- Use `pnpm nx affected` commands to run tasks only on changed packages
- The repository uses conventional commits and automated releases via changesets
- Individual packages can be tested independently using their specific build/test scripts
