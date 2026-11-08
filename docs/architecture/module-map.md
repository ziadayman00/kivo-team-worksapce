# KIVO — Modular Monolith Architecture & Domain Module Map

**Document Type:** System Architecture Specification (SD-13 Reference)  
**Architecture Style:** Modular Monolith (ADR-001, ADR-013)  
**Location:** `apps/api/src/modules/`

---

## 1. Modular Monolith Architecture Principles

KIVO is architected as a **Modular Monolith**. Rather than premature microservices or a loose monolithic tangle, domain logic is partitioned into 8 cohesive, independently testable modules within a single NestJS backend application.

### Key Architectural Invariants:

1. **Public Interface Encapsulation:** Each module exposes its capabilities exclusively via a top-level public interface (`index.ts`, `public.ts`, or the NestJS module class).
2. **Persistence Isolation:** Modules own their data tables and persistence repositories. Direct cross-module queries or writes to another module's internal tables are strictly prohibited.
3. **Cross-Module Communication:**
   - **Synchronous:** In-process dependency injection via declared NestJS public service interfaces.
   - **Asynchronous:** Domain events recorded to the PostgreSQL Transactional Outbox table within the local transaction and dispatched to listeners.
4. **Boundary Verification:** Architecture boundary rules are statically verified on every build and CI run via `dependency-cruiser`.

---

## 2. Domain Module Map

```
apps/api/src/modules/
├── identity/             # Authentication & user identity
├── workspace/            # Workspaces & organization profiles
├── authorization/        # RBAC, permissions & authorization versions
├── work-management/      # Projects, work items, cycles & statuses
├── collaboration/        # Channels, direct messages, conversation threads
├── activity/             # Audit logging & workspace activity feed
├── notification/         # In-app notifications & SSE real-time streaming
└── search/               # Cross-entity unified workspace search
```

---

## 3. Module Specifications

### 3.1 IdentityModule (`src/modules/identity/`)

- **Purpose:** Manages user identity, account registration, credentials, password reset, session authentication, and user profile metadata.
- **Owned Entities:** `users`, `user_credentials`, `user_sessions`, `password_reset_tokens`.
- **Public Interface:** `IdentityService` (`getUserById`, `validateUserCredentials`, `findUsersByIds`).
- **Dependencies:**
  - Allowed Outbound: `WorkspaceModule` (onboarding initial workspace), `ActivityModule` (audit auth events).
  - Allowed Inbound: All domain modules requiring actor profile resolution.

---

### 3.2 WorkspaceModule (`src/modules/workspace/`)

- **Purpose:** Manages the core multi-tenant workspace boundary, organization settings, workspace membership, and member status.
- **Owned Entities:** `workspaces`, `workspace_members`, `workspace_invitations`, `workspace_settings`.
- **Public Interface:** `WorkspaceService` (`getWorkspaceById`, `getWorkspaceMembers`, `validateMembership`).
- **Dependencies:**
  - Allowed Outbound: `IdentityModule`, `AuthorizationModule`, `ActivityModule`.
  - Allowed Inbound: All modules requiring tenant verification and membership resolution.

---

### 3.3 AuthorizationModule (`src/modules/authorization/`)

- **Purpose:** Enforces Role-Based Access Control (RBAC), system permissions, role assignments, and authorization version invalidation.
- **Owned Entities:** `roles`, `permissions`, `role_permissions`, `member_roles`.
- **Public Interface:** `AuthorizationService` (`hasPermission`, `assertPermission`, `getMemberPermissions`, `incrementAuthVersion`).
- **Dependencies:**
  - Allowed Outbound: `WorkspaceModule`.
  - Allowed Inbound: All modules enforcing action authorization and policy checks.

---

### 3.4 WorkManagementModule (`src/modules/work-management/`)

- **Purpose:** Manages core work tracking: projects, work items (tasks, stories, bugs), hierarchies, workflows, statuses, priorities, and delivery cycles.
- **Owned Entities:** `projects`, `work_items`, `work_item_relations`, `cycles`, `workflow_statuses`.
- **Public Interface:** `WorkManagementService` (`getWorkItemById`, `getProjectById`, `listWorkItemsForProject`).
- **Dependencies:**
  - Allowed Outbound: `WorkspaceModule`, `AuthorizationModule`, `ActivityModule`, `NotificationModule`.
  - Allowed Inbound: `CollaborationModule` (linking discussions), `SearchModule`.

---

### 3.5 CollaborationModule (`src/modules/collaboration/`)

- **Purpose:** Powers team communication: channels (public/private), 1-on-1 direct messages, group chats, message threads, and discussions contextualized to work items.
- **Owned Entities:** `channels`, `channel_members`, `messages`, `message_attachments`, `message_reactions`.
- **Public Interface:** `CollaborationService` (`getChannelById`, `listMessagesForContext`).
- **Dependencies:**
  - Allowed Outbound: `WorkspaceModule`, `AuthorizationModule`, `WorkManagementModule` (contextual references), `ActivityModule`, `NotificationModule`.
  - Allowed Inbound: `SearchModule`.

---

### 3.6 ActivityModule (`src/modules/activity/`)

- **Purpose:** Records immutable workspace activity events, audit log entries, and timelines for compliance, visibility, and analytics.
- **Owned Entities:** `activity_events`, `audit_logs`.
- **Public Interface:** `ActivityService` (`recordActivityEvent`, `listActivityForWorkspace`, `listActivityForEntity`).
- **Dependencies:**
  - Allowed Outbound: `WorkspaceModule`.
  - Allowed Inbound: All domain modules recording user actions and system changes.

---

### 3.7 NotificationModule (`src/modules/notification/`)

- **Purpose:** Manages in-app notification state, recipient preferences, mention alerts, and real-time event streaming via Server-Sent Events (SSE).
- **Owned Entities:** `notifications`, `notification_preferences`.
- **Public Interface:** `NotificationService` (`createNotification`, `dispatchNotification`, `getSseStreamForUser`).
- **Dependencies:**
  - Allowed Outbound: `WorkspaceModule`, `IdentityModule`.
  - Allowed Inbound: `WorkManagementModule`, `CollaborationModule`, `ActivityModule`.

---

### 3.8 SearchModule (`src/modules/search/`)

- **Purpose:** Provides unified, tenant-isolated full-text search across projects, work items, channels, and messages.
- **Owned Entities:** Read-only index projections / PostgreSQL full-text search views.
- **Public Interface:** `SearchService` (`searchWorkspace`).
- **Dependencies:**
  - Allowed Outbound: `WorkspaceModule`, `AuthorizationModule`, `WorkManagementModule`, `CollaborationModule`.
  - Allowed Inbound: API Gateway / Controllers only.

---

## 4. Enforcement Strategy

Architecture boundaries are strictly enforced via the repository's `.dependency-cruiser.js` configuration:

- Cross-module internal imports trigger a hard compiler/linter error (`backend-no-cross-module-internals`).
- Pull requests violating modular boundaries automatically fail CI.
- The test harness (`scripts/test-architecture-boundaries.mjs`) actively validates that deliberately invalid cross-module imports are rejected.
