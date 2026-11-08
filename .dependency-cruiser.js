/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular-dependencies',
      severity: 'error',
      comment: 'Circular dependencies are strictly forbidden across the codebase.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'backend-no-cross-module-internals',
      severity: 'error',
      comment:
        'Backend modules cannot import another module internal files; only public interfaces (index.ts, public.ts, or <module>.module.ts) are allowed.',
      from: {
        path: '(apps/api/src/modules|test/fixtures/boundaries/backend-violation)/([^/]+)/.+',
      },
      to: {
        path: '(apps/api/src/modules|test/fixtures/boundaries/backend-violation)/([^/]+)/.+',
        pathNot: [
          // Same module internal access is allowed
          '(apps/api/src/modules|test/fixtures/boundaries/backend-violation)/$2/.+',
          // Cross-module imports must go through declared public interfaces
          '(apps/api/src/modules|test/fixtures/boundaries/backend-violation)/[^/]+/(index\\.ts|public\\.ts|[^/]+\\.module\\.ts)$',
        ],
      },
    },
    {
      name: 'frontend-no-backend-imports',
      severity: 'error',
      comment:
        'Frontend application cannot import backend internals. Consume API contracts via @kivo/api-client instead.',
      from: {
        path: '^(apps/web/src|test/fixtures/boundaries/frontend-violation)/.+',
      },
      to: {
        path: '^apps/api/.+',
      },
    },
    {
      name: 'packages-no-apps-imports',
      severity: 'error',
      comment: 'Shared packages must never depend on application code.',
      from: {
        path: '^packages/[^/]+/.+',
      },
      to: {
        path: '^apps/.+',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
  },
};
