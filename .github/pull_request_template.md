## Task Reference

- **Linear Issue:** [ZIA-XX](https://linear.app/ziadayman/issue/ZIA-XX)
- **Milestone:** M0 — Engineering Foundation

---

## Summary of Changes

A concise, high-level overview of the architectural or implementation changes introduced in this pull request.

---

## Acceptance Criteria Checklist

- [ ] Requirements specified in the Linear issue are fully addressed.
- [ ] No unrelated refactor, speculative abstraction, or post-MVP feature is introduced.
- [ ] Strict TypeScript compiler rules pass without `any` or `@ts-ignore`.
- [ ] Architectural boundaries adhere to modular monolith specifications (verified via `pnpm check:boundaries`).
- [ ] Tenant isolation invariants are preserved (`workspace_id` scoping).
- [ ] Relevant unit, integration, or E2E tests are added and passing.

---

## Verification Evidence

| Quality Gate                     | Command                        | Result | Notes                                    |
| :------------------------------- | :----------------------------- | :----- | :--------------------------------------- |
| **Typecheck**                    | `pnpm run typecheck`           | PASS   |                                          |
| **Format Check**                 | `pnpm run format:check`        | PASS   |                                          |
| **Linting**                      | `pnpm run lint`                | PASS   |                                          |
| **Architecture Boundaries**      | `pnpm run check:boundaries`    | PASS   |                                          |
| **Boundary Rejection Test**      | `pnpm run test:boundaries`     | PASS   |                                          |
| **Web Unit Tests**               | `pnpm --filter @kivo/web test` | PASS   |                                          |
| **API Unit Tests**               | `pnpm --filter @kivo/api test` | PASS   |                                          |
| **PostgreSQL Integration Tests** | `pnpm run test:integration`    | PASS   | Against native PostgreSQL 17 `kivo_test` |
| **Playwright E2E Smoke Tests**   | `pnpm run test:e2e`            | PASS   | Headless Chromium                        |
| **Production Build**             | `pnpm run build`               | PASS   |                                          |

---

## Architectural & Security Review

- **Modular Monolith Boundaries:** Does any module import another module's internal files? _(Must be NO)_
- **Tenant Isolation:** Are all tenant data queries scoped by `workspace_id`? _(Must be YES)_
- **Database Migrations:** Are Drizzle migrations backward-compatible? _(Include notes if schema changed)_
- **Rollback Plan:** How can these changes be safely rolled back if necessary?
