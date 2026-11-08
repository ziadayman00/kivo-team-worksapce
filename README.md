# KIVO — Team Operating System

KIVO is a unified workspace engineered to connect work management and team collaboration into a single, cohesive operating environment.

## Monorepo Layout

- `apps/api`: NestJS Modular Monolith backend.
- `apps/web`: React 19 + TypeScript + Vite responsive web application.
- `packages/api-client`: Typed API client generated from the backend OpenAPI 3.x contract.
- `packages/tsconfig`: Shared base compiler configurations.

## Prerequisites

- **Node.js**: `>=24.0.0 LTS`
- **pnpm**: `>=10.0.0`
- **PostgreSQL**: Native PostgreSQL 17 installation (or 16+)

## Getting Started

```bash
# Install dependencies across all workspaces
pnpm install

# Run type checking
pnpm typecheck

# Run test suites
pnpm test

# Run development servers
pnpm dev

# Build all applications
pnpm build
```
