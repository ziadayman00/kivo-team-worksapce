# Contributing to KIVO

Thank you for contributing to KIVO. To maintain a high level of engineering discipline, reliability, and security across the codebase, all contributors and agents must follow these guidelines.

---

## 1. Prerequisites & Environment Setup

- **Node.js:** `v24.x LTS` (Node 20 is EOL and strictly prohibited).
- **pnpm:** `v10.5.2` (`npm install -g pnpm@10.5.2`).
- **PostgreSQL:** Native PostgreSQL 17 running on `localhost:5432`.

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/ziadayman00/kivo-team-worksapce.git
cd kivo

# Install workspace dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Run migrations and seed baseline data
pnpm db:migrate
pnpm db:seed
```

---

## 2. Development Workflow

### Starting Development Servers

```bash
# Concurrently launches the NestJS API (port 3000) and Vite Web application (port 5173)
pnpm dev
```

### Database Operations

The project uses Drizzle ORM against PostgreSQL:

- **`pnpm db:generate`**: Generates a new SQL migration file in `apps/api/drizzle/` based on changes in `apps/api/src/database/schema.ts`.
- **`pnpm db:migrate`**: Applies pending migrations to the local database.
- **`pnpm db:reset`**: Terminates connections, drops the `drizzle` and `public` schemas, and re-applies all migrations from scratch.
- **`pnpm db:seed`**: Inserts deterministic baseline tenant workspaces and metadata.

---

## 3. Branching & Commit Conventions

### Branch Naming

Branches must be prefixed with the author's handle and include the Linear issue identifier:

```
<username>/<issue-id>-<short-description>
# Examples:
# zyaddaymann/zia-18-m0-03-set-up-local-postgresql-environment
# zyaddaymann/zia-21-m0-06-publish-repository-engineering
```

### Commit Messages

We follow Conventional Commits with the Linear issue identifier in brackets:

```
<type>(<scope>): <short description> [ZIA-XX]

# Examples:
# feat(m0-03): setup local postgresql, environment config and seed/reset workflow [ZIA-18]
# fix(api): resolve connection timeout on shutdown hook [ZIA-18]
# docs(m0-06): publish repository engineering constitution [ZIA-21]
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

---

## 4. Code Quality & Architectural Gates

All code pushed to pull requests must pass the automated quality gates:

| Gate                        | Command                        | Description                                                                |
| :-------------------------- | :----------------------------- | :------------------------------------------------------------------------- |
| **Typecheck**               | `pnpm run typecheck`           | Validates strict TypeScript compilation across all projects.               |
| **Formatting**              | `pnpm run format:check`        | Verifies compliance with Prettier formatting rules.                        |
| **Linting**                 | `pnpm run lint`                | Runs ESLint 9 with strict rules (no `any`, no unused vars).                |
| **Architecture Boundaries** | `pnpm run check:boundaries`    | Verifies modular monolith import boundaries via `dependency-cruiser`.      |
| **Boundary Rejection Test** | `pnpm run test:boundaries`     | Runs fixture validation proving boundary gates actively reject violations. |
| **Unit Tests (Web)**        | `pnpm --filter @kivo/web test` | Runs Vitest component and unit tests.                                      |
| **Unit Tests (API)**        | `pnpm --filter @kivo/api test` | Runs Jest unit tests with mocked infrastructure.                           |
| **Integration Tests**       | `pnpm run test:integration`    | Runs Jest integration tests against real PostgreSQL (`kivo_test`).         |
| **E2E Smoke Tests**         | `pnpm run test:e2e`            | Runs Playwright tests against live API and Vite dev servers.               |
| **Production Build**        | `pnpm run build`               | Builds all packages and applications for production.                       |

To automatically format files:

```bash
pnpm run format:write
```

---

## 5. Architectural Invariants

1. **Modular Monolith Boundaries:**
   - Modules live in `apps/api/src/modules/<module-name>`.
   - Never import from another module's internal files (`persistence`, `internal`, private services).
   - Only import from the other module's public entry point (`index.ts`, `public.ts`, or `<module>.module.ts`).
2. **Frontend Separation:**
   - `apps/web` must NEVER import `apps/api` code.
   - All backend communication is mediated through `@kivo/api-client` or shared contract packages.
3. **Tenant Isolation:**
   - Multi-tenant data models must include `workspace_id`.
   - Queries must always be scoped by `workspace_id` to prevent cross-tenant leaks.
4. **Asynchronous Decoupling:**
   - Cross-module communication uses the Transactional Outbox pattern (`FOR UPDATE SKIP LOCKED`).
   - In-app real-time communication uses Server-Sent Events (SSE).

---

## 6. Pull Request Process & Definition of Done

1. Ensure all tests and quality checks pass locally.
2. Push your feature branch to GitHub and create a Pull Request against `main`.
3. Complete the Pull Request template checklist, including:
   - Link to the Linear task.
   - Description of changes.
   - Evidence of passing tests (terminal outputs).
   - Architectural and security considerations.
4. Obtain approval and ensure CI checks pass before merging.
