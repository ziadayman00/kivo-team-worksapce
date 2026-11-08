# KIVO — Team Operating System

> **A unified workspace connecting work planning, contextual team collaboration, and organization governance into a single, cohesive operating environment.**

[![CI](https://github.com/ziadayman00/kivo-team-worksapce/actions/workflows/ci.yml/badge.svg)](https://github.com/ziadayman00/kivo-team-worksapce/actions/workflows/ci.yml)
[![Node.js 24 LTS](https://img.shields.io/badge/Node.js-24%20LTS-brightgreen.svg)](https://nodejs.org/)
[![pnpm 10](https://img.shields.io/badge/pnpm-10.5.2-orange.svg)](https://pnpm.io/)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-blue.svg)](https://www.postgresql.org/)

---

## 1. Product Overview

KIVO brings together the core activities required to run a high-performing engineering and product team:

- **Work Planning & Tracking:** Projects, work items, hierarchies, and predictable delivery statuses.
- **Contextual Collaboration:** Channels, threads, contextual discussions attached directly to work items.
- **Team Governance:** Multi-tenant workspaces, membership, roles (Owner, Admin, Member), and tenant isolation.
- **Activity & Real-Time Intelligence:** Activity audit trails, real-time notification streams via Server-Sent Events (SSE).
- **Unified Workspace Experience:** Personal view vs. shared workspace views with strict tenant isolation.

---

## 2. System Architecture & Topology

KIVO is built as a **Modular Monolith** backend and a **React SPA** frontend organized within a strict **pnpm monorepo**:

```
kivo/
├── apps/
│   ├── api/                 # NestJS 11 Modular Monolith backend
│   │   ├── src/
│   │   │   ├── config/      # Zod-validated environment schema
│   │   │   ├── database/    # Drizzle ORM schema, connection pool & migrations
│   │   │   └── modules/     # 8 Isolated domain modules
│   │   │       ├── identity/
│   │   │       ├── workspace/
│   │   │       ├── authorization/
│   │   │       ├── work-management/
│   │   │       ├── collaboration/
│   │   │       ├── activity/
│   │   │       ├── notification/
│   │   │       └── search/
│   │   └── test/            # Unit, e2e, and real PostgreSQL integration tests
│   │
│   └── web/                 # React 19 + TypeScript + Vite 6 frontend
│       ├── src/
│       │   ├── components/  # Reusable UI primitives (Tailwind CSS / Radix)
│       │   └── test/        # Vitest & Testing Library configuration
│       └── vite.config.ts   # Vite dev server with proxy to API
│
├── packages/
│   ├── api-client/          # OpenAPI-generated type-safe contract client
│   └── tsconfig/            # Shared, strict TypeScript compiler configurations
│
├── e2e/                     # Playwright end-to-end smoke test suite
├── docs/                    # Architecture documentation & ADR index
│   └── architecture/
│       ├── module-map.md    # Domain module ownership & boundary map
│       └── adr-index.md     # Architectural Decision Records index
│
├── scripts/                 # Architecture boundary test harness & tools
├── test/                    # Multi-tenant fixtures & boundary violation test suites
├── .dependency-cruiser.js   # Automated architecture boundary rules
├── eslint.config.mjs        # ESLint 9 Flat Config
└── .prettierrc              # Prettier code formatting rules
```

### Core Architecture Invariants (ADR-001 through ADR-013)

- **Modular Monolith Boundaries:** Backend modules communicate solely via public interfaces (`index.ts` / `public.ts` / `<module>.module.ts`). Cross-module access into internal directories (`persistence`, `internal`, private services) is strictly forbidden and verified via `dependency-cruiser`.
- **Tenant Isolation:** Every multi-tenant database record includes `workspace_id`. Cross-workspace data leakage is strictly prevented at the data access layer.
- **Asynchronous Decoupling:** Cross-module asynchronous workflows use the PostgreSQL Transactional Outbox pattern (`FOR UPDATE SKIP LOCKED`).
- **Real-Time Delivery:** Server-Sent Events (SSE) deliver real-time notifications with guaranteed HTTP/2 multiplexing and automatic reconnection.

---

## 3. Technology Stack

| Layer                    | Technology                          | Rationale                                                           |
| :----------------------- | :---------------------------------- | :------------------------------------------------------------------ |
| **Runtime**              | **Node.js 24 LTS**                  | Supported Long-Term Support runtime (Node 20 is EOL).               |
| **Package Manager**      | **pnpm 10 (Workspaces)**            | Fast, deterministic, space-efficient, zero unnecessary tooling.     |
| **Backend Framework**    | **NestJS 11**                       | Robust modular monolith dependency injection architecture.          |
| **Database & ORM**       | **PostgreSQL 17 + Drizzle ORM**     | Native SQL safety, high performance, deterministic migrations.      |
| **Validation**           | **Zod**                             | End-to-end runtime type safety for environment and contracts.       |
| **Frontend Framework**   | **React 19 + TypeScript**           | Modern concurrent UI architecture and component model.              |
| **Frontend Tooling**     | **Vite 6**                          | Ultra-fast bundling, HMR, and transparent development proxying.     |
| **Boundary Gates**       | **dependency-cruiser**              | Automated static enforcement of modular monolith architecture.      |
| **Linting & Formatting** | **ESLint 9 Flat Config + Prettier** | Zero-compromise strict TypeScript code quality.                     |
| **Testing**              | **Jest, Vitest, Playwright**        | Fast unit tests, real PostgreSQL integration tests, full-stack E2E. |

---

## 4. Prerequisites

- **Node.js**: `v24.x LTS` (Recommended: install via [nvm](https://github.com/coreybutler/nvm-windows) or official installer).
- **pnpm**: `v10.5.2` (`npm install -g pnpm@10.5.2`).
- **PostgreSQL**: Native PostgreSQL 17 running locally on `localhost:5432`.

---

## 5. Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ziadayman00/kivo-team-worksapce.git
cd kivo
pnpm install
```

### 2. Configure Environment Variables

Copy [.env.example](file:///.env.example) to `.env`:

```bash
cp .env.example .env
```

Ensure PostgreSQL credentials in `.env` match your local PostgreSQL 17 instance:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kivo_dev
DATABASE_URL_TEST=postgresql://postgres:password@localhost:5432/kivo_test
PORT=3000
```

### 3. Initialize & Seed Database

```bash
# Run pending migrations
pnpm db:migrate

# Or perform a complete clean reset and deterministic seed:
pnpm db:reset
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Concurrently launches API (port 3000) and Web app (port 5173)
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Verification & Quality Gates

Run the automated engineering quality gates:

```bash
# 1. Strict TypeScript check across all workspace projects
pnpm typecheck

# 2. Code formatting verification (Prettier)
pnpm format:check

# 3. Code quality and anti-slop linting (ESLint 9)
pnpm lint

# 4. Enforce modular monolith architectural boundaries (dependency-cruiser)
pnpm check:boundaries

# 5. Verify architectural violation rejection test harness
pnpm test:boundaries

# 6. Run Web unit tests (Vitest)
pnpm --filter @kivo/web test

# 7. Run API unit tests (Jest)
pnpm --filter @kivo/api test

# 8. Run PostgreSQL integration tests (real PostgreSQL kivo_test)
pnpm test:integration

# 9. Run full-stack Playwright E2E smoke tests
pnpm test:e2e

# 10. Run complete production build
pnpm build
```

---

## 7. Engineering Protocol & Governance

- [AGENTS.md](file:///d:/ziad%20ayman/CV%20projects/2026/kivo/AGENTS.md) — Engineering Constitution & Execution Protocol for AI Coding Agents.
- [CONTRIBUTING.md](file:///d:/ziad%20ayman/CV%20projects/2026/kivo/CONTRIBUTING.md) — Contributor Guide, Workflow Standards, and Definition of Done.
- [Module Architecture Map](file:///d:/ziad%20ayman/CV%20projects/2026/kivo/docs/architecture/module-map.md) — Domain module ownership and interface contracts.
- [ADR Index](file:///d:/ziad%20ayman/CV%20projects/2026/kivo/docs/architecture/adr-index.md) — Authoritative Architectural Decision Records.
