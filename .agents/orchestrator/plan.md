# PBBET Frontend-Backend Integration Plan

## Goal
Integrate the PBBET frontend with the Express/Prisma/MySQL backend endpoints and OroPlay mocks. All client-facing interactive components must be fully functional, the E2E test suite must pass cleanly, and the frontend must compile/build successfully.

## Verification & Build Criteria
- Running `node tests/e2e/run-tests.js` passes all tests cleanly.
- Running `npm run build` in the `Frontend` directory completes without compilation or TypeScript errors.

## Step-by-Step Execution Plan

### Step 1: Detailed Workspace & Integration Analysis
- **Role**: `teamwork_preview_explorer`
- **Objective**:
  1. Inspect the Next.js `Frontend` components (auth, balance, games list, launching games) to identify where dummy data or mocked local states are used instead of API calls.
  2. Inspect the Express `server` backend endpoints (registration, login, profile, settings, banners, game list, launch, and wallet callbacks) to verify implementation state and database schemas.
  3. Verify availability of build scripts and node packages.
  4. Output a detailed analysis report outlining the specific integration gaps.

### Step 2: Implementation of Frontend-Backend Integration
- **Role**: `teamwork_preview_worker`
- **Objective**:
  1. Complete auth integration (login, registration) on the Next.js client, storing/fetching JWT tokens and checking authentication status.
  2. Complete live balance fetching and updating, linking user wallet info with backend `/api/user/profile`.
  3. Complete game selection, listing, and game launching (fetching real games from `/api/user/games` and launch URLs from `/api/user/launch`).
  4. Ensure backend controllers correctly implement Express logic and prisma MySQL queries.
  5. Run build and tests iteratively, fixing errors.

### Step 3: Admin CMS & Theme Adherence
- **Role**: `teamwork_preview_worker`
- **Objective**:
  1. Verify the Admin panel's CMS settings and banner CRUD actions update the database correctly.
  2. Ensure the public site dynamically updates values from the admin panel settings/banners.
  3. Perform style checks to ensure the frontend strictly avoids black, dark, or purple/indigo colors, maintaining a bright/vibrant palette.

### Step 4: Verification, Building & Hardening
- **Role**: `teamwork_preview_challenger`
- **Objective**:
  1. Run the E2E test runner: `node tests/e2e/run-tests.js`.
  2. Execute `npm run build` in the `Frontend` directory.
  3. Identify and fix any compiler, lint, or test failures.

### Step 5: Integrity Audit
- **Role**: `teamwork_preview_auditor`
- **Objective**:
  1. Run the Forensic Auditor to check for hardcoded test results, facade implementations, or circumvented behavior.
  2. Ensure strict compliance with code layout.

### Step 6: Documentation & Completion
- **Role**: `teamwork_preview_orchestrator` (Successor or Current)
- **Objective**:
  1. Verify/generate `briefing.txt` in the workspace root summarizing the system.
  2. Report completion to the Sentinel.
