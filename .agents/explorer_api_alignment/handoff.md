# Handoff Report: API Integration Alignment Investigation

This handoff report is prepared for the next agent to implement the alignment fixes and changes for the PBBET platform overhaul.

---

## 1. Observation

1. **Seamless Wallet Memory-Store Usage**:
   The Next.js API routes `/api/seamless/balance/route.ts`, `/api/seamless/transaction/route.ts`, and `/api/seamless/batch-transactions/route.ts` import storage functions from `Frontend/src/lib/seamless-store.ts`. For example:
   * `Frontend/src/app/api/seamless/balance/route.ts` (lines 11-16):
     ```typescript
     const userCode = String(body?.userCode ?? "").trim();
     ...
     return NextResponse.json({ success: true, message: getUserBalance(userCode), errorCode: 0 });
     ```
   * `Frontend/src/app/api/seamless/transaction/route.ts` (line 24):
     ```typescript
     const balance = applyTransaction(userCode, amount);
     ```

2. **Express Backend Wallet Routes**:
   The backend mounts wallet routes in `server/src/app.js` (line 20):
   ```javascript
   app.use('/api', walletRoutes);
   ```
   And `server/src/routes/walletRoutes.js` (lines 13, 19, 25) maps:
   ```javascript
   router.post('/balance', walletController.getBalance);
   router.post('/transaction', walletController.handleTransaction);
   router.post('/batch-transactions', walletController.handleBatchTransactions);
   ```
   These controllers connect to the MySQL database via Prisma (e.g., `server/src/controllers/walletController.js` line 35):
   ```javascript
   const user = await prisma.user.findUnique({
     where: { id: parseInt(userCode) }
   });
   ```

3. **Admin Dashboard Contract Mismatches**:
   * **Set RTP Endpoint**:
     In `Frontend/src/app/admin/page.tsx` (lines 89-90):
     ```typescript
     const res = await fetch(`${BACKEND_URL}/admin/set-rtp`, {
       method: "POST",
     ```
     But in `server/src/routes/adminRoutes.js` (line 21):
     ```javascript
     router.post('/game/set-rtp', setGameRTP);
     ```
   * **Set RTP Payload**:
     In `Frontend/src/app/admin/page.tsx` (line 32 & 95):
     ```typescript
     const [rtpData, setRtpData] = useState({ userCode: "", vendorCode: "slot-pragmatic", rtp: 90 });
     ...
     body: JSON.stringify(rtpData),
     ```
     But in `server/src/controllers/adminController.js` (lines 10-14):
     ```javascript
     const setRTPSchema = z.object({
       vendorCode: z.string(),
       username: z.string(),
       rtp: z.number().min(30).max(99),
     });
     ```
   * **KYC Update Payload**:
     In `Frontend/src/app/admin/page.tsx` (line 113):
     ```typescript
     body: JSON.stringify({ status }),
     ```
     But in `server/src/controllers/adminController.js` (lines 6-8):
     ```javascript
     const updateKYCSchema = z.object({
       kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
     });
     ```

4. **Hardcoded Games Categories & Ratings**:
   In `Frontend/src/contexts/GameStoreContext.tsx` (lines 97-105):
   ```typescript
   const mappedGames = data.games.map((g: { gameCode: string, gameName: string, provider: string, thumbnail: string, vendorCode: string }) => ({
     id: g.gameCode,
     name: g.gameName,
     provider: g.provider,
     category: "slots", // default
     rating: 4.5,
     thumbnail: g.thumbnail,
     vendorCode: g.vendorCode,
   }));
   ```

---

## 2. Logic Chain

1. **Seamless Wallet Integration**:
   * Since the Express backend already implements the corresponding wallet endpoints backed by a MySQL database via Prisma, the local memory-based `seamless-store.ts` is redundant.
   * By rewriting the Next.js routes under `Frontend/src/app/api/seamless/` to perform a `fetch` request proxying directly to the backend URL (`${BACKEND_URL}/balance`, `${BACKEND_URL}/transaction`, `${BACKEND_URL}/batch-transactions`), the platform ensures a single source of truth (MySQL) and decouples wallet management from Next.js memory.

2. **Admin Dashboard Contract Fixes**:
   * The endpoint `/admin/set-rtp` on the frontend results in a `404 Not Found` because the Express backend maps it to `/api/admin/game/set-rtp`. Changing the request URL in `page.tsx` to `/admin/game/set-rtp` will resolve the routing error.
   * The set RTP request fails with a `400 Bad Request` because the backend validation expects `username` instead of `userCode`. Remapping the payload keys in the request body to `{ username: rtpData.userCode }` aligns it.
   * The KYC status update fails with a `400 Bad Request` because the backend validation expects `kycStatus` instead of `status`. Remapping the request body to `{ kycStatus: status }` aligns it.

3. **Dynamic Game Categories & Ratings**:
   * Currently, the API listing route on the backend `userController.js` only provides basic fields (`gameCode`, `gameName`, `provider`, `thumbnail`, `vendorCode`).
   * By adding category and rating inference logic based on vendor codes (e.g. `evolution` maps to `live`, `slot` maps to `slots`) and game titles, and propagating these keys to the API response, we can dynamically render filters and ratings.
   * To prevent client errors if the fields are missing or not resolved, matching fallback logic is defined in `GameStoreContext.tsx`.

---

## 3. Caveats

* **Assumed Base URL**: The Next.js frontend uses `process.env.NEXT_PUBLIC_BACKEND_URL` to point to the backend Express server, defaulting to `http://localhost:5000/api`. The proxy calls assume this URL structure is available and configured.
* **OroPlay Sandbox API**: The rating and category structures are mapped dynamically because the upstream OroPlay API sandbox response lacks explicit fields for category types and ratings.

---

## 4. Conclusion

The designed API integrations and contract alignment fixes are ready for implementation. The implementation requires modifying the Next.js wallet routes, the frontend admin dashboard page, the Express user controller, and the client game context file. The `seamless-store.ts` file can be safely deleted or marked as obsolete.

---

## 5. Verification Method

To verify the integration, the following steps must be taken:
1. **Frontend Project Check**:
   Run `npm run build` or `npm run prod:check` inside the `Frontend` directory to verify there are no TypeScript or compilation errors.
2. **Backend Server Integration Check**:
   Run the backend development server using `npm run dev` in the `server` directory, launch the frontend using `npm run dev` in the `Frontend` directory, and test the Admin dashboard (`/admin`) actions:
   * Change a user's KYC status and verify it successfully updates the database (query the `User` table or reload the list).
   * Submit an RTP adjustment for a user and verify the request does not return a `400/404` validation error.
3. **Endpoint Tests**:
   Execute calls to the wallet callback routes (using test scripts or curl requests containing OroPlay Basic Auth) and verify the balances are updated dynamically in the MySQL database instead of the `seamless-store.ts` memory log.
