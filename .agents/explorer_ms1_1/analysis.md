# PBBET & OroPlay Integration Analysis & Mock Server Design

This document details the expected request and response formats for all 20 integration endpoints, `/auth/createtoken`, and the seamless wallet callbacks of OroPlay v2. It also specifies the design of a mock OroPlay server and explains the database connection requirements for local end-to-end (E2E) testing.

---

## 1. OroPlay Integration & Seamless Callbacks Contracts

All OroPlay integration APIs use JSON payloads. Endpoints requiring authorization must include the header `Authorization: Bearer <token>`, where the token is generated from `/auth/createtoken`.
Seamless wallet callbacks sent by the OroPlay server to the PBBET Express backend use Basic Authentication with credentials base64 encoded as `Basic <base64(clientId:clientSecret)>`.

### 1.1 Authentication Endpoint
#### Create Token (`POST /auth/createtoken`)
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "clientId": "RSU2",
    "clientSecret": "UoHxygREc2f238EbEBYxEjMR3xoZJP55"
  }
  ```
- **Response Body (Success)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzUxMiI...",
    "expiration": 1716257131
  }
  ```

---

### 1.2 Integration Endpoints (20 total)

#### 1. status (`GET /status`)
- **Authentication**: None
- **Request Body**: None
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "success",
    "errorCode": 0
  }
  ```

#### 2. vendorsList (`GET /vendors/list`)
- **Authentication**: Bearer Token
- **Request Body**: None
- **Response Body**:
  ```json
  {
    "success": true,
    "message": [
      {
        "vendorCode": "slot-pragmatic",
        "type": 2,
        "name": "Pragmatic Slot",
        "url": "https://api-endpoint.com/api/v2"
      },
      {
        "vendorCode": "casino-evolution",
        "type": 1,
        "name": "Evolution Live",
        "url": "https://api-endpoint.com/api/v2"
      }
    ],
    "errorCode": 0
  }
  ```

#### 3. gamesList (`POST /games/list`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "vendorCode": "casino-evolution",
    "language": "en"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": [
      {
        "provider": "Evolution",
        "vendorCode": "casino-evolution",
        "gameId": "",
        "gameCode": "lobby",
        "gameName": "Lobby",
        "slug": "evolution-lobby",
        "thumbnail": "https://images.evolution.com/lobby.jpg",
        "updatedAt": "2024-05-20T10:36:40.980Z",
        "isNew": false,
        "underMaintenance": false
      }
    ],
    "errorCode": 0
  }
  ```

#### 4. gameDetail (`POST /game/detail`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "vendorCode": "casino-evolution",
    "gameCode": "MonBigBaller0001"
  }
  ```
- **Response Body**:
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
      "thumbnail": "https://images.evolution.com/monopoly.jpg",
      "updatedAt": "2024-05-20T13:25:40.224Z",
      "isNew": false,
      "underMaintenance": false
    },
    "errorCode": 0
  }
  ```

#### 5. gameLaunchUrl (`POST /game/launch-url`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "vendorCode": "casino-evolution",
    "gameCode": "MonBigBaller0001",
    "userCode": "admin",
    "language": "en",
    "lobbyUrl": "https://pbbet.com",
    "theme": 1
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "https://evolution.apiendpoint.com/entry?jsessionid=72fa9603a8ef&lang=en&table=MonBigBaller0001",
    "errorCode": 0
  }
  ```

#### 6. bettingHistoryById (`POST /betting/history/by-id`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "id": 5
  }
  ```
- **Response Body**:
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
      "detail": "{}",
      "status": 1,
      "createdAt": 1713765639,
      "updatedAt": 1713765639
    }
  }
  ```

#### 7. transactionHistoryById (`POST /transaction/history/by-id`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "id": "99"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": [
      {
        "id": 5,
        "userCode": "test",
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
        "detail": "{}",
        "createdAt": "2024-06-15 12:00:00"
      }
    ]
  }
  ```

