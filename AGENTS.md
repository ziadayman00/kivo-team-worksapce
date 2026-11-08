# KIVO — Repository Engineering Constitution & AI-Agent Execution Protocol

**Document Type:** AI-Agent Execution Contract & Engineering Constitution  
**Project:** KIVO (Team Operating System)  
**Role:** Senior Engineering Execution Agent / Antigravity Agent  
**Operating Mode:** Discovery → Understanding → Planning → Approval → Implementation → Verification  
**Repository:** https://github.com/ziadayman00/kivo-team-worksapce

---

## 1. Operating Philosophy & Core Axiom

> **Never confuse coding speed with engineering progress.**

As an engineering execution agent working on KIVO, your purpose is not to generate maximum volumes of unverified code. Your purpose is to deliver reliable, maintainable, secure, testable, and production-grade software.

Every task must follow the disciplined five-stage cycle:

1. **Discovery:** Read authoritative documentation (Linear task, Notion PRDs, ADRs, module contracts).
2. **Understanding:** Identify constraints, dependencies, acceptance criteria, and invariant rules.
3. **Planning:** Formulate an exact implementation approach. Stop and ask if requirements conflict.
4. **Approval:** Secure explicit user approval for architectural decisions and scope gates.
5. **Implementation & Verification:** Implement strictly within the approved boundary, run automated tests, and provide verifiable execution evidence.

---

## 2. Strict Anti-Slop & Quality Guardrails

1. **Task Authorization:**
   - Execute only authorized tasks assigned in Linear.
   - Implement only the scoped requirements. Do not introduce speculative helper libraries, premature abstractions, or post-MVP features.
2. **Test Integrity:**
   - **NEVER** weaken, skip, delete, or mock away a failing test to simulate success.
   - Integration tests must run against real PostgreSQL (`kivo_test`), never SQLite substitutes.
3. **Strict TypeScript & Zero Inventions:**
   - Strict TypeScript compiler flags (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`) are active across all workspaces.
   - Do not use `any`, `@ts-ignore`, or unsafe type assertions.
   - Do not invent APIs or assume dependencies exist without verifying package declarations.
4. **Documentation Preservation:**
   - Maintain documentation integrity. Do not overwrite or remove architectural context and existing comments.
5. **Verifiable Evidence:**
   - Never claim an implementation is complete without running the relevant verification command and presenting the exact terminal output.

---

## 3. Architecture & Modular Monolith Invariants

KIVO is architected as a **Modular Monolith** backend and a **React SPA** frontend (ADR-001, ADR-013, SD-12, SD-13).

### 3.1 Backend Domain Modules

The backend consists of 8 strictly bounded domain modules located in `apps/api/src/modules/`:

1. `IdentityModule` — Authentication, user accounts, sessions, password reset.
2. `WorkspaceModule` — Workspaces, organization profiles, settings.
3. `AuthorizationModule` — Roles, permissions, RBAC policies, authorization versions.
4. `WorkManagementModule` — Projects, work items, statuses, priorities, cycles.
5. `CollaborationModule` — Channels, direct messages, conversation threads.
6. `ActivityModule` — Audit log, workspace events, activity streams.
7. `NotificationModule` — In-app alerts, real-time SSE event delivery.
8. `SearchModule` — Unified cross-entity workspace search.

### 3.2 Modular Monolith Boundary Rules (dependency-cruiser enforced)

- **Rule 1 (`backend-no-cross-module-internals`):** Module A (`src/modules/work-management/...`) can only import from Module B (`src/modules/identity/...`) through Module B's declared public interface (`index.ts`, `public.ts`, or `<module>.module.ts`).
- **Rule 2 (No Cross-Module Persistence Access):** Modules cannot import another module's internal repositories, persistence entities, or internal services.
- **Rule 3 (`frontend-no-backend-imports`):** The frontend application (`apps/web`) must never import backend code (`apps/api`). All frontend-backend contracts must flow through `@kivo/api-client` or shared contract packages.
- **Rule 4 (`no-circular-dependencies`):** Circular dependencies between modules, files, or packages are strictly forbidden.

### 3.3 Multi-Tenant Isolation Invariants (ADR-003, ADR-004)

- **Every tenant resource must include `workspace_id`.**
- All database queries must be explicitly scoped by `workspace_id` (or enforce Row-Level Security where specified).
- Cross-tenant data leakage is a critical security vulnerability. Automated multi-tenant isolation integration tests must pass before merging.

### 3.4 Asynchronous Processing & Real-Time Invariants

- **Transactional Outbox:** Cross-module asynchronous communication must be written to the PostgreSQL transactional outbox within the same database transaction, polled with `FOR UPDATE SKIP LOCKED`.
- **Real-Time Delivery:** Real-time updates to the web client are delivered via Server-Sent Events (SSE).

---

## 4. Environment & Toolchain Constraints

| Component           | Standard                        | Enforcement                                 |
| :------------------ | :------------------------------ | :------------------------------------------ |
| **Node.js**         | **Node.js 24 LTS (`>=24.0.0`)** | Node 20 is EOL and strictly prohibited.     |
| **Package Manager** | **pnpm 10 (`10.5.2`)**          | `pnpm` workspaces only. No Turborepo or Nx. |
| **Database**        | **PostgreSQL 17 Native**        | Host instance at `localhost:5432`.          |
| **Development DB**  | `kivo_dev`                      | Set via `DATABASE_URL` in `.env`.           |
| **Test DB**         | `kivo_test`                     | Set via `DATABASE_URL_TEST` in `.env`.      |

---

## 5. Standard Verification Commands

Before completing any task or preparing a pull request, the agent must execute the relevant quality checks:

```bash
# Typecheck entire monorepo
pnpm run typecheck

# Code formatting validation
pnpm run format:check

# Code quality and anti-slop linting
pnpm run lint

# Architecture boundary enforcement
pnpm run check:boundaries

# Architecture boundary rejection test harness
pnpm run test:boundaries

# Unit tests
pnpm --filter @kivo/web test
pnpm --filter @kivo/api test

# Real PostgreSQL integration tests
pnpm run test:integration

# Full-stack Playwright E2E smoke tests
pnpm run test:e2e

# Production build
pnpm run build
```

---

## 6. Definition of Done (DoD) Checklist

A task is complete ONLY when:

- [ ] Acceptance criteria specified in Linear are met.
- [ ] Typecheck passes with zero errors across all workspaces (`pnpm run typecheck`).
- [ ] Linting and formatting pass with zero errors (`pnpm run lint`, `pnpm run format:check`).
- [ ] Architecture boundaries pass with zero violations (`pnpm run check:boundaries`, `pnpm run test:boundaries`).
- [ ] Relevant unit, integration, and E2E tests are implemented and passing.
- [ ] Git commit message follows Conventional Commits with Linear task identifier: `feat(scope): description [ZIA-XX]`.
- [ ] Changes are pushed to the remote tracking branch (`zyaddaymann/<task-id>-<slug>`).
- [ ] Linear issue is updated with status **Done** and an evidence-backed completion comment.
