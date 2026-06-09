# PBBET & OroPlay Integration Analysis Report

## Executive Summary
This report analyzes PBBET's integration with the OroPlay gaming ecosystem. PBBET operates as the Operator, hosting a **Seamless Wallet** system, while OroPlay provides game hosting, launches, transaction generation, and player RTP management. Based on the codebase and official specification (`api_doc.txt`), we present:
1. Request and response formats for the 20 OroPlay integration endpoints and `/auth/createtoken`.
2. Request and response formats for the 3 PBBET seamless callback endpoints.
3. A design specification for a mock OroPlay server to facilitate end-to-end (E2E) testing.
4. Database connection analysis (Prisma/MySQL) and local E2E database configuration adjustments.

---

## Part 1: OroPlay API Integration Endpoints

All integration requests (except `/auth/createtoken` and `/status`) must include:
* **Header**: `Authorization: Bearer <token>`
* **Content-Type**: `application/json`

### 0. Authentication (`/auth/createtoken`)
* **Endpoint**: `POST /auth/createtoken`
* **Rate Limit**: Max 5 requests per 30 seconds.
* **Request Body**:
  ```json
  {
    "clientId": "string",
    "clientSecret": "string"
  }
  ```
* **Response Body**:
  ```json
  {
    "token": "string",
    "expiration": 1716257131
  }
  ```

---

### 1. `status`
* **Endpoint**: `GET /status`
* **Auth**: None (no Bearer token required)
* **Request Body**: None
* **Response Body**:
  ```json
  {
    "success": true,
    "message": "success",
    "errorCode": 0
  }
  ```

### 2. `vendorsList`
* **Endpoint**: `GET /vendors/list`
* **Request Body**: None
* **Response Body**:
  ```json
  {
    "success": true,
    "message": [
      {
        "vendorCode": "slot-pragmatic",
        "type": 2,
        "name": "Pragmatic Slot",
        "url": "https://api-vendor-url"
      }
    ],
    "errorCode": 0
  }
  ```
  *(Vendor type: 1 = live casino, 2 = slot, 3 = mini-game)*

### 3. `gamesList`
* **Endpoint**: `POST /games/list`
* **Request Body**:
  ```json
  {
    "vendorCode": "casino-evolution",
    "language": "en"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": [
      {
        "provider": "Evolution",
        "vendorCode": "casino-evolution",
        "gameId": "",
        "gameCode": "LightningDice001",
        "gameName": "Lightning Dice",
        "slug": "evolution-lightningdice",
        "thumbnail": "https://evolution-thumbnail-url.jpg",
        "updatedAt": "2024-01-10T01:18:18.043",
        "isNew": false,
        "underMaintenance": false
      }
    ],
    "errorCode": 0
  }
  ```

### 4. `gameDetail`
* **Endpoint**: `POST /game/detail`
* **Request Body**:
  ```json
  {
    "vendorCode": "casino-evolution",
    "gameCode": "MonBigBaller0001"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": {
      "provider": "Evolution",
      "vendorCode": "casino-evolution",
      "gameId": "",
      "gameCode": "MonBigBaller0001",
      "gameName": "MONOPOLY Big Baller",
      "slug": "evolution-monopolybigballer",
      "thumbnail": "https://evolution-monopoly-thumbnail-url.jpg",
      "updatedAt": "2024-05-20T13:25:40.2246897Z",
      "isNew": false,
      "underMaintenance": false
    },
    "errorCode": 0
  }
  ```

### 5. `gameLaunchUrl`
* **Endpoint**: `POST /game/launch-url`
* **Request Body**:
  ```json
  {
    "vendorCode": "casino-evolution",
    "gameCode": "MonBigBaller0001",
    "userCode": "testuser",
    "language": "en",
    "lobbyUrl": "https://test.com",
    "theme": 1
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": "https://evolution.apiendpoint.com/entry?jsessionid=72fa9603a8ef&lang=en&table=MonBigBaller0001",
    "errorCode": 0
  }
  ```

### 6. `bettingHistoryById`
* **Endpoint**: `POST /betting/history/by-id`
* **Request Body**:
  ```json
  {
    "id": 5
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": {
      "id": 5,
      "userCode": "testuser",
      "roundId": "1713765639547",
      "gameCode": "vswaysmorient",
      "vendorCode": "slot-pragmatic",
      "betAmount": 100.00,
      "winAmount": 0.00,
      "beforeBalance": 999976.00,
      "afterBalance": 999876.00,
      "detail": "",
      "status": 1,
      "createdAt": 1713765639,
      "updatedAt": 1713765639
    }
  }
  ```
  *(Status: 0 = Unfinished, 1 = Finished, 2 = Canceled)*

