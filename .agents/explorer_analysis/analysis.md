# PBBET iGaming Platform Exploration Report

**Date**: 2026-06-07  
**Status**: Exploration Completed  
**Focus**: Workspace Overhaul Preparation (Color Redesign, API Mismatches, Database, Settings/Banner Workflows)

---

## Executive Summary

A comprehensive read-only exploration was performed on the `gamble` workspace. The Next.js frontend has a dark themed "Liquid Glass" design system utilizing near-black backgrounds (`#0c0a09`, `#1C1917`), dark slates (`bg-slate-900`, `bg-slate-950`), and purple/indigo accents (for slots categories, buttons, glows, and toasts).

During the inspection of the frontend-backend API integration, **three critical contract mismatches** were identified that will break the admin dashboard integration if left unresolved. Additionally, the backend supports CRUD operations for homepage banners, but the frontend admin panel currently lacks the UI implementation to manage them.

---

## 1. Frontend Pages & Components Utilizing Dark, Black, or Purple Colors

To transition the platform to a bright and vibrant color palette, the following CSS variables, pages, and components must be overhauled. Every occurrence of black, dark, slate, gray, or purple color classes should be replaced.

### A. Global Styles (`Frontend/src/app/globals.css`)
*   **Root Variables** (lines 4-11):
    *   `--casino-primary: 28 25 23; /* #1C1917 */` (Charcoal background color)
    *   `--casino-secondary: 68 64 60; /* #44403C */` (Dark gray accent)
    *   `--text-primary: 250 250 249; /* #FAFAF9 */` (Light text)
    *   `--text-secondary: 168 162 158; /* #A8A29E */` (Muted gray text)
*   **Body Base Styles** (lines 18-23):
    *   `body { @apply bg-[#0c0a09] text-[#FAFAF9]; }` (Near black body)
    *   `background-image: radial-gradient(circle at top right, rgba(202, 138, 4, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.05), transparent 40%);` (Needs review for light theme compatibility)
*   **Scrollbar** (lines 29-39):
    *   `::-webkit-scrollbar-track { @apply bg-[#1C1917]; }` (Dark scrollbar track)
*   **Utility & Class Overlays** (lines 41-105):
    *   `.liquid-glass` (line 42): `background: rgba(255, 255, 255, 0.03)` with `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)` (Overlay is dark and translucent)
    *   `.btn-premium` (line 72): `color: #0c0a09` (Uses near black text color)
    *   `.glass-card` (line 94): `background: linear-gradient(145deg, rgba(28,25,23,0.8) 0%, rgba(12,10,9,0.9) 100%)` (Dark gradient card)

### B. Route Pages (`Frontend/src/app`)
*   **`app/admin/login/page.tsx`**:
    *   `bg-slate-950` (line 47, 60, 71): Page background and input fields
    *   `bg-slate-900` (line 48): Center card background
    *   `border-slate-800` (line 48, 60, 71): Borders
    *   `text-slate-500` (line 51, 55, 66): Subtext and labels
    *   `placeholder:text-slate-800` (line 60, 71): Dark input placeholder text
    *   `text-white` (line 60, 71, 84): Inputs and button text
*   **`app/admin/page.tsx`**:
    *   `bg-slate-950` (line 165, 320, 330, 367, 377, 386, 395): Page background, select, and input fields
    *   `bg-slate-900` (line 233, 279, 310, 358): Table and card container backgrounds
    *   `bg-slate-800` (line 248): Default avatar circle
    *   `bg-slate-800/50` (line 235, 281): Table headers
    *   `bg-slate-800/20` (line 245, 294): Row hover background
    *   `border-slate-800` (line 233, 279, 310, 358): Table and card borders
    *   `border-slate-700` (line 248, 320, 330, 367, 377, 386, 395): Inputs, dropdown, and avatar borders
    *   `text-slate-500` (line 207, 235, 248, 281, 291, 317, 328, 339, 365, 374, 383, 392, 439): General muted text
    *   `text-slate-200` (line 251): Table username font
    *   `text-slate-100` (line 165): Sidebar/dashboard wrapper text
    *   `divide-slate-800/50` (line 243, 289): Table row dividers
    *   `bg-black/20` (line 419): Selected sidebar item background
    *   `bg-black/10` (line 192): Logout container background
    *   `text-white` (line 169, 195, 206, 211, 299, 312, 320, 330, 350, 360, 367, 377, 386, 395, 400, 419, 420, 440)
