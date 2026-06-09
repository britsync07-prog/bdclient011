# Project: PBBET iGaming Platform Overhaul

## Architecture
- **Frontend**: Next.js (React 19, Next 15) styled with Tailwind CSS. Points to backend URL for API communications and dynamic contents (banners, CMS settings, profile balance, games listing, game launch URL).
- **Backend**: Express.js server utilizing Prisma ORM with MySQL database.
- **OroPlay API**: Integration client that communicates with the OroPlay v2 game API (launch URL, games/vendors lists, RTP limits, transactions, deposits, withdrawals).
- **Seamless Wallet**: API callbacks from OroPlay endpoint into the backend operator wallet `/api/balance`, `/api/transaction`, `/api/batch-transactions` to update player balances.
- **Admin Panel**: Located at `/admin` on Next.js frontend, connecting to `/api/admin/*` on backend for user KYC, transactions approval, RTP adjustments, and CMS settings.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | E2E Mock Test Suite | Create simulated test suite for all 20 OroPlay APIs and mock transaction server | None | IN_PROGRESS |
| M2 | Backend Integration | Resolve endpoint protection, align Next.js seamless routes with Express backend, remove all frontend dummy storage | M1 | PLANNED |
| M3 | Frontend Overhaul | Full bright/vibrant redesign of all pages (Landing, Login, Register, Admin, Game iframe) using `stitch` tools, strictly avoiding dark/purple/black | M2 | PLANNED |
| M4 | Admin CMS Integration | Add banner management UI tab to Admin page, map CRUD actions to backend database APIs, and fix categories and ratings mappings | M3 | PLANNED |
| M5 | E2E Testing & Verification | Run full test suite, verify layout compliance, compile build, and write `briefing.txt` | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Express Backend ↔ Next.js Frontend
- `GET /api/user/settings` -> Returns public CMS settings as a JSON object: `{ success: true, data: { about_us, social_twitter, ... } }`.
- `GET /api/user/banners` -> Returns active banners array: `{ success: true, data: [ { id, title, imageUrl, linkUrl, order } ] }`.
- `GET /api/user/games` -> Returns games list retrieved from OroPlay: `{ games: [ { gameCode, gameName, provider, thumbnail, vendorCode } ] }`.
- `POST /api/user/launch` -> Generates game launch URL from user credentials: `{ launchUrl: string }`.
- `GET /api/user/profile` -> Returns authenticated user profile including dynamic balance: `{ username: string, balance: number }`.

### Express Backend Admin Endpoints
- `GET /api/admin/settings` -> Get admin settings
- `PUT /api/admin/settings` -> Update settings `{ about_us, social_facebook, social_twitter, social_instagram, contact_email }`
- `GET /api/admin/banners` -> Get all banners (active & inactive)
- `POST /api/admin/banners` -> Create new banner `{ title, imageUrl, linkUrl, isActive, order }`
- `PUT /api/admin/banners/:id` -> Update banner fields
- `DELETE /api/admin/banners/:id` -> Delete banner
- `POST /api/admin/game/set-rtp` -> Set user game RTP: `{ vendorCode, username, rtp }` (Expects `username`, not `userCode`)
- `PATCH /api/admin/users/:userId/kyc` -> Update user KYC status: `{ kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' }` (Expects `kycStatus`, not `status`)

### OroPlay Seamless callbacks ↔ Express Backend
- `POST /api/balance` -> Header Basic auth. Body `{ userCode }`. Response `{ success: true, message: "balance", errorCode: 0 }`.
- `POST /api/transaction` -> Header Basic auth. Body `{ userCode, transactionCode, amount, isFinished, isCanceled, gameCode, vendorCode }`. Response `{ success: true, message: "new_balance", errorCode: 0 }`.
- `POST /api/batch-transactions` -> Header Basic auth. Body `{ userCode, transactions: [ { transactionCode, amount } ] }`. Response `{ success: true, message: "new_balance", errorCode: 0 }`.

## Code Layout
- `Frontend/src/app` -> Next.js app routes (pages and API endpoints)
- `Frontend/src/components` -> UI, Feature components (games, filters, footer, header)
- `Frontend/src/lib` -> Client-side OroPlay API wrapper and state providers
- `server/src` -> Express server codebase
- `server/src/controllers` -> Route logic controllers
- `server/src/routes` -> Express route definitions
- `server/src/utils/oroplayApi.js` -> OroPlay backend client wrapper