#### 8. agentBalance (`GET /agent/balance`)
- **Authentication**: Bearer Token
- **Request Body**: None
- **Response Body**:
  ```json
  {
    "success": true,
    "message": 100000.00,
    "errorCode": 0
  }
  ```

#### 9. userCreate (`POST /user/create`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "userCode": "testuser1"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

#### 10. userBalance (`POST /user/balance`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "userCode": "testuser1"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": 1000.00,
    "errorCode": 0
  }
  ```

#### 11. userDeposit (`POST /user/deposit`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "userCode": "testuser1",
    "balance": 500.00,
    "orderNo": "DEP12345",
    "vendorCode": "slot-pragmatic"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": 1500.00,
    "errorCode": 0
  }
  ```

#### 12. userWithdraw (`POST /user/withdraw`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "userCode": "testuser1",
    "balance": 200.00,
    "orderNo": "WIT12345",
    "vendorCode": "slot-pragmatic"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": 1300.00,
    "errorCode": 0
  }
  ```

#### 13. userWithdrawAll (`POST /user/withdraw-all`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "userCode": "testuser1",
    "vendorCode": "slot-pragmatic"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": 1300.00,
    "errorCode": 0
  }
  ```

#### 14. userBalanceHistory (`POST /user/balance-history`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "orderNo": "DEP12345"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": {
      "id": 12,
      "userCode": "testuser1",
      "amount": 500.00,
      "agentBeforeBalance": 99500.00,
      "userBeforeBalance": 1000.00,
      "type": 1,
      "createdAt": 1724755309
    },
    "errorCode": 0
  }
  ```

#### 15. setUserRtp (`POST /game/user/set-rtp`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "userCode": "testuser1",
    "rtp": 90
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

#### 16. getUserRtp (`POST /game/user/get-rtp`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "userCode": "testuser1"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": 90,
    "errorCode": 0
  }
  ```

#### 17. resetUsersRtp (`POST /game/users/reset-rtp`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "rtp": 85
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": 85,
    "errorCode": 0
  }
  ```

#### 18. bettingHistoryByDateV2 (`POST /betting/history/by-date-v2`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "vendorCode": "slot-pragmatic",
    "startDate": "2024-04-21T01:00:00",
    "limit": 100
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0,
    "message": {
      "limit": 100,
      "nextStartDate": "2024-04-21T10:14:27",
      "histories": [
        {
          "id": 4,
          "userCode": "testuser1",
          "roundId": "1713765639102",
          "gameCode": "vswaysmorient",
          "vendorCode": "slot-pragmatic",
          "betAmount": 100.00,
          "winAmount": 76.00,
          "beforeBalance": 1000.00,
          "afterBalance": 976.00,
          "detail": "",
          "status": 1,
          "createdAt": 1713736839,
          "updatedAt": 1713736839
        }
      ]
    }
  }
  ```

#### 19. bettingHistoryDetailPage (`POST /betting/history/detail`)
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "id": 20000,
    "language": "en"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "https://m32unew6.com/gs2c/gameDetail?token=06BBAC92439C&playSessionId=44388079&lang=en",
    "errorCode": 0
  }
  ```

#### 20. batchUsersRtp (`POST /game/users/batch-rtp`)
- **Authentication**: Bearer Token
- **Request Body**:
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
        "rtp": 85
      }
    ]
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "errorCode": 0
  }
  ```

---

### 1.3 Basic Auth Seamless Callbacks
These callbacks are made by the OroPlay server to the PBBET operator Express backend.
Header: `Authorization: Basic <base64(clientId:clientSecret)>`
Default credentials: `RSU2:UoHxygREc2f238EbEBYxEjMR3xoZJP55` (`Basic UlNVMjpVb0h4eWdSRWMyZjIzOEViRUJYeEVqTVIzeG9aSlA1NQ==`)

#### 1. POST `/api/balance`
- **Request Body**:
  ```json
  {
    "userCode": "1"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "999999.00",
    "errorCode": 0
  }
  ```

