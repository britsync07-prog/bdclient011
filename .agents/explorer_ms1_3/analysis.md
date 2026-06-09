# PBBET Backend and Frontend Integration with OroPlay Analysis

This document outlines the API formats for all 20 OroPlay integration endpoints, `/auth/createtoken`, and basic auth seamless callbacks, along with the design for a Mock OroPlay Server for local E2E testing.

---

## 1. OroPlay Integration & Authentication API Specifications

The Next.js Frontend calls these endpoints via a secure proxy route at `POST /api/oroplay/execute`. In production, they are sent to the OroPlay API Base URL (`https://bs.sxvwlkohlv.com/api/v2`). They require a `Bearer` token in the `Authorization` header, obtained via `/auth/createtoken`.

### 1.1 Authentication Endpoint
* **Endpoint Key**: `createtoken`
* **HTTP Method**: `POST`
* **Path**: `/auth/createtoken`
* **Auth Required**: No (Public)
* **Expected Request Format**:
  ```json
  {
    "clientId": "string",
    "clientSecret": "string"
  }
  ```
* **Expected Response Format**:
  ```json
  {
    "token": "string(250)",
    "expiration": 1716257131
  }
  ```

---

### 1.2 The 20 Integration Endpoints

#### 1. status
* **HTTP Method**: `GET`
* **Path**: `/status`
* **Auth Required**: No
* **Request Format**: None
* **Response Format**:
  ```json
  {
    "success": true,
    "message": "success",
    "errorCode": 0
  }
  ```

#### 2. vendorsList
* **HTTP Method**: `GET`
* **Path**: `/vendors/list`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**: None
* **Response Format**:
  ```json
  {
    "success": true,
    "message": [
      {
        "vendorCode": "slot-pragmatic",
        "type": 2,
        "name": "Pragmatic Slot",
        "url": "string"
      }
    ],
    "errorCode": 0
  }
  ```

#### 3. gamesList
* **HTTP Method**: `POST`
* **Path**: `/games/list`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "vendorCode": "string",
    "language": "string"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": [
      {
        "provider": "string",
        "vendorCode": "string",
        "gameId": "string",
        "gameCode": "string",
        "gameName": "string",
        "slug": "string",
        "thumbnail": "string",
        "updatedAt": "string (ISO8601)",
        "isNew": false,
        "underMaintenance": false
      }
    ],
    "errorCode": 0
  }
  ```

#### 4. gameDetail
* **HTTP Method**: `POST`
* **Path**: `/game/detail`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "vendorCode": "string",
    "gameCode": "string"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": {
      "provider": "string",
      "vendorCode": "string",
      "gameId": "string",
      "gameCode": "string",
      "gameName": "string",
      "slug": "string",
      "thumbnail": "string",
      "updatedAt": "string (ISO8601)",
      "isNew": false,
      "underMaintenance": false
    },
    "errorCode": 0
  }
  ```

#### 5. gameLaunchUrl
* **HTTP Method**: `POST`
* **Path**: `/game/launch-url`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "vendorCode": "string",
    "gameCode": "string",
    "userCode": "string",
    "language": "string",
    "lobbyUrl": "string (optional)",
    "theme": 1
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": "string (URL)",
    "errorCode": 0
  }
  ```

#### 6. bettingHistoryById
* **HTTP Method**: `POST`
* **Path**: `/betting/history/by-id`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "id": 5
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": {
      "id": 5,
      "userCode": "string",
      "roundId": "string",
      "gameCode": "string",
      "vendorCode": "string",
      "betAmount": 100.00,
      "winAmount": 0.00,
      "beforeBalance": 999976.00,
      "afterBalance": 999876.00,
      "detail": "string",
      "status": 1, // 0: Unfinished, 1: Finished, 2: Canceled
      "createdAt": 1713765639, // UNIX timestamp
      "updatedAt": 1713765639 // UNIX timestamp
    }
  }
  ```

#### 7. transactionHistoryById
* **HTTP Method**: `POST`
* **Path**: `/transaction/history/by-id`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "id": "string or number"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": [
      {
        "id": 5,
        "userCode": "string",
        "roundId": "string",
        "wagerId": "string",
        "gameCode": "string",
        "vendorCode": "string",
        "amount": -100.00,
        "status": 0, // 0: success, 1: fail
        "isFinished": false,
        "isCanceled": false,
        "beforeBalance": 999976.00,
        "gameType": 2, // 1: Casino, 2: Slot, 3: Other, 4: Fishing
        "transactionCode": "string",
        "detail": "string",
        "createdAt": "2024-06-15 12:00:00" // Datetime UTC
      }
    ]
  }
  ```

#### 8. agentBalance
* **HTTP Method**: `GET`
* **Path**: `/agent/balance`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**: None
* **Response Format**:
  ```json
  {
    "success": true,
    "message": 1000.00,
    "errorCode": 0
  }
  ```

#### 9. userCreate
* **HTTP Method**: `POST`
* **Path**: `/user/create`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "userCode": "string"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

#### 10. userBalance
* **HTTP Method**: `POST`
* **Path**: `/user/balance`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "userCode": "string"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": 1000.00,
    "errorCode": 0
  }
  ```

