# Scope: E2E Mock Test Suite & Verification

## Architecture
- **Mock OroPlay Server**: A mock server simulating the OroPlay v2 API. It exposes `/auth/createtoken` (generating Bearer JWT/tokens), all 20 integration endpoints (`/status`, `/vendors/list`, `/games/list`, `/game/launch-url`, `/game/user/set-rtp`, etc.), and has the capability to initiate seamless wallet callbacks (`POST /api/balance`, `POST /api/transaction`, `POST /api/batch-transactions` with Basic Auth credentials) to the operator backend to simulate gaming activity.
- **4-Tier Programmatic Test Suite**: A Node.js-based test runner that executes E2E scenarios against the actual Express backend and Next.js APIs using the mock OroPlay server to drive and verify game interactions.
  - **Tier 1 (Feature Coverage)**: Happy path tests for all major user flows (auth, setting retrieval, games list, launching game, balance fetching, deposit, transactions).
  - **Tier 2 (Boundary & Corner Cases)**: Handling empty/negative/zero balances, invalid user/basic auth credentials, invalid payloads, overflow amounts, rate-limiting mock, and API failures.
  - **Tier 3 (Cross-Feature Combinations)**: Multi-game plays, combinations of deposits + bets + wins, rollbacks, and sequential transactions.
  - **Tier 4 (Real-World Application Workloads)**: Multi-player registration, KYC updates, deposit approvals, launching game, multiple rounds of play (bets/wins), and auditing final database states.
- **Documentation**: `TEST_INFRA.md` mapping the methodology and test inventory, and `TEST_READY.md` containing the E2E verification reports.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| MS1 | Build OroPlay Mock Server | Implement server covering /auth/createtoken, 20 integration APIs, and basic auth seamless callbacks. | None | PLANNED |
| MS2 | Build 4-Tier Test Suite | Implement the programmatic test suite covering Tier 1, 2, 3, and 4 tests. | MS1 | PLANNED |
| MS3 | Integration & Verification | Run tests against Express backend, verify no rate limits/failures, ensure database updates are correct. | MS2 | PLANNED |
| MS4 | Documentation & Handover | Generate TEST_INFRA.md and TEST_READY.md in root, verify layout, and write handoff.md. | MS3 | PLANNED |

## Interface Contracts
### Express Backend / Next.js API ↔ Mock OroPlay Server
- `POST /auth/createtoken`: Returns `{ token: string, expiration: number }` for clientId/clientSecret authentication.
- `GET /vendors/list`: Returns `{ success: true, message: Vendor[], errorCode: 0 }`.
- `POST /games/list`: Body `{ vendorCode, language }`. Returns `{ success: true, message: Game[], errorCode: 0 }`.
- `POST /game/launch-url`: Body `{ vendorCode, gameCode, userCode, language, lobbyUrl, theme }`. Returns `{ success: true, data: { launchUrl: string }, errorCode: 0 }`.
- `POST /game/user/set-rtp`: Body `{ vendorCode, userCode, rtp }`. Returns `{ success: true, errorCode: 0 }`.
- Other 16 endpoints return valid mock JSON responses conforming to the schema in `api_doc.txt`.

### Mock OroPlay Server ↔ Express Backend (Seamless Wallet Callbacks)
- All requests use `Authorization: Basic <credentials>` (where credentials is `clientId:clientSecret` base64 encoded).
- `POST /api/balance`: Body `{ userCode }`. Returns `{ success: true, message: "balance", errorCode: 0, balance: number }`.
- `POST /api/transaction`: Body `{ userCode, transactionCode, amount, isFinished, isCanceled, gameCode, vendorCode }`. Returns `{ success: true, message: "new_balance", errorCode: 0, balance: number }`.
- `POST /api/batch-transactions`: Body `{ userCode, transactions: [ { transactionCode, amount } ] }`. Returns `{ success: true, message: "new_balance", errorCode: 0, balance: number }`.