### 7. `transactionHistoryById`
* **Endpoint**: `POST /transaction/history/by-id`
* **Request Body**:
  ```json
  {
    "id": "99"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": [
      {
        "id": 5,
        "userCode": "testuser",
        "roundId": "1713765639547",
        "wagerId": "17",
        "gameCode": "vswaysmorient",
        "vendorCode": "slot-pragmatic",
        "amount": -100.00,
        "status": 0,
        "isFinished": false,
        "isCanceled": false,
        "beforeBalance": 999976.00,
        "gameType": 2,
        "transactionCode": "1713765639",
        "detail": "",
        "createdAt": "2024-06-15 12:00:00"
      }
    ]
  }
  ```
  *(status: 0 = success, 1 = fail. gameType: 1 = Casino, 2 = Slot, 3 = Other, 4 = Fishing)*

### 8. `agentBalance`
* **Endpoint**: `GET /agent/balance`
* **Request Body**: None
* **Response Body**:
  ```json
  {
    "success": true,
    "message": 10000.00,
    "errorCode": 0
  }
  ```

### 9. `userCreate` *(Transfer Wallet Mode)*
* **Endpoint**: `POST /user/create`
* **Request Body**:
  ```json
  {
    "userCode": "testuser1"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

### 10. `userBalance` *(Transfer Wallet Mode)*
* **Endpoint**: `POST /user/balance`
* **Request Body**:
  ```json
  {
    "userCode": "testuser1"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": 1000.00,
    "errorCode": 0
  }
  ```

### 11. `userDeposit` *(Transfer Wallet Mode)*
* **Endpoint**: `POST /user/deposit`
* **Request Body**:
  ```json
  {
    "userCode": "testuser1",
    "balance": 1000.00,
    "orderNo": "EF232FAD43",
    "vendorCode": "slot-pragmatic"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": 2000.00,
    "errorCode": 0
  }
  ```

### 12. `userWithdraw` *(Transfer Wallet Mode)*
* **Endpoint**: `POST /user/withdraw`
* **Request Body**:
  ```json
  {
    "userCode": "testuser1",
    "balance": 500.00,
    "orderNo": "EF232FAD44",
    "vendorCode": "slot-pragmatic"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": 1500.00,
    "errorCode": 0
  }
  ```

### 13. `userWithdrawAll` *(Transfer Wallet Mode)*
* **Endpoint**: `POST /user/withdraw-all`
* **Request Body**:
  ```json
  {
    "userCode": "testuser1",
    "vendorCode": "slot-pragmatic"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": 1500.00,
    "errorCode": 0
  }
  ```

### 14. `userBalanceHistory` *(Transfer Wallet Mode)*
* **Endpoint**: `POST /user/balance-history`
* **Request Body**:
  ```json
  {
    "orderNo": "EF232FAD42"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": {
      "userCode": "testuser1",
      "amount": 1000.00,
      "agentBeforeBalance": 101976674.52,
      "userBeforeBalance": 3000.00,
      "type": 1,
      "createdAt": 1724755309
    }
  }
  ```
  *(type: 1 = deposit, 2 = withdraw)*

### 15. `setUserRtp`
* **Endpoint**: `POST /game/user/set-rtp`
* **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "userCode": "testuser1",
    "rtp": 90
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```
  *(rtp must be an integer between 30 and 99)*

### 16. `getUserRtp`
* **Endpoint**: `POST /game/user/get-rtp`
* **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "userCode": "testuser1"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": 85,
    "errorCode": 0
  }
  ```

### 17. `resetUsersRtp`
* **Endpoint**: `POST /game/users/reset-rtp`
* **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "rtp": 85
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": 85,
    "errorCode": 0
  }
  ```

### 18. `bettingHistoryByDateV2`
* **Endpoint**: `POST /betting/history/by-date-v2`
* **Rate Limit**: Max 1 request per second.
* **Request Body**:
  ```json
  {
    "startDate": "2024-04-21T01:00:00",
    "limit": 5000
  }
  ```
  *(Note: `vendorCode` parameter was removed in V2 update v1.1.1)*
