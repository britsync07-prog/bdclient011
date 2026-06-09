# PBBET Overhaul Plan

## Goal
Coordinate the project execution to overhaul the iGaming platform.
1. Frontend redesign: Bright colors only, strictly avoiding dark/purple/black, using `stitch` MCP tools.
2. Backend & API Integration: Remove dummy data, integrate real OroPlay APIs.
3. Admin Panel Setup: Provide dynamic placeholders (social media links, about sections).
4. Testing and Documentation: Mock API suite for OroPlay transactions, output `briefing.txt` detailing system structure, APIs, signup process, and admin features.

## Step-by-Step Execution Plan

### Step 1: Workspace Analysis & Detailed Exploration
- Dispatch a teamwork_preview_explorer agent to do a comprehensive code analysis.
- Understand the existing database configuration, the user table, dynamic settings table, and how frontend communicates with the backend.
- Identify the exact files in the frontend that currently have dark/purple/black styling.
- Check if the stitch MCP tools or npm commands are available in the workspace.

### Step 2: Implement E2E Mock Test Suite & Mock Server (Milestone 1)
- Dispatch a teamwork_preview_worker to build an E2E Mock Server simulating all 20 OroPlay integration APIs.
- The mock server will run locally, responding to authentication, games list, launch URL, RTP adjustments, deposits, withdrawals, etc.
- Verify the mock server can simulate transaction callbacks (bets and wins) to the backend.
- Write a programmatic validation test script to verify that transactions run correctly and balances update in the database without hitting rate limits.

### Step 3: Backend & Integration Alignment (Milestone 2)
- Dispatch a teamwork_preview_worker to align Next.js seamless wallet APIs with the Express backend APIs.
- Ensure that the Next.js API endpoints for seamless wallet (`/api/balance`, `/api/transaction`, `/api/batch-transactions`) do not use memory stores (`seamless-store.ts`), but instead forward requests to the Express backend or direct database.
- Ensure that backend endpoints are properly protected where needed, and public where appropriate (e.g. `/games` endpoint).
- Run database migrations or seeds as needed.

### Step 4: Frontend Overhaul with Bright Colors (Milestone 3)
- Dispatch a teamwork_preview_worker to perform the Next.js UI overhaul.
- Using `stitch` or direct manual CSS/component editing, rewrite all styles to be bright and vibrant (white background, emerald green/amber buttons, slate-800 text, gold accents, etc.).
- Ensure that NO dark backgrounds (`slate-950`, `bg-[#0c0a09]`, etc.), black, or purple colors are used anywhere on the main page, login page, register page, admin pages, or modals.

### Step 5: Admin Panel & CMS Integration (Milestone 4)
- Dispatch a teamwork_preview_worker to wire up the Admin Dashboard Settings tab to update the database.
- Ensure that updating settings (e.g., twitter link, contact email, about us) in the admin panel programmatically updates the public page footer and details.
- Wire up the Admin Dashboard banner management to dynamic backend APIs, and make sure banners on the homepage update accordingly.

### Step 6: E2E Testing, Audit & Briefing (Milestone 5)
- Dispatch a teamwork_preview_challenger to run adversarial tests and verify that changing data in the admin panel updates public pages, that game launch URLs work, and that transaction logic is correct.
- Dispatch a teamwork_preview_auditor to perform forensic integrity audits.
- Review all implementation changes.
- Generate the final `briefing.txt` in the workspace root.
- Report completion to the caller agent.