#### 11. userDeposit
* **HTTP Method**: `POST`
* **Path**: `/user/deposit`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "userCode": "string",
    "balance": 1000.00,
    "orderNo": "string (optional)",
    "vendorCode": "string (optional)"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": 1000.00, // User balance after deposit
    "errorCode": 0
  }
  ```

#### 12. userWithdraw
* **HTTP Method**: `POST`
* **Path**: `/user/withdraw`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "userCode": "string",
    "balance": 1000.00,
    "orderNo": "string (optional)",
    "vendorCode": "string (optional)"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": 1000.00, // User balance after withdraw
    "errorCode": 0
  }
  ```

#### 13. userWithdrawAll
* **HTTP Method**: `POST`
* **Path**: `/user/withdraw-all`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "userCode": "string",
    "vendorCode": "string (optional)"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": 1000.00, // Withdrawn balance
    "errorCode": 0
  }
  ```

#### 14. userBalanceHistory
* **HTTP Method**: `POST`
* **Path**: `/user/balance-history`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "orderNo": "string"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": {
      "userCode": "string",
      "amount": 1000.00,
      "agentBeforeBalance": 10197667478346.52,
      "userBeforeBalance": 3000.00,
      "type": 1, // 1: deposit, 2: withdraw
      "createdAt": 1724755309 // UNIX timestamp
    },
    "errorCode": 0
  }
  ```

#### 15. setUserRtp
* **HTTP Method**: `POST`
* **Path**: `/game/user/set-rtp`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "vendorCode": "string",
    "userCode": "string",
    "rtp": 90 // int between 30 and 99
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

#### 16. getUserRtp
* **HTTP Method**: `POST`
* **Path**: `/game/user/get-rtp`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "vendorCode": "string",
    "userCode": "string"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": 85, // user's RTP value
    "errorCode": 0
  }
  ```

#### 17. resetUsersRtp
* **HTTP Method**: `POST`
* **Path**: `/game/users/reset-rtp`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "vendorCode": "string",
    "rtp": 85
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": 85, // RTP set for all users
    "errorCode": 0
  }
  ```

#### 18. bettingHistoryByDateV2
* **HTTP Method**: `POST`
* **Path**: `/betting/history/by-date-v2`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "startDate": "string (UTC datetime yyyy-mm-dd or yyyy-mm-ddThh:mm:ss)",
    "limit": 5000 // int (max 5000)
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": {
      "limit": 5000,
      "nextStartDate": "string (UTC datetime)",
      "histories": [
        {
          "id": 4,
          "userCode": "string",
          "roundId": "string",
          "gameCode": "string",
          "vendorCode": "string",
          "betAmount": 100.00,
          "winAmount": 76.00,
          "beforeBalance": 1000000.00,
          "afterBalance": 999976.00,
          "detail": "string",
          "status": 1,
          "createdAt": 1713736839,
          "updatedAt": 1713736839
        }
      ]
    }
  }
  ```

#### 19. bettingHistoryDetailPage
* **HTTP Method**: `POST`
* **Path**: `/betting/history/detail`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "id": 20000,
    "language": "string (optional)"
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "message": "string (URL to betting detail page)",
    "errorCode": 0
  }
  ```

#### 20. batchUsersRtp
* **HTTP Method**: `POST`
* **Path**: `/game/users/batch-rtp`
* **Auth Required**: Yes (Bearer Token)
* **Request Format**:
  ```json
  {
    "vendorCode": "string",
    "data": [
      {
        "userCode": "string",
        "rtp": 90 // int between 30 and 99
      }
    ]
  }
  ```
* **Response Format**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

---

## 2. Basic Auth Seamless Callback Specifications

These endpoints are exposed by the PBBET backend and are invoked by OroPlay to update user balances dynamically when they place bets or win in-game.

* **Authentication**: Basic Authentication
  * Header: `Authorization: Basic <base64(clientId:clientSecret)>`
  * Values verified against: `process.env.OROPLAY_CLIENT_ID` and `process.env.OROPLAY_CLIENT_SECRET`.

### 2.1 GET BALANCE Callback
* **HTTP Method**: `POST`
* **Path**: `/api/balance`
* **Request Format**:
  ```json
  {
    "userCode": "string (corresponds to PBBET User.id)"
  }
  ```