#### 2. POST `/api/transaction`
- **Request Body**:
  ```json
  {
    "userCode": "1",
    "vendorCode": "slot-pragmatic",
    "gameCode": "vs20doghouse",
    "historyId": 2228221,
    "roundId": "178482632282",
    "gameType": 2,
    "transactionCode": "a2c333bb67",
    "isFinished": false,
    "isCanceled": false,
    "amount": -100.00,
    "detail": "{}",
    "createdAt": "2026-06-07 14:00:00"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "999899.00",
    "errorCode": 0
  }
  ```

#### 3. POST `/api/batch-transactions`
- **Request Body**:
  ```json
  {
    "userCode": "1",
    "transactions": [
      {
        "userCode": "1",
        "vendorCode": "slot-pragmatic",
        "gameCode": "vs20doghouse",
        "historyId": 2228221,
        "roundId": "178482632282",
        "gameType": 2,
        "transactionCode": "a2c333bb67",
        "isFinished": true,
        "isCanceled": false,
        "amount": 150.00,
        "detail": "{}",
        "createdAt": "2026-06-07 14:00:01"
      }
    ]
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "1000049.00",
    "errorCode": 0
  }
  ```

---

## 2. Design Specification for a Mock OroPlay Server

The mock OroPlay server will be written in **Node.js/Express**. It will run as a standalone process on a local port (e.g. `5001`), allowing the PBBET application and test runners to redirect their requests via `OROPLAY_BASE_URL=http://localhost:5001/api/v2`.

### 2.1 Server Architecture & Structure
```
oroplay-mock-server/
├── server.js            # Express server configuration and routing
├── tokenStore.js        # In-memory authentication token store with TTL
└── testRoutes.js        # Special test control endpoints to trigger seamless callbacks
```

### 2.2 Token Generator & Validation (Bearer & Basic)
```javascript
// tokenStore.js
const crypto = require('crypto');

class TokenStore {
  constructor() {
    this.tokens = new Map(); // token => expiration (Unix timestamp)
  }

  generateToken(ttlSeconds = 3600) {
    const token = 'mock_bearer_' + crypto.randomBytes(32).toString('hex');
    const expiration = Math.floor(Date.now() / 1000) + ttlSeconds;
    this.tokens.set(token, expiration);
    return { token, expiration };
  }

  isValid(token) {
    if (!token) return false;
    const expiration = this.tokens.get(token);
    if (!expiration) return false;
    if (Date.now() / 1000 > expiration) {
      this.tokens.delete(token); // Cleanup expired token
      return false;
    }
    return true;
  }
}

module.exports = new TokenStore();
```

Authorization Middleware to check JWT/Bearer tokens:
```javascript
const tokenStore = require('./tokenStore');

function checkBearerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 401 });
  }
  const token = authHeader.split(' ')[1];
  if (!tokenStore.isValid(token)) {
    return res.status(401).json({ success: false, message: 'Token expired or invalid', errorCode: 401 });
  }
  next();
}
```

### 2.3 Simulating the 20 Integration Endpoints
Each endpoint will be mocked to return responses aligned with the `api_doc.txt` contracts:
- `POST /api/v2/auth/createtoken`: Validates JSON body `clientId === 'RSU2' && clientSecret === 'UoHxygREc2f238EbEBYxEjMR3xoZJP55'`. On success, calls `tokenStore.generateToken()` and returns `{ token, expiration }`.
- `GET /api/v2/status`: Returns success payload.
- `GET /api/v2/vendors/list`: Returns a static list of vendors.
- `POST /api/v2/games/list`: Returns a list of games filtered by `vendorCode`.
- `POST /api/v2/game/detail`: Returns game metadata for a matching `vendorCode` and `gameCode`.
- `POST /api/v2/game/launch-url`: Returns a mock iframe launch URL.
- `POST /api/v2/game/user/set-rtp`, `get-rtp`, `users/reset-rtp`, `users/batch-rtp`: Manages or retrieves user RTP configuration in an in-memory store.
- `POST /api/v2/user/create`, `balance`, `deposit`, `withdraw`, `withdraw-all`, `balance-history`: Models balance movements in an in-memory user registry for standalone E2E assertions.
- `POST /api/v2/betting/history/by-id`, `by-date-v2`, `detail`: Returns simulated betting histories and detail links.