* **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": {
      "limit": 5000,
      "nextStartDate": "2024-04-21T10:14:27",
      "histories": [
        {
          "id": 4,
          "userCode": "testuser",
          "roundId": "1713765639102",
          "gameCode": "vswaysmorient",
          "vendorCode": "slot-pragmatic",
          "betAmount": 100.00,
          "winAmount": 76.00,
          "beforeBalance": 1000000.00,
          "afterBalance": 999976.00,
          "detail": "",
          "status": 1,
          "createdAt": 1713736839,
          "updatedAt": 1713736839
        }
      ]
    }
  }
  ```

### 19. `bettingHistoryDetailPage`
* **Endpoint**: `POST /betting/history/detail`
* **Request Body**:
  ```json
  {
    "id": 20000,
    "language": "en"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": "https://m32unew6.com/gs2c/gameDetail?token=06BBAC92...&playSessionId=44388...&lang=en",
    "errorCode": 0
  }
  ```

### 20. `batchUsersRtp`
* **Endpoint**: `POST /game/users/batch-rtp`
* **Rate Limit**: Max 1 request per 3 seconds.
* **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "data": [
      {
        "userCode": "testuser1",
        "rtp": 90
      },
      {
        "userCode": "testuser2",
        "rtp": 95
      }
    ]
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

---

## Part 2: PBBET Seamless Callback Endpoints

These endpoints are provided by the PBBET Express Backend for OroPlay to call. They require Basic Auth header:
* **Header**: `Authorization: Basic <base64(clientId:clientSecret)>`
* **Content-Type**: `application/json`

### 1. Get Balance (`POST /api/balance`)
* **Request Body**:
  ```json
  {
    "userCode": "1"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": "1250.50",
    "errorCode": 0
  }
  ```

### 2. Handle Single Transaction (`POST /api/transaction`)
Processes single Bets (negative amount) or Wins (positive amount).
* **Request Body**:
  ```json
  {
    "userCode": "1",
    "vendorCode": "slot-pragmatic",
    "gameCode": "vs20doghouse",
    "historyId": 2228221,
    "roundId": "178482632282",
    "gameType": 2,
    "transactionCode": "tx_abc123",
    "isFinished": false,
    "isCanceled": false,
    "amount": -50.00,
    "detail": "{}",
    "createdAt": "2026-06-07 14:00:00"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": "1200.50",
    "errorCode": 0
  }
  ```

### 3. Handle Batch Transactions (`POST /api/batch-transactions`)
Processes bulk/multiple transactions in a single request.
* **Request Body**:
  ```json
  {
    "userCode": "1",
    "transactions": [
      {
        "userCode": "1",
        "vendorCode": "fishing-jdb",
        "gameCode": "7003",
        "historyId": 2228221,
        "roundId": "178482632282",
        "gameType": 4,
        "transactionCode": "tx_batch1",
        "isFinished": true,
        "isCanceled": false,
        "amount": 250.00,
        "detail": "{}",
        "createdAt": "2026-06-07 14:00:00"
      },
      {
        "userCode": "1",
        "vendorCode": "fishing-jdb",
        "gameCode": "7003",
        "historyId": 2228222,
        "roundId": "178482632283",
        "gameType": 4,
        "transactionCode": "tx_batch2",
        "isFinished": false,
        "isCanceled": false,
        "amount": -100.00,
        "detail": "{}",
        "createdAt": "2026-06-07 14:00:01"
      }
    ]
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "message": "1350.50",
    "errorCode": 0
  }
  ```

---

## Part 3: Mock OroPlay Server Design

To perform automated local integration/E2E testing without making real external HTTP calls, a mock OroPlay server is designed. It can be implemented in a standalone Node/Express server or mounted in the test runner context (e.g. MSW or standalone test runner server).

### 1. Basic Architecture
```
                     +---------------------------------------+
                     |        PBBET Express Backend          |
                     |  (Reads OROPLAY_BASE_URL=mock_url)    |
                     +-------------------+-------------------+
                                         |
               Outbound OroPlay APIs     |    Basic Auth Callbacks
               (Bearer JWT Protected)    |    (Basic Auth Protected)
                                         v
                     +-------------------+-------------------+
                     |         Mock OroPlay Server           |
                     |  - Simulates 20 integration endpoints  |
                     |  - Token generator & validator        |
                     |  - Simulates game outcomes & events   |
                     +---------------------------------------+
```

### 2. State & Token Management
* **In-Memory Store**: Holds simulated game launch sessions, user codes, vendor listings, and active RTP settings.
* **Token Creation (`POST /auth/createtoken`)**:
  Generates a JWT-like signed token using a secret key (or a randomly generated UUID mapped in-memory) with a configurable expiration timestamp (e.g., current time + 1 hour).
  * JWT Payload: `{ "clientId": "RSU2", "exp": Math.floor(Date.now() / 1000) + 3600 }`
* **Bearer Token Validation Middleware**:
  Extracts the header `Authorization: Bearer <token>`, decodes the token, checks the signature, and validates that the `exp` timestamp is greater than `Math.floor(Date.now() / 1000)`. If invalid/expired, it responds with `401 Unauthorized` (errorCode `401`).

### 3. Simulating Seamless Callbacks
To simulate player activities (spins, bets, wins), the mock server provides a controller `/sim/play` to trigger mock gameplay transactions directed to the PBBET Express Backend.

#### Walkthrough: Triggering a Simulated Bet & Win Game Round
1. E2E Test runner triggers mock play:
   `POST http://localhost:mock_port/sim/play`
   ```json
   {
     "userCode": "1",
     "betAmount": 10.00,
     "winAmount": 25.00,
     "gameCode": "vs20doghouse",
     "vendorCode": "slot-pragmatic"
   }
   ```
