# Scope: Implementation Overhaul

## Architecture
- **Frontend**: Next.js App router (located in `Frontend`), styled with Tailwind.
- **Backend**: Express server (located in `server`), Prisma ORM, MySQL DB.
- **OroPlay Integration**: Express backend routes for seamless wallet (`/api/balance`, `/api/transaction`, `/api/batch-transactions`) communicate with MySQL DB. Frontend Next.js app has API routes at `Frontend/src/app/api/...` that need to delegate to backend/DB.
- **Admin Dashboard**: Frontend `Frontend/src/app/admin/page.tsx` connects to backend `/api/admin/*`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Setup and Audit | Verify environment, check files, and start heartbeat | None | DONE |
| 2 | Seamless Wallet Integration | Delegate Next.js frontend seamless routes directly to Express backend or share DB (removing seamless-store.ts local memory storage dependencies) | M1 | IN_PROGRESS |
| 3 | Frontend Theme Redesign | Transition Next.js frontend to a bright/vibrant light theme, eliminating black/dark backgrounds and purple/indigo styling across all pages/components | M2 | PLANNED |
| 4 | Admin Dashboard & Banners CMS | Fix the 3 dashboard contract mismatches (RTP endpoint & payload, KYC status update), set up Banner CRUD UI panel connected to backend `/api/admin/banners`, and dynamically parse game categories and ratings | M3 | PLANNED |
| 5 | Compile & Verify | Compile codebase via `npm run build` and run forensic auditing to ensure integrity | M4 | PLANNED |

## Interface Contracts
### Admin Panel Corrections
- Endpoint: POST `/api/admin/game/set-rtp` (expects payload `{ username, vendorCode, rtp }`)
- Endpoint: PATCH `/api/admin/users/:userId/kyc` (expects payload `{ kycStatus }`)
- Banners Endpoint: CRUD at `/api/admin/banners` (GET, POST, PUT, DELETE)

### Seamless Wallet
- Next.js API routes `/api/balance`, `/api/transaction`, `/api/batch-transactions` must delegate requests to Express backend / DB.
