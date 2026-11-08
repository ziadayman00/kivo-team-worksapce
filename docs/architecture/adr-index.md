# KIVO — Architectural Decision Records (ADR) Index

**Canonical Documentation Source:** [Notion Architecture Documentation](https://app.notion.com/p/4116c6ee493281e2941ef73ed00ad518?pvs=204)  
**TDR Reference (ZIA-16):** [Toolchain Decision Record](https://app.notion.com/p/4116c6ee4932818e883cec15070183b0?pvs=204)

---

## Authoritative ADR Log

| ADR         | Title                             | Status       | Scope         | Core Decision                                                                                       |
| :---------- | :-------------------------------- | :----------- | :------------ | :-------------------------------------------------------------------------------------------------- |
| **ADR-001** | System Topology                   | **Accepted** | System        | Modular Monolith backend with React SPA frontend; no premature microservices.                       |
| **ADR-002** | Monorepo Structure                | **Accepted** | Tooling       | Single repository managed with `pnpm` workspaces; no Turborepo or Nx complexity.                    |
| **ADR-003** | Multi-Tenant Architecture         | **Accepted** | Data          | Shared PostgreSQL database with `workspace_id` tenant discriminator on all tenant entities.         |
| **ADR-004** | Tenant Context & Authorization    | **Accepted** | Security      | Request-scoped tenant context extraction with authorization version invalidation.                   |
| **ADR-005** | Cross-Module Communication        | **Accepted** | Backend       | Transactional Outbox pattern using PostgreSQL `FOR UPDATE SKIP LOCKED` for async events.            |
| **ADR-006** | Backend Implementation Stack      | **Accepted** | Backend       | NestJS 11 + Drizzle ORM + Zod + TypeScript on **Node.js 24 LTS**.                                   |
| **ADR-007** | Frontend Stack & UI Architecture  | **Accepted** | Frontend      | React 19 + TypeScript + Vite 6 + React Router v7 + TanStack Query v5 + Tailwind CSS.                |
| **ADR-008** | Testing Strategy & Isolation      | **Accepted** | Testing       | Jest unit tests, Vitest web tests, real native PostgreSQL 17 integration tests, and Playwright E2E. |
| **ADR-009** | Real-Time Delivery                | **Accepted** | Communication | Server-Sent Events (SSE) for in-app real-time notifications over HTTP/2.                            |
| **ADR-010** | Authentication & Session Security | **Accepted** | Security      | HTTP-only Secure session cookies, Argon2id password hashing, CSRF protection.                       |
| **ADR-011** | ORM & Migration Strategy          | **Accepted** | Data          | Drizzle ORM with Drizzle Kit SQL migrations; deterministic reset/seed workflow.                     |
| **ADR-012** | Environment Configuration         | **Accepted** | Ops           | Zod runtime schema validation at application bootstrap; `.env.example` placeholders only.           |
| **ADR-013** | Architecture Boundary Gates       | **Accepted** | Quality       | `dependency-cruiser` static boundary checks, ESLint 9 Flat Config, Prettier formatting.             |

---

## Architectural Decision Summaries

### ADR-001: Modular Monolith Topology

- **Context:** Deciding between microservices vs. distributed services vs. monolithic architecture for KIVO's initial milestones.
- **Decision:** Build as a single Modular Monolith. Microservices introduce unnecessary network serialization, distributed transaction overhead, and deployment complexity for small-to-medium teams.
- **Invariants:** 8 strictly encapsulated modules with public interface boundaries.

### ADR-003: Multi-Tenant Data Architecture

- **Context:** Multi-tenancy isolation strategy (database-per-tenant vs. schema-per-tenant vs. shared-table with discriminator).
- **Decision:** Shared table with `workspace_id` discriminator column. Ensures cost-effective operations, rapid deterministic migrations, and efficient resource pooling.
- **Invariants:** Multi-tenant integration tests verify complete data isolation between workspaces.

### ADR-006: Backend Implementation Stack

- **Context:** Toolchain evaluation for Node.js backend.
- **Decision:** NestJS 11 for modular architecture and dependency injection, Drizzle ORM for type-safe SQL, Zod for schema validation, running on **Node.js 24 LTS**. Node 20 is EOL and strictly prohibited.

### ADR-008: Testing Strategy & Environment Isolation

- **Context:** Local testing database and E2E testing framework.
- **Decision:** Use native PostgreSQL 17 for local development and real integration testing. Playwright drives full-stack E2E smoke testing. Never use SQLite as an integration substitute for PostgreSQL.

### ADR-013: Architecture Boundary Enforcement

- **Context:** Preventing architectural erosion and cross-module spaghetti in the modular monolith.
- **Decision:** Use `dependency-cruiser` in CI and pre-commit checks to enforce module encapsulation rules and forbid cross-module private persistence imports.