* **Response Format**:
  * **Success**:
    ```json
    {
      "success": true,
      "message": "1000.00", // User's balance as string
      "errorCode": 0
    }
    ```
  * **Failure (User Not Found)**:
    ```json
    {
      "success": false,
      "message": "User does not exist",
      "errorCode": 2
    }
    ```

### 2.2 TRANSACTION Callback (Bet / Win / Refund)
* **HTTP Method**: `POST`
* **Path**: `/api/transaction`
* **Request Format**:
  ```json
  {
    "userCode": "string",
    "vendorCode": "string",
    "gameCode": "string",
    "historyId": 2228221,
    "roundId": "string",
    "gameType": 2, // 1: Casino, 2: Slot, 3: Other, 4: Fishing
    "transactionCode": "string (unique transaction identifier)",
    "isFinished": false,
    "isCanceled": false,
    "amount": -100.00, // Negative for bets, positive for wins
    "detail": "string",
    "createdAt": "2024-06-15 12:00:00" // UTC date string
  }
  ```
* **Response Format**:
  * **Success**:
    ```json
    {
      "success": true,
      "message": "900.00", // User balance after transaction as string
      "errorCode": 0
    }
    ```
  * **Failure (Duplicate Transaction)**:
    ```json
    {
      "success": false,
      "message": "duplicate transaction",
      "errorCode": 6
    }
    ```
  * **Failure (Insufficient Balance)**:
    ```json
    {
      "success": false,
      "message": "Insufficient balance",
      "errorCode": 4
    }
    ```

### 2.3 BATCH TRANSACTIONS Callback
* **HTTP Method**: `POST`
* **Path**: `/api/batch-transactions`
* **Request Format**:
  ```json
  {
    "userCode": "string",
    "transactions": [
      {
        "userCode": "string",
        "vendorCode": "string",
        "gameCode": "string",
        "historyId": 2228221,
        "roundId": "string",
        "gameType": 2,
        "transactionCode": "tx-1",
        "isFinished": false,
        "isCanceled": false,
        "amount": -100.00,
        "detail": "string",
        "createdAt": "2024-06-15 12:00:00"
      },
      {
        "userCode": "string",
        "vendorCode": "string",
        "gameCode": "string",
        "historyId": 2228222,
        "roundId": "string",
        "gameType": 2,
        "transactionCode": "tx-2",
        "isFinished": false,
        "isCanceled": false,
        "amount": 200.00,
        "detail": "string",
        "createdAt": "2024-06-15 12:00:01"
      }
    ]
  }
  ```
* **Response Format**:
  * **Success**:
    ```json
    {
      "success": true,
      "message": "1100.00", // User balance after all transactions as string
      "errorCode": 0
    }
    ```

---

## 3. Mock OroPlay Server Design

To perform robust local E2E testing, we design a lightweight, standalone mock server written in Node/Express (or implemented as a dynamic mock using a test runner/worker).

```
 ┌──────────────────────┐  (Bearer JWT)  ┌───────────────┐
 │    PBBET Frontend    ├───────────────>│  Mock OroPlay │
 │      (Next.js)       │               │     Server    │
 └──────────┬───────────┘               └───────┬───────┘
            │                                   │
            │ (Basic Auth Callbacks)            │ (Stores game config,
            │ /api/balance                      │  rtp, and logs)
            │ /api/transaction                  │
            v                                   │
 ┌──────────────────────┐                       │
 │    PBBET Backend     │<──────────────────────┘
 │    (Express/Node)    │
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │     Test Database    │
 │     (MySQL/Prisma)   │
 └──────────────────────┘
```

### 3.1 Design Principles
1. **Configurable Endpoint**: The mock server should run on a local port (e.g., `3002`). The environment variables `OROPLAY_BASE_URL` in both Frontend and Backend will point to `http://localhost:3002/api/v2`.
2. **Stateful Mocking**: Keep an in-memory database of mock data (such as vendors, games, user RTP overrides, transaction logs, and issued tokens) so changes persist across integration calls.
3. **Automated Testing Triggers**: Expose private test controller paths (e.g., `POST /__test/trigger-callback`) that trigger seamless Basic Auth callbacks (`/api/balance`, `/api/transaction`, `/api/batch-transactions`) directly to the target Express backend port (e.g., `http://localhost:5000`).

---

### 3.2 Mock Server Core Modules

#### A. Token Generation & Verification
Generates standard JWT-like Bearer tokens or UUID tokens mapped to expiry.
* **Algorithm**: HMAC-SHA256 (`jsonwebtoken` library) or a simple base64-encoded payload.
* **Payload**:
  ```json
  {
    "clientId": "RSU2",
    "exp": 1716257131
  }
  ```