2. **Step A: Check User Balance**
   Mock server sends:
   `POST http://localhost:pbbet_port/api/balance`
   * Headers: `Authorization: Basic <base64(clientId:clientSecret)>`
   * Body: `{ "userCode": "1" }`
   * Response: `{ "success": true, "message": "100.00", "errorCode": 0 }`
3. **Step B: Send Bet Transaction**
   Mock server sends:
   `POST http://localhost:pbbet_port/api/transaction`
   * Headers: `Authorization: Basic <base64(clientId:clientSecret)>`
   * Body:
     ```json
     {
       "userCode": "1",
       "vendorCode": "slot-pragmatic",
       "gameCode": "vs20doghouse",
       "historyId": 10001,
       "roundId": "round_9999",
       "gameType": 2,
       "transactionCode": "tx_bet_10001",
       "isFinished": false,
       "isCanceled": false,
       "amount": -10.00,
       "detail": "{}",
       "createdAt": "2026-06-07 14:00:00"
     }
     ```
   * Response: `{ "success": true, "message": "90.00", "errorCode": 0 }`
4. **Step C: Send Win Transaction**
   Mock server sends:
   `POST http://localhost:pbbet_port/api/transaction`
   * Headers: `Authorization: Basic <base64(clientId:clientSecret)>`
   * Body:
     ```json
     {
       "userCode": "1",
       "vendorCode": "slot-pragmatic",
       "gameCode": "vs20doghouse",
       "historyId": 10002,
       "roundId": "round_9999",
       "gameType": 2,
       "transactionCode": "tx_win_10002",
       "isFinished": true,
       "isCanceled": false,
       "amount": 25.00,
       "detail": "{}",
       "createdAt": "2026-06-07 14:00:01"
     }
     ```
   * Response: `{ "success": true, "message": "115.00", "errorCode": 0 }`
5. Mock server returns step-by-step trace and final results back to the E2E Test runner.

---

## Part 4: Backend Database Connection & Testing Isolation

### 1. DB Mechanics (Prisma/MySQL)
* PBBET uses **Prisma Client** for database access.
* The connection string is fetched from the system environment via the `DATABASE_URL` variable.
* In the backend, the DB operations inside `walletController.js` are wrapped in `prisma.$transaction(async (tx) => { ... })` using database locks to prevent race conditions during concurrent requests.
* Transactions enforce a unique constraint on `transactionCode` to maintain idempotency.

### 2. Database Adjustments for Local E2E Testing
To run local E2E tests reliably without corrupting live development data, the following configuration adjustments are required:

1. **Dedicated Test Database Schema**:
   Isolate E2E tests by using a separate test schema name (e.g., `pbbet_test` instead of `pbbet`).
2. **Environment File Isolation**:
   Create a `.env.test` file:
   ```env
   DATABASE_URL="mysql://root:password@127.0.0.1:3306/pbbet_test"
   PORT=5001
   OROPLAY_BASE_URL="http://localhost:5002/api/v2"
   OROPLAY_CLIENT_ID="RSU2"
   OROPLAY_CLIENT_SECRET="UoHxygREc2f238EbEBYxEjMR3xoZJP55"
   ```
3. **Database Lifecycle Management in Test Runner**:
   Before starting the test suites, run the migration to ensure the schema is fresh and clean:
   ```bash
   # Create/update the schema on the test DB
   npx dotenv -e .env.test -- prisma db push --accept-data-loss
   ```
4. **Data Resetting (Clean State)**:
   Between each E2E test block, use a database teardown helper to truncate database tables (`User`, `Transaction`, `GameSession`, `SiteSetting`, `Banner`) to ensure tests do not leak state to subsequent runs:
   ```javascript
   const tablenames = ['Transaction', 'GameSession', 'User'];
   for (const name of tablenames) {
     await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${name}\`;`);
   }
   ```
5. **Concurrency Control**:
   Set `PRISMA_CLIENT_ENGINE_TYPE="binary"` or run database tests serially (e.g. `jest --runInBand` or `vitest --threads=false`) to ensure transaction hooks do not hit lock conflicts on a single local MySQL thread.