*   **`app/layout.tsx`**:
    *   `themeColor: "#0c0a09"` (line 23): Viewport theme
    *   `bg-[#0c0a09] text-white` (line 33): Root body classes
*   **`app/login/page.tsx`**:
    *   `bg-slate-950` (line 42, 55, 66): Page background and inputs
    *   `bg-slate-900` (line 43): Login container
    *   `border-slate-800` (line 43): Card border
    *   `border-slate-700` (line 55, 66): Input borders
    *   `text-slate-400` (line 46): Welcome tagline text
    *   `text-slate-300` (line 50, 61): Input labels
    *   `text-slate-100` (line 55, 66): Input values text
    *   `text-slate-500` (line 81): Signup link prefix text
*   **`app/register/page.tsx`**:
    *   `bg-slate-950` (line 47, 60, 71, 82): Page background and inputs
    *   `bg-slate-900` (line 48): Register card background
    *   `border-slate-800` (line 48): Card border
    *   `border-slate-700` (line 60, 71, 82): Input borders
    *   `text-slate-400` (line 51): Subtitle text
    *   `text-slate-300` (line 55, 66, 77): Labels
    *   `text-slate-100` (line 60, 71, 82): Input values text
    *   `text-slate-500` (line 97): Login link prefix text

### C. Components (`Frontend/src/components`)
*   **`ErrorBoundary.tsx`**:
    *   `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900` (line 33): Dark background gradient
    *   `from-purple-500 to-blue-500` and `hover:from-purple-600 hover:to-blue-600` (line 44): Purple CTA button gradient
    *   `text-gray-300` (line 39): Muted description text
*   **`features/banners/Banners.tsx`**:
    *   `shadow-black/50` (line 38): Dark shadow overlay
    *   `border-white/10` (line 38): Slideshow border
    *   `from-slate-900` (line 47): Gradient overlay for banner text contrast
    *   `text-slate-900` (line 52): Muted action button text
*   **`features/games/CasinoGameLobby.tsx`**:
    *   `bg-[#0c0a09]` (line 152): Lobby background
    *   `bg-[#0c0a09]/50` (line 158): Sidebar background
    *   `border-white/10` (line 158, 202): Sidebar and wallet dividers
    *   `bg-white/5` (line 175, 202): Hover state background and wallet card
    *   `text-[#A8A29E]` (line 175, 178, 191, 205, 213, 217, 232): Muted navigation links, tags, and subtext
*   **`features/games/GameGrid.tsx`**:
    *   `bg-white/5` (line 33): Games indicator bar background
    *   `border-white/10` (line 33): Indicator bar border
    *   `text-purple-400 hover:text-purple-300` (line 47): Reset filter button (Purple link color)
*   **`features/games/card/GameCard.tsx`**:
    *   `text-gray-600` (line 46): Unfilled star rating icon color
    *   `glass-card` (line 56): Uses the dark linear gradient defined in `globals.css`
*   **`features/games/card/GameCardContent.tsx`**:
    *   `bg-casino-card` (line 27): Dark background helper class (maps to charcoal background)
    *   `border-t border-yellow-400/10` (line 27): Top highlight border
    *   `text-accessible-primary` (line 29) & `text-accessible-secondary` (line 32): Standard light texts
    *   `focus-visible:ring-black` & `focus-visible:ring-offset-black` (line 61): Dark ring focus offsets
*   **`features/games/card/GameCardHeader.tsx`**:
    *   `bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800` (line 42): Slots background gradient (indigo/purple)
    *   `to-black/20` (line 51) & `from-black/80 via-black/20` (line 60): Dark contrast masks
    *   `focus-visible:ring-offset-black` (line 102, 124) & `focus-visible:ring-black` (line 124): Focus configurations
    *   `from-white/20 to-white/10 border-white/30 hover:from-white/30 hover:to-white/20` (line 105): Muted unfavorited button
*   **`features/search/SearchBar.tsx`**:
    *   `bg-white/5` (line 18): Input box container background
    *   `border-white/20` (line 18): Input box border
    *   `bg-purple-400/20` (line 53): Purple glowing ambient particle
