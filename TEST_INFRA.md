# PBBET iGaming Platform Test Infrastructure

This document details the test philosophy, inventory, and architecture implemented for the PBBET platform overhaul.

## Test Philosophy

1. **Genuine Logic Verification**: We strictly avoid hardcoding test results or bypass logic. Every test runs real database transactions and exercises real API endpoints.
2. **State Isolation**: E2E testing must have a deterministic starting state. We implement table truncation and default seeding via Prisma Client before each test run and between test tiers to prevent leakage.
3. **Mock Third-Party Integration**: Instead of contacting the real OroPlay environment, we run a simulated OroPlay server locally that mirrors the exact API protocol, validation rules, rate limits, and bearer token protection.
4. **Programmatic Orchestration**: Test runs boot all servers automatically, await healthiness, execute 4 distinct tiers of assertions, and shut down cleanly.

---

## Architecture

```
                    +---------------------------------------+
                    |        PBBET Express Backend          |
                    |            (Port: 5003)               |
                    +-------------------+-------------------+
                                        |
              Outbound OroPlay APIs     |    Basic Auth Callbacks
              (Bearer JWT Protected)    |    (Basic Auth Protected)
                                        v
                    +-------------------+-------------------+
                    |         Mock OroPlay Server           |
                    |            (Port: 5002)               |
                    +-------------------+-------------------+
                                        ^
                                        |  Simulates game actions
                                        |  & callback triggers
                                        |
                    +-------------------+-------------------+
                    |         Programmatic Runner           |
                    |             (run-tests.js)            |
                    +---------------------------------------+
```

### Components

1. **PBBET Express Server**: The operator backend server that registers user accounts, handles admin updates (CMS, KYC, RTP), and hosts the seamless wallet callbacks (`/api/balance`, `/api/transaction`, `/api/batch-transactions`).
2. **Mock OroPlay Server**: Simulates all 20 integration endpoints (such as `vendorsList`, `gamesList`, `gameLaunchUrl`, RTP limits, transfers) and the `/auth/createtoken` Bearer JWT token issuer. It also contains the `/sim/play` controller which acts as a bridge to trigger Basic-Auth-secured callbacks to the PBBET backend.
3. **Prisma Client**: Connects directly to the MySQL database to execute clean truncation on `Transaction`, `GameSession`, `User`, `Banner`, and `SiteSetting` tables.
4. **Verification Runner**: Spawns both servers as child processes, polls their status endpoints (`/health` and `/api/v2/status`) until online, runs the 4-tier suite sequentially, catches failures, and kills both servers on completion.

---

## Test Inventory (4-Tier System)

### Tier 1: Feature Coverage (Happy Path)
- **Admin Authentication**: Admin login successfully returns a JWT token.
- **CMS settings**: Verifies public settings and banners list returns correctly.
- **CMS updates**: Admin updates CMS settings via the admin route.
- **Games listing**: Retrieves games list aggregated across all active vendors.
- **Game Launch URL**: Requests launch URL from the mock OroPlay server.
- **Balance Callback**: Calls `/api/balance` callback endpoint on operator.
- **Transactions**: Triggers seamless single bet and win callback flows and validates user balance updates.

### Tier 2: Boundary & Corner Cases
- **Zero/Negative Balances**: Rejects a gameplay bet for a player with 0 balance.
- **Invalid Users**: Ensures callback returns `USER_DOES_NOT_EXIST` for a non-existent player ID.
- **Overflow Amounts**: Rejects a bet that exceeds the user's balance.
- **Basic Auth Failure**: Rejects callback if client credentials are bad or missing.
- **Bearer Token Expiration**: Validates that mock OroPlay endpoints reject expired or invalid tokens.
- **Invalid Payload bounds**: Validates that setting game RTP outside [30-99] range is rejected with an error.

### Tier 3: Cross-Feature Combinations
- **Multiple Sequential Bets**: Plays three bets in a row and verifies cumulative balance reduction.
- **Bet and Win Sequence**: Simulates gameplay bet followed by win under the same round ID and verifies correct final balance.
- **Deposit & Bet**: Simulates deposit via transfer wallet APIs followed by a seamless gameplay bet.
- **Batch Transactions & Idempotency**: Executes a batch of mixed bet/win transactions and validates idempotency (duplicate transactions are skipped, keeping balance intact).

### Tier 4: Real-World Application Workloads
- **Signup**: Registers a brand new user.
- **KYC Status Update**: Admin updates user's KYC status to `'APPROVED'`.
- **Manual Deposit Lifecycle**: Inserts a pending deposit, lists it via the admin panel, approves the request, and verifies the user's balance is credited.
- **Game Session plays**: Simulates multiple game rounds (varying bets and wins) for the user.
- **RTP Update Integration**: Admin sets game RTP for the user, verifying alignment between operator database and mock OroPlay server settings.
- **Profile Validation**: Fetches profile and callbacks to verify final state is consistent.
