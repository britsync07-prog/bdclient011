# Handoff Report — ms1_2 Explorer

## 1. Observation

We directly examined and confirmed:
* **Backend Utility**: `/home/saimon/grp/gamble/server/src/utils/oroplayApi.js`
  Lines 7-33 contain the implementation for `/auth/createtoken` request:
  ```javascript
  const response = await fetch(`${API_BASE_URL}/auth/createtoken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
  });
  ```
  Lines 47-121 map functions `getVendors`, `getGames`, `getLaunchUrl`, `setUserRTP`.
* **Frontend Config**: `/home/saimon/grp/gamble/Frontend/src/lib/oroplay.ts`
  Lines 52-73 define all 20 integration endpoints:
  ```typescript
  export const INTEGRATION_ENDPOINTS = {
    status: { method: "GET", path: "/status", auth: false },
    vendorsList: { method: "GET", path: "/vendors/list", auth: true },
    gamesList: { method: "POST", path: "/games/list", auth: true },
    gameDetail: { method: "POST", path: "/game/detail", auth: true },
    gameLaunchUrl: { method: "POST", path: "/game/launch-url", auth: true },
    bettingHistoryById: { method: "POST", path: "/betting/history/by-id", auth: true },
    transactionHistoryById: { method: "POST", path: "/transaction/history/by-id", auth: true },
    agentBalance: { method: "GET", path: "/agent/balance", auth: true },
    userCreate: { method: "POST", path: "/user/create", auth: true },
    userBalance: { method: "POST", path: "/user/balance", auth: true },
    userDeposit: { method: "POST", path: "/user/deposit", auth: true },
    userWithdraw: { method: "POST", path: "/user/withdraw", auth: true },
    userWithdrawAll: { method: "POST", path: "/user/withdraw-all", auth: true },
    userBalanceHistory: { method: "POST", path: "/user/balance-history", auth: true },
    setUserRtp: { method: "POST", path: "/game/user/set-rtp", auth: true },
    getUserRtp: { method: "POST", path: "/game/user/get-rtp", auth: true },
    resetUsersRtp: { method: "POST", path: "/game/users/reset-rtp", auth: true },
    bettingHistoryByDateV2: { method: "POST", path: "/betting/history/by-date-v2", auth: true },
    bettingHistoryDetailPage: { method: "POST", path: "/betting/history/detail", auth: true },
    batchUsersRtp: { method: "POST", path: "/game/users/batch-rtp", auth: true },
  } as const;
  ```
* **Seamless Callback Controllers**: `/home/saimon/grp/gamble/server/src/controllers/walletController.js`
  Lines 23-60 contain `getBalance` callback (`POST /api/balance`).
  Lines 66-154 contain `handleTransaction` callback (`POST /api/transaction`).
  Lines 160-239 contain `handleBatchTransactions` callback (`POST /api/batch-transactions`).
* **Seamless Auth Middleware**: `/home/saimon/grp/gamble/server/src/middleware/walletAuthMiddleware.js`
  Extracts and validates Basic Authentication credentials against `process.env.OROPLAY_CLIENT_ID` and `process.env.OROPLAY_CLIENT_SECRET`.
* **Prisma Schema**: `/home/saimon/grp/gamble/server/prisma/schema.prisma`
  Uses the `mysql` provider and `env("DATABASE_URL")` datasource (lines 8-11). Contains models `User`, `Transaction`, `GameSession`.
* **Official Specification**: `/home/saimon/grp/gamble/api_doc.txt`
  Details the exact schemas, rate-limiting policies, error codes, and request/response payloads for all OroPlay and Operator callback endpoints.

---

## 2. Logic Chain

1. **Mapping request/response structures**:
   * Inspecting `Frontend/src/lib/oroplay.ts` and `api_doc.txt` allowed matching every endpoint in `INTEGRATION_ENDPOINTS` to its corresponding request body parameters and JSON response structures.
2. **Developing the Mock Server design**:
   * Since `oroplayApi.js` depends on `OROPLAY_BASE_URL` from the environment, configuring this variable to point to a local Express server allows it to capture all outbound calls.
   * By mocking `/auth/createtoken` to return a JWT with an `expiration` claim, the caller's cache validation checks (`tokenCache.expiresAtUnix - 30 > now`) will successfully pass.
   * Simulating player activities (bets/wins) requires making Basic Auth authenticated calls to the operator's callback endpoints on PBBET, which we can simulate by triggering an in-memory game round loop in the mock server.
3. **Database connection & testing strategy**:
   * Since Prisma reads `DATABASE_URL` from the environment, isolating tests requires setting a different connection string (e.g. `pbbet_test`). Running `prisma db push` on startup and executing `TRUNCATE` commands on database models between test cases guarantees fresh state per E2E test.

---

## 3. Caveats

* The API rate-limiting rules outlined in `api_doc.txt` (e.g., 5 requests per 30 seconds for token creation, 1 per second for history, 1 per 3 seconds for batch RTP) should be simulated or bypassed during E2E tests depending on the test suite's speed requirements. We recommend bypassing or making limits configurable.
* The local database configuration assumes a running MySQL instance is available locally. If developers don't have local MySQL, running a temporary MySQL container via Docker is required.

---

## 4. Conclusion

A standalone mock OroPlay server (Express) can completely replicate all 20 integration endpoints, authentication generation, and trigger seamless callback simulations. By combining this mock server with test database isolation (using a separate test database URL, migrations via `prisma db push`, and database truncations), developers can execute robust E2E integration tests locally without external internet access or real vendor accounts.

---

## 5. Verification Method

To verify the details in this report:
1. Inspect the endpoint list defined in `Frontend/src/lib/oroplay.ts`.
2. Inspect the schemas in the `api_doc.txt` file at the root of the project to cross-reference request parameters and response parameters.
3. Inspect `server/src/controllers/walletController.js` and `server/src/middleware/walletAuthMiddleware.js` to verify Basic Auth setup and the request parameters handled in callbacks.
4. Run `npx prisma version` in `/home/saimon/grp/gamble/server` to confirm current Prisma database CLI options.
