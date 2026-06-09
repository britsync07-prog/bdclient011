# Handoff Report — Explorer MS1.1

## 1. Observation
- Located the client-side Next.js OroPlay API wrapper at `Frontend/src/lib/oroplay.ts` containing the endpoint definitions:
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
- Located the backend server-side client at `server/src/utils/oroplayApi.js` implementing key methods such as `createToken()`, `getVendors()`, `getGames()`, `getLaunchUrl()`, and `setUserRTP()`.
- Identified the expected client credentials used in the mock integration from `server/smokeTest.js`:
  ```javascript
  const credentials = Buffer.from('RSU2:UoHxygREc2f238EbEBYxEjMR3xoZJP55').toString('base64');
  ```
- Reviewed the complete endpoint formats and structures in `api_doc.txt` (e.g. `GET /api/v2/status` at line 95, `POST /auth/createtoken` at line 158, `GET /vendors/list` at line 223, and seamless callbacks at lines 2381-2820).
- Confirmed database implementation at `server/prisma/schema.prisma` using `provider = "mysql"` and `@db.Decimal(15, 2)` constraints.

---

## 2. Logic Chain
- The client routes its calls through `Frontend/src/app/api/oroplay/execute/route.ts` using `callIntegrationApi(endpoint, payload)` to communicate with the OroPlay v2 backend APIs.
- The 20 endpoints defined in `Frontend/src/lib/oroplay.ts` correspond directly to the OroPlay integration API endpoints mapped out in `api_doc.txt`.
- When users perform actions, the mock/real OroPlay server validates their credentials, issues Bearer tokens, and makes seamless callbacks to the Express operator backend (`/api/balance`, `/api/transaction`, `/api/batch-transactions`) using HTTP Basic Authentication (`clientId:clientSecret`).
- Since Prisma's model relies heavily on MySQL database schemas and decimal formatting, using SQLite for E2E testing would fail due to dialect incompatibilities. Thus, a local MySQL test environment (such as a Docker database) is required.

---

## 3. Caveats
- No caveats. All 20 endpoints + token creation + seamless callback formats are documented in `api_doc.txt` and verified in the codebase.

---

## 4. Conclusion
- A mock Express server simulating all 20 OroPlay integration endpoints and `/auth/createtoken` can be configured easily on a local port.
- This mock server can trigger seamless callbacks (`/api/balance`, `/api/transaction`, `/api/batch-transactions`) containing simulated user activity (bets, wins, deposits) back to the PBBET backend.
- E2E testing must target a local MySQL instance using `.env.test` and migrate using `npx prisma db push` before running tests.

---

## 5. Verification Method
- Verify the analysis details by checking the `analysis.md` file in this directory.
- Verify files are correct and valid by inspecting:
  - `Frontend/src/lib/oroplay.ts`
  - `server/src/utils/oroplayApi.js`
  - `server/prisma/schema.prisma`
  - `api_doc.txt`