*   **`layout/Header.tsx`**:
    *   `bg-casino-dark` (line 14): Header dark background
    *   `border-b border-yellow-400/20` (line 14): Bottom divider border
    *   `bg-purple-500/5` (line 17): Purple ambient glow particle
    *   `text-gradient-purple` (line 34): Purple subtitle text
    *   `glass` (line 45, 59): Translucent dark cards
*   **`layout/footer/Footer.tsx`**:
    *   `bg-casino-dark` (line 7): Footer background
    *   `border-t border-yellow-400/20` (line 7): Top divider border
    *   `from-black/50` (line 8): Bottom ambient gradient
*   **`layout/footer/FooterBottomSection.tsx`**:
    *   `border-t border-yellow-400/20` (line 20): Divider border
    *   `text-yellow-200/60`, `text-yellow-400/40`, `text-yellow-300/50` (lines 23, 27, 37): Yellow text shades optimized for dark mode contrast
    *   `glass` (line 45): Translucent dark banner background
    *   `border-yellow-400/20` (line 45): Card border
    *   `text-yellow-200/90`, `text-yellow-400/70` (lines 48, 53, 58, 61): Warning text colors
*   **`layout/footer/FooterMainContent.tsx`**:
    *   `hover:casino-glow-purple` (line 36, 93): Hover glow color class
    *   `glass` (line 86, 93, 100): Social buttons background
    *   `border-yellow-400/20` (line 86, 93, 100): Social button borders
    *   `text-yellow-200/70` (line 71, 111): Section link colors
*   **`ui/EmptyState.tsx`**:
    *   `glass` (line 13, 34): Card background overlays
    *   `border-casino-glow` (line 13, 34): Overlay highlight border
    *   `casino-glow-purple` (line 27): Purple glowing halo background effect
    *   `text-yellow-200/80` (line 35): Muted text description
*   **`ui/FilterButtons.tsx`**:
    *   `border-yellow-400/20` (line 17): Muted buttons outline
    *   `text-yellow-200/80` (line 17): Inactive button text
    *   `bg-black/30` (line 30): Dark badge overlay background
    *   `border-yellow-300/50` (line 41, 42): Corner highlighted lines
*   **`ui/LoadingSpinner.tsx`**:
    *   `bg-casino-dark` (line 12): Full-screen background
    *   `bg-purple-500/5` (line 15): Purple ambient glow background
    *   `bg-red-500/5` (line 16): Red ambient glow background
    *   `glass` (line 48): Center dialog container
    *   `border-casino-glow` (line 48): Dialog highlight border
    *   `text-yellow-200/80` (line 49): Muted subtitle
*   **`ui/Toast.tsx`**:
    *   `glass` (line 29): Container glass block
    *   `bg-gradient-to-r from-purple-500 to-blue-500` (line 29): Purple to blue toast background

### D. Category Colors Configuration (`Frontend/src/utils/helpers.ts`)
*   **`CATEGORY_CONFIG`** (lines 4-25):
    *   `slots`: `color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"` (Uses indigo styling)
    *   `all` & `DEFAULT_CONFIG` (lines 20, 27): `color: "bg-gray-500/20 text-gray-300 border-gray-500/30"` (Uses gray styling)

---

## 2. Frontend-Backend API Interaction & Mismatch Auditing

### A. Environment Configuration
The frontend and backend interact using two environment files:
1.  **Frontend Env (`Frontend/.env`)**:
    *   `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api` (Root backend API endpoint)
2.  **Backend Env (`server/.env`)**:
    *   `DATABASE_URL="mysql://pbbet_admin:pbbet_pass@localhost:3306/pbbet"` (MySQL database endpoint)
    *   `JWT_SECRET="pbbet_super_secret_jwt_2026"` (User session token validation secret)
    *   `PORT=5000` (Backend API listener port)
    *   `OROPLAY_BASE_URL="https://bs.sxvwlkohlv.com/api/v2"` (OroPlay API v2 sandbox endpoint)
    *   `OROPLAY_CLIENT_ID="RSU2"` (OroPlay credentials)
    *   `OROPLAY_CLIENT_SECRET="UoHxygREc2f238EbEBYxEjMR3xoZJP55"` (OroPlay client signature key)

### B. Authentication Workflow
*   Frontend auth tokens are stored in `localStorage` as `"token"`.
*   Requests to protected routes (like `/api/user/profile`, `/api/user/launch`, and `/api/admin/*`) include the token in the request header:
    `Authorization: Bearer <token>`
