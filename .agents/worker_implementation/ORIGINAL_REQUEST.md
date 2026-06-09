## 2026-06-07T14:55:49Z
You are the Implementation Track Worker. Your working directory is `/home/saimon/grp/gamble/.agents/worker_implementation`.
Your task is to implement the Frontend Redesign, Backend/API integration alignments, and Admin panel Banner CRUD setup for the PBBET platform overhaul, according to `/home/saimon/grp/gamble/PROJECT.md` and the explorer findings located at:
- `/home/saimon/grp/gamble/.agents/explorer_frontend_redesign/analysis.md`
- `/home/saimon/grp/gamble/.agents/explorer_api_alignment/analysis.md`
- `/home/saimon/grp/gamble/.agents/explorer_banner_crud/analysis.md`

Specifically, you must:
1. **Align Seamless Wallet APIs**:
   Rewrite Next.js routes under `Frontend/src/app/api/seamless/` (`balance/route.ts`, `transaction/route.ts`, `batch-transactions/route.ts`) to forward incoming POST requests directly to the backend Express server endpoints (using `process.env.NEXT_PUBLIC_BACKEND_URL` which defaults to `http://localhost:5000/api`) by fetching:
   - `POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/balance`
   - `POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/transaction`
   - `POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/batch-transactions`
   Make sure to forward the headers (specifically `Authorization` Basic Auth header) and payload, and return the backend's response directly, bypassing the local memory store `seamless-store.ts`.

2. **Transition Frontend to Light Theme**:
   Overhaul Next.js CSS variables, layout, headers, footers, pages, and components to apply a bright/vibrant light theme. Eliminate all black/dark background colors and purple/indigo styling.
   - In `globals.css`: Update root color variables to light theme shades (bg-slate-50 background, white container, slate-900 high-contrast text, slate-500 muted text, light scrollbar track, light frosted glass for `.liquid-glass` cards, amber/gold gradients for buttons and glows).
   - In `layout.tsx`, update body background styling classes.
   - Update user registration (`register/page.tsx`), login (`login/page.tsx`), and admin login (`admin/login/page.tsx`) to white/slate-100 backgrounds with high-contrast text.
   - Update game lobby (`CasinoGameLobby.tsx`), search bars (`SearchBar.tsx`), and layout headers/footers to light colors, avoiding any dark slate or black classes.
   - Replace the indigo/purple categories style configurations and gradients (e.g. slots header gradients, category configs in helpers) with vibrant gold, amber, and orange colors.
   - Update toast elements to gold/amber instead of purple/blue.

3. **Resolve Admin Dashboard Contract Mismatches**:
   In `Frontend/src/app/admin/page.tsx`:
   - Change set RTP endpoint to POST `${BACKEND_URL}/admin/game/set-rtp`.
   - Update RTP payload keys so `username` maps to the user code input (`username: rtpData.userCode`).
   - Update KYC update patch payload keys to send `{ kycStatus: status }`.
   - Fix the financial transactions requests list mapping by setting the transaction list state using: `Array.isArray(transData) ? transData : transData.requests || []`.

4. **Dynamic Game Categories & Ratings**:
   In `Frontend/src/contexts/GameStoreContext.tsx`, dynamically determine game categories based on name keywords (e.g. "live" if it includes live/lobby/dealer, "table" if it includes table/blackjack/roulette/baccarat/poker/hold'em/holdem/sic bo/craps, and fallback to "slots"), and generate a dynamic rating instead of hardcoding slots and 4.5.

5. **Banner CRUD Setup**:
   In `Frontend/src/app/admin/page.tsx`, add Banners state variables, Sidebar navigation tab trigger ("Banner CMS"), deployment and deletion CRUD request methods connecting to backend `/api/admin/banners`, and the complete CRUD form/grid UI panel (as specified in Section 4 of `explorer_frontend_redesign/analysis.md`).

6. **Verify and Compile**:
   Ensure both the Express backend and the Next.js frontend compile cleanly without syntax, linting, or TypeScript errors:
   - Navigate to `Frontend` and run `npm run build` to verify compilation.