* **Token Verification Middleware**:
  Checks the `Authorization: Bearer <token>` header, decodes it, verifies expiration, and yields a `401 Unauthorized` if invalid.

#### B. State Store (In-Memory)
Maintains state for the lifecycle of E2E test runs.
```javascript
const state = {
  tokens: new Set(),
  rtpSettings: new Map(), // key: userCode:vendorCode, value: rtp
  userBalances: new Map(), // key: userCode, value: balance (for Transfer Wallet simulations)
  transactionLogs: new Map(), // key: transactionCode, value: transaction
  bettingHistory: []
};
```

#### C. Integration Endpoint Simulators
All 20+1 paths mapped in Express:
* `POST /api/v2/auth/createtoken`: Checks credentials (`clientId` matches `RSU2` and `clientSecret` matches configured secret), returns JWT.
* `GET /api/v2/vendors/list`: Returns a static list of mock game vendors (slot, casino, mini-game).
* `POST /api/v2/games/list`: Returns a filtered list of games for the requested vendor.
* `POST /api/v2/game/launch-url`: Generates a valid mock URL (e.g., `http://localhost:3002/mock-game?userCode=...&gameCode=...`).
* `POST /api/v2/game/user/set-rtp`: Updates in-memory `rtpSettings`.
* `POST /api/v2/game/user/get-rtp`: Reads from `rtpSettings` (defaults to `85`).
* `POST /api/v2/user/deposit`: Statefully updates `userBalances` and returns balance.
* `POST /api/v2/user/withdraw`: Statefully updates `userBalances` (validating sufficient funds) and returns balance.

#### D. Callback Trigger Endpoint (Private Test API)
Used by E2E test scripts to instruct the mock OroPlay server to perform a callback.
```javascript
// POST /__test/trigger-callback
app.post('/__test/trigger-callback', async (req, res) => {
  const { type, payload } = req.body;
  const targetUrl = process.env.PBBET_BACKEND_URL || 'http://localhost:5000';
  
  const basicAuthHeader = 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  let endpoint = '/api/balance';
  if (type === 'transaction') endpoint = '/api/transaction';
  if (type === 'batch') endpoint = '/api/batch-transactions';

  try {
    const response = await fetch(`${targetUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuthHeader
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    return res.status(response.status).json({ callbackStatus: response.status, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
```

---

## 4. Backend Database Integration & E2E Testing Config

### 4.1 How PBBET Database Integration Works
PBBET utilizes **Prisma ORM** connecting to a **MySQL** database.
* The connection string is defined in `.env` under the key `DATABASE_URL`.
* The client is instantiated once in `server/src/config/db.js` and imported globally in controllers.
* Operations in `/api/transaction` and `/api/batch-transactions` use **Prisma Interactive Transactions** (`prisma.$transaction(async (tx) => { ... })`) to ensure ACID compliance:
  1. Checks for double-spends/duplicate transactions statefully.
  2. Increments/decrements user balance.
  3. Inserts a record into the `Transaction` table (`type: transAmount < 0 ? 'BET' : 'WIN'`).

### 4.2 Local E2E Testing Adjustments
Because Prisma is hardcoded to use the `mysql` provider in `schema.prisma` (`provider = "mysql"`), we cannot run tests directly using an in-memory SQLite database without modifying the schema file, which is a violation of the read-only explorer instructions.

To run clean local E2E tests, the following database configurations should be made:
1. **Local Test Database Instance**: Run a local MySQL instance (via docker-compose or local daemon) dedicated solely to testing.
   ```yaml
   # docker-compose.test.yml
   version: '3.8'
   services:
     test-db:
       image: mysql:8.0
       environment:
         MYSQL_DATABASE: pbbet_test
         MYSQL_ROOT_PASSWORD: testpassword
       ports:
         - "33306:3306"
   ```
2. **Environment Variable Configuration**:
   Create a `.env.test` file or pass variables to the test runner process:
   ```env
   NODE_ENV=test
   DATABASE_URL="mysql://root:testpassword@localhost:33306/pbbet_test"
   OROPLAY_BASE_URL="http://localhost:3002/api/v2"
   OROPLAY_CLIENT_ID="RSU2"
   OROPLAY_CLIENT_SECRET="UoHxygREc2f238EbEBYxEjMR3xoZJP55"
   ```
3. **Database Lifecyle Management**:
   Prior to executing E2E suites:
   * Run migrations on the test database: `npx prisma db push --accept-data-loss` or `npx prisma migrate reset --force`.
   * Seed testing prerequisites (e.g. test users like `userId=1`) using a programmatic script or by executing `node prisma/seed.js`.