*   The backend validates the token using `server/src/middleware/authMiddleware.js`.

### C. 🔍 Critical Contract Mismatches Found
The following bugs will prevent the admin dashboard from communicating successfully with the Express backend:

1.  **Endpoint Mismatch for Game RTP Setting**:
    *   *Frontend Request* (`app/admin/page.tsx` line 89): POST request is sent to `${BACKEND_URL}/admin/set-rtp`.
    *   *Backend Routing* (`routes/adminRoutes.js` line 21): Express expects the POST request at `/game/set-rtp` (which translates to `/api/admin/game/set-rtp`).
    *   *Result*: Frontend request will fail with a `404 Not Found`.

2.  **Payload Mismatch for Game RTP Setting**:
    *   *Frontend Payload* (`app/admin/page.tsx` lines 32, 95): Sends `{ userCode: string, vendorCode: string, rtp: number }`.
    *   *Backend Validation* (`controllers/adminController.js` lines 10-14, 156): Zod schema requires `username` instead of `userCode`:
        ```javascript
        const setRTPSchema = z.object({
          vendorCode: z.string(),
          username: z.string(),
          rtp: z.number().min(30).max(99),
        });
        ```
    *   *Result*: Backend will fail with a `400 Bad Request` (Zod validation error: `username` is required).

3.  **Payload Mismatch for KYC Status Update**:
    *   *Frontend Payload* (`app/admin/page.tsx` line 107): Patches to `/admin/users/:userId/kyc` with payload `JSON.stringify({ status })`.
    *   *Backend Validation* (`controllers/adminController.js` lines 6-8, 63): Zod schema expects `kycStatus` instead of `status`:
        ```javascript
        const updateKYCSchema = z.object({
          kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
        });
        ```
    *   *Result*: Backend will throw a `400 Bad Request` validation error.

4.  **Frontend-side Hardcoded Game Category and Rating Mapping**:
    *   *Frontend Mapping* (`contexts/GameStoreContext.tsx` lines 101-102): When games lists are retrieved from the backend API `/api/user/games`, the mapping hardcodes the category to `"slots"` and rating to `4.5`:
        ```javascript
        category: "slots", // default
        rating: 4.5,
        ```
    *   *Result*: Category filtering (e.g. Table Games, Live Games) on the frontend lobby is functionally broken because all dynamically loaded games are treated as slots.

---

## 3. Backend Database Connection Status

*   **Database Engine**: MySQL
*   **Database Connection URL**: `mysql://pbbet_admin:pbbet_pass@localhost:3306/pbbet`
*   **Database Schema**: Documented via Prisma Schema (`server/prisma/schema.prisma`). It defines:
    *   `User`: Keeps track of balance as a high-precision `Decimal(15, 2)`, role (`USER`, `ADMIN`, `AFFILIATE`), and KYC status (`PENDING`, `APPROVED`, `REJECTED`).
    *   `Transaction`: Keeps track of operator-side deposits/withdrawals/bets/wins and stores reference `oroPlayHistoryId` for callbacks.
    *   `SiteSetting`: Dynamic key-value store for public layout parameters.
    *   `Banner`: Dynamic homepage banner slider management.
*   **Investigation Caveat**: Live database process execution/connection status could not be verified via system command execution due to user terminal authorization prompt timeout.

---

## 4. Stitch MCP & NPM Commands Status

*   **Stitch Configuration**: A file named `stitch_project.json` is present in the root of the workspace. However, it contains an invalid JSON RPC error output:
    `{"id":1,"jsonrpc":"2.0","result":{"content":[{"text":"Request contains an invalid argument.","type":"text"}],"isError":true}}`
    This indicates that the configuration is invalid or corrupted.
*   **NPM Scripts & Packages**:
    *   Neither the Frontend (`Frontend/package.json`) nor the Backend (`server/package.json`) contains dependencies or scripts related to `stitch` or other MCP interfaces.
    *   Current npm development workflows are standard:
        *   Frontend: `npm run dev` (`next dev --turbopack`), `npm run build`, `npm run prod:check`.
        *   Backend: `npm run start`, `npm run dev` (`nodemon src/server.js`).

---

## 5. Current Workflow of Site Settings & Banners

### A. Site Settings Workflow
The site settings control public texts and links (such as "About Us" and social media links) dynamically.

