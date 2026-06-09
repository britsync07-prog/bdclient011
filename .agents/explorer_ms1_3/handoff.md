# Handoff Report - explorer_ms1_3

## 1. Observation
I observed the following files, endpoints, and database schema properties in the repository `/home/saimon/grp/gamble`:

1. **Frontend Integration Configuration (`Frontend/src/lib/oroplay.ts`)**:
   * Line 52-73 defines `INTEGRATION_ENDPOINTS` containing the HTTP method, path, and auth flag for all 20 integration endpoints:
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
   * Line 18-34 defines the token creation path `/auth/createtoken`.
   * Line 112-115 defines basic auth verification:
     ```typescript
     export function validateSeamlessAuth(authHeader: string | null) {
       const creds = parseBasicAuth(authHeader);
       return !!creds && creds.id === CLIENT_ID && creds.secret === CLIENT_SECRET;
     }
     ```

2. **Backend Callback Controllers (`server/src/routes/walletRoutes.js` and `server/src/controllers/walletController.js`)**:
   * `walletRoutes.js` lines 10-25 define three endpoints:
     - `POST /api/balance` (mapped to `walletController.getBalance`)
     - `POST /api/transaction` (mapped to `walletController.handleTransaction`)
     - `POST /api/batch-transactions` (mapped to `walletController.handleBatchTransactions`)
   * `walletController.js` line 123 specifies mapping negative amounts to bets and positive to wins:
     ```javascript
     type: transAmount < 0 ? 'BET' : 'WIN',
     ```

3. **Database Provider and Schema (`server/prisma/schema.prisma`)**:
   * Lines 8-11 define the datasource:
     ```prisma
     datasource db {
       provider = "mysql"
       url      = env("DATABASE_URL")
     }
     ```
   * Models `User`, `Transaction`, and `GameSession` define the relationships and columns needed for the integration.

---

## 2. Logic Chain
1. By analyzing `Frontend/src/lib/oroplay.ts` (lines 52-73), we identified the exact method, path, and auth requirements for all 20 integration endpoints.
2. By comparing this list with `api_doc.txt` (which contains version 1.1.1 of the OroPlay API specification), we matched the request parameters and json response structures for all 20 endpoints plus the `/auth/createtoken` method.
3. By examining `server/src/controllers/walletController.js` (lines 11-17, 23-240), we mapped the exact request and response schemas, error codes (`0` for success, `2` for user not found, `4` for insufficient balance, `6` for duplicate transaction), basic auth logic, and Prisma transaction handling for the seamless callbacks.
4. From the database provider setting in `server/prisma/schema.prisma` (lines 8-11), we deduced that a MySQL database is required since Prisma's `provider = "mysql"` cannot be dynamically swapped with SQLite without generating schema diffs and migrations.
5. Combining these observations, we designed a standalone Mock Express server that mimics the exact 20+1 integration APIs, handles auth validation, maintains state statefully in memory, and triggers seamless basic auth callbacks to the Express backend.

---

## 3. Caveats
* **RTP Ranges**: The setting `/game/user/set-rtp` accepts rtp values strictly between 30 and 99. The mock server must enforce this constraint statefully.
* **Database Swapping**: Attempting to run local tests using SQLite will fail due to the MySQL-specific schema directives (e.g., `@db.Decimal(15,2)` and `enum` types). Tests must run against a local MySQL instance (configured via Docker or local service).

---

## 4. Conclusion
We have mapped the exact request/response payloads for all 20 OroPlay endpoints, `/auth/createtoken`, and the seamless wallet callbacks. A standalone mock OroPlay Express server can be launched locally (on a port like `3002`) to handle all these endpoints statefully, providing mock JWTs and sending authenticated Basic Auth callbacks to perform deposits, bets, and wins on the backend. This allows full E2E local testing without external internet dependencies.

---

## 5. Verification Method
To verify that the endpoint mappings match the current project expectations, perform the following:
1. Run the existing frontend endpoint coverage check script:
   ```bash
   npm run verify:api --prefix Frontend
   ```
   *Expected output*: `Endpoint coverage OK: 20/20 integration endpoints mapped.`
2. Inspect the generated analysis report at `.agents/explorer_ms1_3/analysis.md` for a complete reference of each endpoint's request and response structure.
