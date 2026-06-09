# Test Suite Status: READY

The end-to-end (E2E) integration test suite is fully complete, functional, and ready to be executed.

## How to Run the Test Suite

Run the following command from the repository root:

```bash
node tests/e2e/run-tests.js
```

## Setup Configuration

The test runner automatically overrides and sets the following configurations when spawning the server processes:

- **Backend Port**: `5003`
- **Mock OroPlay Server Port**: `5002`
- **OroPlay Base URL**: `http://localhost:5002/api/v2`
- **Client Credentials**:
  - `OROPLAY_CLIENT_ID`: `RSU2`
  - `OROPLAY_CLIENT_SECRET`: `UoHxygREc2f238EbEBYxEjMR3xoZJP55`
- **Prisma MySQL Database Isolation**: Automatically truncates `Transaction`, `GameSession`, `User`, `Banner`, and `SiteSetting` tables, then seeds a fresh default admin and configuration before executing.

## Testing Scope
All 4 tiers of verification are mapped out programmatically:
1. **Tier 1**: Happy paths for auth, CMS settings, games list, launching game, balance fetching, deposit, single bet/win transactions.
2. **Tier 2**: Boundary & corner cases for zero/negative balances, invalid users, overflow amounts, basic auth failure, token expiration, invalid payloads.
3. **Tier 3**: Cross-feature combinations including multiple sequential bets, bets followed by wins, deposit followed by bet, and sequential batch-transactions with idempotency checks.
4. **Tier 4**: Real-world workloads including user signup, KYC status update, manual deposit creation, list, and approval, multiple game plays, RTP update integration, and profile validations.