```
+------------------+         PUT /api/admin/settings         +-------------------------+
|                  | --------------------------------------> |                         |
|  Admin Dashboard |                                         |   Express CMS Router    |
| (Frontend Admin) | <-------------------------------------- |  (adminCmsController)   |
|                  |         GET /api/admin/settings         |                         |
+------------------+                                         +-------------------------+
                                                                          |
                                                                          | CRUD using Prisma
                                                                          v
+------------------+          GET /api/user/settings         +-------------------------+
|   Public Site    | <-------------------------------------- |   MySQL Database Table  |
| (Frontend Footer)|                                         |      (SiteSetting)      |
+------------------+                                         +-------------------------+
```

1.  **Database Storage**: Site settings are stored in the `SiteSetting` table with `key` and `value` fields. Default records are seeded in `server/prisma/seed.js`:
    *   `about_us` -> "Welcome to PBBET, the premier destination for live casino..."
    *   `social_facebook` -> "https://facebook.com/pbbet"
    *   `social_twitter` -> "https://twitter.com/pbbet"
    *   `social_instagram` -> "https://instagram.com/pbbet"
    *   `contact_email` -> "support@pbbet.com"
2.  **Admin Customization**:
    *   Admin visits `/admin` on the frontend, which fetches the settings from GET `/api/admin/settings`.
    *   Admin updates values and submits. This sends a PUT request to `/api/admin/settings` with the updated JSON payload.
    *   The backend calls `SettingService.updateSettings()` which upserts each key/value pair in the database in a single transaction.
3.  **Public Consumption**:
    *   The footer component (`FooterMainContent.tsx`) executes a client-side fetch to GET `/api/user/settings` when mounted.
    *   It renders the database values, falling back to static strings defined in `constants/index.ts` if the API call fails or value is missing.

### B. Banners Workflow
Banners control the homepage slider content dynamically.

```
                                                             +-------------------------+
                                                             |   Express CMS Router    |
                                                             |  (adminCmsController)   |
                                                             +-------------------------+
                                                                          |
                                                                          | CRUD using Prisma
                                                                          v
+------------------+          GET /api/user/banners          +-------------------------+
|   Public Site    | <-------------------------------------- |   MySQL Database Table  |
| (Frontend Slider)|                                         |        (Banner)         |
+------------------+                                         +-------------------------+
```

1.  **Database Storage**: Homepage sliders are stored in the `Banner` table (`id`, `title`, `imageUrl`, `linkUrl`, `isActive`, `order`). A default banner is seeded during server database setup.
2.  **Public Consumption**:
    *   The main page slider component (`Banners.tsx`) makes a client-side fetch to GET `/api/user/banners` when loaded.
    *   The backend executes `SettingService.getActiveBanners()`, returning only banners where `isActive: true`, sorted in ascending order by their `order` index.
    *   The frontend renders these banners as a slideshow.
3.  **Admin Gaps (Crucial Finding)**:
    *   The backend Express router has fully functional CRUD endpoints for banner management:
        *   `GET /api/admin/banners` (Lists all banners)
        *   `POST /api/admin/banners` (Creates new banner)
        *   `PUT /api/admin/banners/:id` (Updates banner details/status)
        *   `DELETE /api/admin/banners/:id` (Deletes banner)
    *   **However, the frontend admin dashboard page (`app/admin/page.tsx`) contains no UI tab, forms, or actions to manage banners.** Banners can currently only be configured by directly editing the database records or hit endpoints manually.

---

## Conclusion & Action Items for overhaul:
1.  **UI Redesign**: Overhaul `globals.css` variable rules to light theme shades, adjust the translucent `liquid-glass` cards, swap `bg-slate-900/950` classes across pages/components, and eliminate indigo/purple backgrounds in the game categories.
2.  **Fix Mismatches**:
    *   Update `app/admin/page.tsx` line 89 to hit `/admin/game/set-rtp` and map `userCode` to `username` inside the payload.
    *   Update `app/admin/page.tsx` line 107 to map `status` to `kycStatus` inside the PATCH body.
3.  **Implement Banner UI**: Add a banner management panel under the Admin interface (`app/admin/page.tsx`) that links to the backend `/api/admin/banners` CRUD endpoints.
4.  **Fix Category and Rating Mappings**: Update `GameStoreContext.tsx` mapping to parse the actual category (Slots, Table, Live) and dynamically retrieve ratings instead of hardcoding.
