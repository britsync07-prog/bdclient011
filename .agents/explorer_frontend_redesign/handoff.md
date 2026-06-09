# Handoff Report — Frontend Redesign & Audit

**Date**: 2026-06-07  
**Working Directory**: `/home/saimon/grp/gamble/.agents/explorer_frontend_redesign`  
**Milestone**: Next.js Frontend Redesign Overhaul Prep  

---

## 1. Observation

Direct observations made within the codebase are quoted below:

### A. Dark/Black/Purple Styling Patterns
*   **Globals CSS (`globals.css`)**:
    *   Lines 7-10: 
        ```postcss
        --casino-primary: 28 25 23; /* #1C1917 */
        --casino-secondary: 68 64 60; /* #44403C */
        --text-primary: 250 250 249; /* #FAFAF9 */
        --text-secondary: 168 162 158; /* #A8A29E */
        ```
    *   Line 19: `body { @apply bg-[#0c0a09] text-[#FAFAF9] ... }`
    *   Line 34: `::-webkit-scrollbar-track { @apply bg-[#1C1917]; }`
    *   Line 42: `.liquid-glass { background: rgba(255, 255, 255, 0.03); ... }`
    *   Line 95: `.glass-card { background: linear-gradient(145deg, rgba(28,25,23,0.8) 0%, rgba(12,10,9,0.9) 100%); ... }`
*   **App Layout (`app/layout.tsx`)**:
    *   Line 23: `themeColor: "#0c0a09",`
    *   Line 33: `<body suppressHydrationWarning={true} className="bg-[#0c0a09] text-white">`
*   **Slots Category Configuration (`helpers.ts` & `GameCardHeader.tsx`)**:
    *   `helpers.ts` Line 7: `color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",` (Indigo slots badges).
    *   `GameCardHeader.tsx` Line 42: `? "bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800"` (Indigo/Purple slots cards headers).
*   **Toasts & Glows (`Toast.tsx` & `SearchBar.tsx`)**:
    *   `Toast.tsx` Line 29: `className="glass bg-gradient-to-r from-purple-500 to-blue-500 ..."`
    *   `SearchBar.tsx` Line 53: `<div className="absolute -bottom-2 right-8 w-3 h-3 bg-purple-400/20 ... font-medium"`

### B. Integration Mismatches
*   **RTP Endpoint in Frontend (`app/admin/page.tsx`)**:
    *   Line 89: `const res = await fetch(\`${BACKEND_URL}/admin/set-rtp\`, {`
    *   Line 95: `body: JSON.stringify(rtpData),` (Sends `{ userCode, vendorCode, rtp }`)
*   **RTP Endpoint in Backend Route (`adminRoutes.js`)**:
    *   Line 21: `router.post('/game/set-rtp', setGameRTP);` (mounted under `/admin`, resulting in `/admin/game/set-rtp`)
*   **RTP Validation in Backend Controller (`adminController.js`)**:
    *   Lines 10-14:
        ```javascript
        const setRTPSchema = z.object({
          vendorCode: z.string(),
          username: z.string(),
          rtp: z.number().min(30).max(99),
        });
        ```
*   **KYC Endpoint Payload Mismatch**:
    *   Frontend (`app/admin/page.tsx` line 113): `body: JSON.stringify({ status }),`
    *   Backend Zod Schema (`adminController.js` lines 6-8):
        ```javascript
        const updateKYCSchema = z.object({
          kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
        });
        ```
*   **Financial Requests Array Loading**:
    *   Frontend (`app/admin/page.tsx` line 59): `setTransactions(transData.requests || []);`
    *   Backend (`adminController.js` line 100): `res.json(requests);` (Returns the array directly rather than inside a wrapping JSON object).
*   **Hardcoded Game Lobby Mappings**:
    *   Frontend Store (`contexts/GameStoreContext.tsx` lines 101-102):
        ```typescript
        category: "slots", // default
        rating: 4.5,
        ```

### C. Missing Banner CMS
*   **Frontend Dashboard Admin (`app/admin/page.tsx`)**:
    *   No references, buttons, forms, tables, or tabs relating to "banner" or `admin/banners` exist in the file.
*   **Backend Banner Routing (`adminRoutes.js`)**:
    *   Lines 26-29: Banners CRUD routes are fully configured (`GET`, `POST`, `PUT`, `DELETE`).

---

## 2. Logic Chain

1. **Theme Redesign**:
   - Because the platform overhaul requires "strictly avoiding dark/purple/black" and implementing a "light, bright, and vibrant theme," modifying the CSS variables (e.g. `--casino-primary` and `--text-primary`) is the most efficient and scalable solution.
   - White backgrounds require dark-slate text colors for high-contrast accessibility compliance.
   - Gold/amber tones (`#CA8A04` and `#EAB308`) are vibrant, fit the premium gaming design system, and can replace all purple accent components and glow particles cleanly.

2. **Integration Error Analysis**:
   - Since the backend defines the RTP route as `/game/set-rtp` and expects `username` in the schema, the frontend's request to `/admin/set-rtp` with payload `userCode` will cause `404` and `400` errors respectively.
   - Since the backend KYC schema enforces the `kycStatus` field, the frontend's payload of `{ status }` will trigger a validation error (`400 Bad Request`).
   - Because the backend `res.json(requests)` returns a JSON array, the frontend's expectation of `transData.requests` will result in `undefined`, causing the dashboard list to remain empty.
   - Hardcoding the category to "slots" makes category filters broken for dynamically loaded games, which requires a dynamic client-side matcher.

3. **Banner CMS integration**:
   - The backend contains fully developed endpoints for banners. Implementing a dedicated sidebar tab, form, and list handler in `app/admin/page.tsx` will restore parity and enable complete banner CRUD capabilities.

---

## 3. Caveats

- **Iframe Games Integration**: The game launching opens the OroPlay sandbox link in a new window (`window.open(..., "_blank")`). Redesigning the iframe layout itself will depend on OroPlay provider styling options.
- **Database Status**: The MySQL database schema is mapped via Prisma, but active connection execution was not tested inside this read-only report scope.

---

## 4. Conclusion

The Next.js frontend is fully mapped and ready for implementer overhaul. A robust light theme design has been established, and the precise file line ranges with changes are detailed in `analysis.md`. The 4 integration contract mismatches must be resolved synchronously with color replacements, and the missing Banner CMS UI panel must be injected to conclude Milestone 3 & 4.

---

## 5. Verification Method

Once changes are applied by the implementer agent, the following commands must be run inside the `Frontend` directory:

1. **Verify Compilation and Typings**:
   ```bash
   npm run prod:check
   ```
   *Should build successfully without TypeScript or Linter compilation failures.*

2. **Verify API Endpoints Integrity**:
   ```bash
   npm run verify:api
   ```
   *Should execute the API endpoint validation script successfully.*

3. **Inspect Layout and Color Parity**:
   Open browser at `http://localhost:3000/` and `/admin` to verify that:
   - Body backdrop is light slate, text is dark slate, and headers are readable.
   - Category filter buttons are styled in clean light accents.
   - Saving RTP levels and KYC status succeeds without throwing `400` or `404` errors.
   - Banners are listable and manageable under the new "Banners CMS" tab.
