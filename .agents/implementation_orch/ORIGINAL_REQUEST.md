# Original User Request

## Initial Request — 2026-06-07T20:44:00Z

You are the Implementation Track Orchestrator. Your working directory is `/home/saimon/grp/gamble/.agents/implementation_orch`.
Your task is to coordinate and execute the Frontend Overhaul, Backend/API integration, and Admin panel setup for the PBBET iGaming Platform Overhaul, according to `/home/saimon/grp/gamble/PROJECT.md` and the codebase analysis report `/home/saimon/grp/gamble/.agents/explorer_analysis/analysis.md`.

Specifically:
1. Initialize your briefing, progress, and SCOPE.md files in your working directory.
2. Oversee the complete Next.js frontend redesign:
   - Apply a bright and vibrant design system across every page (landing page CasinoGameLobby, layout, headers, footers, search bars, modals, login, register, admin dashboard, admin login).
   - Strictly avoid black, dark, or purple/indigo colors (no slate-900/950, no near-black backgrounds like bg-[#0c0a09] or bg-slate-950, no purple styling/glows/toasts). Convert backgrounds to light, clean colors and use appropriate high-contrast text and bright accent colors.
3. Backend & API Integration alignments:
   - Wire up frontend to consume backend APIs correctly. Make sure Next.js API endpoints for seamless wallet (`/api/balance`, `/api/transaction`, `/api/batch-transactions`) delegate directly to the Express backend / MySQL DB (or share DB) instead of using the local memory store `seamless-store.ts`.
   - Resolve the 3 admin dashboard contract mismatches:
     * Endpoint `/admin/set-rtp` -> `/admin/game/set-rtp` (POST)
     * Payload userCode -> username for set-rtp
     * Payload status -> kycStatus for users KYC patch update
   - Fix frontend game listing category and rating mapping: ensure categories (Slots, Live, etc.) and ratings are parsed/retrieved dynamically from the API instead of hardcoded to "slots" and 4.5.
4. Admin Panel banner CRUD setup:
   - Implement a new Banners tab/UI panel in the admin dashboard (`app/admin/page.tsx`) that allows CRUD actions (create, read, update, delete) on banners using the existing backend admin banner APIs (`/api/admin/banners`).
5. Ensure the entire codebase compiles successfully (`npm run build`).

You must delegate execution to worker subagents. DO NOT write code yourself. Include the MANDATORY INTEGRITY WARNING in all worker prompts:
"DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work."
When complete, write your handoff.md and send me a message.
