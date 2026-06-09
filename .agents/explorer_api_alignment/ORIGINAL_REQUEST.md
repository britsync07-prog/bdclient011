## 2026-06-07T14:46:37Z
You are a read-only exploration agent. Your working directory is `/home/saimon/grp/gamble/.agents/explorer_api_alignment`.
Your task is to investigate the backend/API integration alignments for the PBBET platform overhaul.
Refer to `/home/saimon/grp/gamble/PROJECT.md` and `/home/saimon/grp/gamble/.agents/explorer_analysis/analysis.md`.

Specifically:
- Examine the Next.js API endpoints for seamless wallet (`/api/balance`, `/api/transaction`, `/api/batch-transactions` and their counterparts under `/api/seamless/...`).
- Design the code changes to make these Next.js API routes delegate/proxy directly to the Express backend database / APIs instead of using the local memory store `seamless-store.ts`.
- Examine `/home/saimon/grp/gamble/Frontend/src/app/admin/page.tsx` and the Express backend admin routes/controllers (`server/src/routes/adminRoutes.js`, `server/src/controllers/adminController.js`).
- Design the fixes for the 3 admin dashboard contract mismatches:
  1. Set RTP endpoint: change frontend POST to `/admin/game/set-rtp` (which maps to backend `/api/admin/game/set-rtp`).
  2. Set RTP payload: map `userCode` to `username` in the frontend payload.
  3. KYC update payload: map `status` to `kycStatus` in the frontend patch body.
- Examine `Frontend/src/contexts/GameStoreContext.tsx` or similar files. Design the changes to ensure game categories and ratings are parsed dynamically from the backend games listing API instead of being hardcoded to "slots" and 4.5.
- Document a precise list of files, exact line ranges, and the recommended code changes.
- Write your findings to `/home/saimon/grp/gamble/.agents/explorer_api_alignment/analysis.md` and deliver a handoff report.
- Respond with a brief coordination message.