### 2.4 Callback Simulation (Driving depositing/betting/winning)
To drive integration tests, the mock server exposes a test-only route `POST /test/trigger-callback`. The test runner calls this route, instructing the mock server to make a webhook callback (deposits, bets, or wins) back to PBBET's Express backend.

```javascript
// testRoutes.js
const express = require('express');
const router = express.Router();

router.post('/trigger-callback', async (req, res) => {
  const { type, userCode, amount, transactionCode, gameCode, vendorCode, backendUrl } = req.body;

  const credentials = Buffer.from('RSU2:UoHxygREc2f238EbEBYxEjMR3xoZJP55').toString('base64');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${credentials}`
  };

  let endpointPath = '';
  let payload = {};

  if (type === 'balance') {
    endpointPath = '/api/balance';
    payload = { userCode };
  } else if (type === 'transaction') {
    endpointPath = '/api/transaction';
    payload = {
      userCode,
      transactionCode: transactionCode || 'tx_' + Date.now(),
      amount: amount || -10.0, // negative for bet, positive for win
      isFinished: false,
      isCanceled: false,
      gameCode: gameCode || 'vs20doghouse',
      vendorCode: vendorCode || 'slot-pragmatic',
      historyId: 1000 + Math.floor(Math.random() * 10000),
      roundId: 'round_' + Date.now(),
      gameType: 2,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
  } else if (type === 'batch-transactions') {
    endpointPath = '/api/batch-transactions';
    payload = {
      userCode,
      transactions: [
        {
          userCode,
          transactionCode: transactionCode || 'tx_' + Date.now(),
          amount: amount || -10.0,
          isFinished: true,
          isCanceled: false,
          gameCode: gameCode || 'vs20doghouse',
          vendorCode: vendorCode || 'slot-pragmatic',
          historyId: 2000 + Math.floor(Math.random() * 10000),
          roundId: 'round_' + Date.now(),
          gameType: 2,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      ]
    };
  }

  try {
    const response = await fetch(`${backendUrl}${endpointPath}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return res.status(200).json({ status: 'Callback finished', response: data });
  } catch (error) {
    return res.status(500).json({ status: 'Callback failed', error: error.message });
  }
});
```

---

## 3. Database Connection & Environment Adjustments

### 3.1 Backend Database Connection Architecture
The PBBET backend utilizes **Prisma Client** (instantiated in `server/src/config/db.js`) to connect to a **MySQL** database.
The connection string is read from the `DATABASE_URL` environment variable:
```
DATABASE_URL="mysql://root:password@localhost:3306/pbbet"
```

### 3.2 Adjustments and Considerations for Local E2E Testing
1. **Database Parity (Why SQLite cannot be used)**:
   - The Prisma schema (`server/prisma/schema.prisma`) specifies MySQL-specific attributes such as `@db.Decimal(15, 2)` for decimal fields. SQLite does not support native high-precision Decimals or the `@db` attribute syntax in Prisma.
   - The schema uses native database Enums (`enum Role`, `enum KycStatus`, etc.), which SQLite does not natively implement.
   - **Conclusion**: Local testing *must* use a MySQL instance to run successfully without modifying database-specific code.

2. **Testing Database Strategy**:
   - Spin up a local MySQL instance using Docker:
     ```yaml
     # docker-compose.test.yml
     version: '3.8'
     services:
       mysql-test:
         image: mysql:8.0
         environment:
           MYSQL_ROOT_PASSWORD: password
           MYSQL_DATABASE: pbbet_test
         ports:
           - "3306:3306"
     ```
   - Prior to running the test suite, target the test database using a `.env.test` configuration file or explicit environment variables:
     ```bash
     DATABASE_URL="mysql://root:password@localhost:3306/pbbet_test"
     ```
   - Before launching tests, execute schema migrations and seed the test database:
     ```bash
     npx env-cmd -f .env.test npx prisma db push
     npx env-cmd -f .env.test node prisma/seed.js
     ```
