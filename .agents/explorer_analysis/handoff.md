# Handoff Report

## 1. Observation
I have explored `/home/saimon/grp/gamble` and inspected both Frontend and server files. Below are the key direct observations:

*   **Global Variables & Layout**: In `Frontend/src/app/globals.css`, the default dark theme is defined:
    ```css
    :root {
      --casino-gold: 202 138 4; /* #CA8A04 */
      --casino-gold-light: 234 179 8; /* #EAB308 */
      --casino-primary: 28 25 23; /* #1C1917 */
      --casino-secondary: 68 64 60; /* #44403C */
      --text-primary: 250 250 249; /* #FAFAF9 */
      --text-secondary: 168 162 158; /* #A8A29E */
    }
    body {
      @apply bg-[#0c0a09] text-[#FAFAF9] min-h-screen font-sans antialiased selection:bg-[#CA8A04] selection:text-white;
    ```
*   **Page and Component Colors**: Checked 6 pages and 17 UI components. The layout extensively uses Tailwind dark utility classes like `bg-slate-950`, `bg-slate-900`, `border-slate-800`, `text-slate-500`, and purple-specific colors (e.g., `bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800` for slots in `GameCardHeader.tsx:42`, `bg-purple-500/5` ambient glow in `Header.tsx:17`, `bg-gradient-to-r from-purple-500 to-blue-500` in `Toast.tsx:29`).
*   **Endpoint Mismatches**:
    *   In `Frontend/src/app/admin/page.tsx:89`, the frontend requests:
        `const res = await fetch(`${BACKEND_URL}/admin/set-rtp`, { ... })`
        But in `server/src/routes/adminRoutes.js:21`, the route is defined as:
        `router.post('/game/set-rtp', setGameRTP);`
    *   In `Frontend/src/app/admin/page.tsx:32`, `rtpData` is declared as:
        `const [rtpData, setRtpData] = useState({ userCode: "", vendorCode: "slot-pragmatic", rtp: 90 });`
        But in `server/src/controllers/adminController.js:10-14`, the schema requires `username`:
        ```javascript
        const setRTPSchema = z.object({
          vendorCode: z.string(),
          username: z.string(),
          rtp: z.number().min(30).max(99),
        });
        ```
    *   In `Frontend/src/app/admin/page.tsx:107`, the frontend posts to `/kyc` with:
        `body: JSON.stringify({ status })`
        But in `server/src/controllers/adminController.js:6-8`, the schema expects `kycStatus`:
        ```javascript
        const updateKYCSchema = z.object({
          kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
        });
        ```
*   **Database Config**: Found `DATABASE_URL="mysql://pbbet_admin:pbbet_pass@localhost:3306/pbbet"` in `server/.env`.
*   **Stitch MCP**: Found `stitch_project.json` containing:
    `{"id":1,"jsonrpc":"2.0","result":{"content":[{"text":"Request contains an invalid argument.","type":"text"}],"isError":true}}`
*   **Settings/Banners Workflow**:
    *   Backend schema (`server/prisma/schema.prisma`) defines `SiteSetting` and `Banner` tables.
    *   Frontend `FooterMainContent.tsx:16` fetches Settings from `/api/user/settings` and renders it.
    *   Frontend `Banners.tsx:21` fetches active Banners from `/api/user/banners` and renders it.
    *   Frontend `app/admin/page.tsx` does NOT have UI or endpoints for Banner CRUD management, whereas backend `adminRoutes.js` does support `/banners` (GET, POST, PUT, DELETE).

## 2. Logic Chain
1.  **Colors Overhaul**: Replacing the dark aesthetics requires rewriting the CSS variables inside `globals.css` base layer and mapping custom classes (`bg-casino-dark`, `bg-casino-card`, etc.) to light theme colors. We must also swap dark Tailwind classes (`bg-slate-*`, `text-slate-*`) in pages (`app/admin/page.tsx`, `app/login/page.tsx`, etc.) to bright Tailwind shades (such as `bg-emerald-50`, `text-emerald-950`).
2.  **API Integration**: Due to the three contract mismatches (RTP URL route mismatch, RTP payload key mismatch, KYC payload status mismatch), any integration attempts with the admin panel would fail with `404` or `400` errors. Correcting them in `app/admin/page.tsx` (modifying fetch target to `/game/set-rtp`, mapping `userCode` to `username` in payload, and mapping `status` to `kycStatus` in KYC update) is a prerequisite for a functional admin panel.
3.  **CMS/Banner Alignment**: Since backend exposes Banner CRUD endpoints but the frontend lacks the matching UI inside `app/admin/page.tsx`, we must implement a custom banners tab in the admin dashboard to allow the owner to add, edit, or delete dynamic banners.

## 3. Caveats
*   **Live Database Connection Status**: The live connection of Prisma to the MySQL database and the running status of the MySQL service could not be verified directly via shell command executions due to user terminal authorization prompt timeout. We assumed the connection parameters in `server/.env` are standard and represent the intended database configurations.
*   **Testing Coverage**: There is currently no pre-existing E2E mock testing suite. The mock API tests outlined in the milestones need to be built from scratch.

## 4. Conclusion
The workspace is fully mapped. The frontend possesses a dark, gold-accented "Liquid Glass" theme that needs to be brightened by rewriting CSS theme variables and components. The admin panel integration has critical contract and endpoint discrepancies that must be rectified. Homepage banners have backend support but need admin panel UI forms created to make the CMS complete.

## 5. Verification Method
To verify the findings and overall build status:
1.  Check the API route structures in `server/src/routes/adminRoutes.js` and compare them with fetch requests inside `Frontend/src/app/admin/page.tsx`.
2.  Validate typescript compilation and linter configurations by running:
    *   `npm run build` inside `Frontend`
    *   `npm run dev` inside `server`
