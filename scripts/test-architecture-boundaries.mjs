import { execSync } from 'node:child_process';

function runDepcruise(target) {
  try {
    const stdout = execSync(`pnpm exec depcruise --validate .dependency-cruiser.js ${target}`, {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return { success: true, exitCode: 0, output: stdout };
  } catch (error) {
    return {
      success: false,
      exitCode: error.status ?? 1,
      output: (error.stdout || '') + (error.stderr || ''),
    };
  }
}

function verifyBoundaries() {
  console.info('=== [KIVO Architecture Boundary Gate Verification] ===\n');

  // Test 1: Real Codebase Validation
  console.info('1. Verifying production codebase (apps/api, apps/web, packages/api-client)...');
  const prod = runDepcruise('apps/api/src apps/web/src packages/api-client/src');
  if (!prod.success) {
    console.error('FAILED: Found unexpected architectural violations in production codebase:');
    console.error(prod.output);
    process.exit(1);
  }
  console.info('   ✔ Clean architecture confirmed: 0 violations found.\n');

  // Test 2: Backend Deliberately Invalid Fixture
  console.info('2. Testing Backend Cross-Module Boundary Violation Fixture...');
  const backend = runDepcruise('test/fixtures/boundaries/backend-violation');
  if (backend.success) {
    console.error('FAILED: depcruise succeeded when it was expected to reject backend violation!');
    process.exit(1);
  }
  if (!backend.output.includes('backend-no-cross-module-internals')) {
    console.error(
      'FAILED: depcruise failed to flag the expected rule `backend-no-cross-module-internals`!',
    );
    console.error(backend.output);
    process.exit(1);
  }
  console.info(
    '   ✔ Successfully rejected invalid import with rule `backend-no-cross-module-internals`.\n',
  );

  // Test 3: Frontend Deliberately Invalid Fixture
  console.info('3. Testing Frontend Backend Import Boundary Violation Fixture...');
  const frontend = runDepcruise('test/fixtures/boundaries/frontend-violation');
  if (frontend.success) {
    console.error('FAILED: depcruise succeeded when it was expected to reject frontend violation!');
    process.exit(1);
  }
  if (!frontend.output.includes('frontend-no-backend-imports')) {
    console.error(
      'FAILED: depcruise failed to flag the expected rule `frontend-no-backend-imports`!',
    );
    console.error(frontend.output);
    process.exit(1);
  }
  console.info(
    '   ✔ Successfully rejected invalid import with rule `frontend-no-backend-imports`.\n',
  );

  console.info('=== ALL ARCHITECTURE BOUNDARY GATES VERIFIED SUCCESSFULLY ===');
}

verifyBoundaries();
