# OroPlay Production Frontend

## What is implemented

- All 20 OroPlay Integration API endpoints (PDF v1.1.1) are mapped in server-side code.
- Exact Seamless Wallet callback endpoints are available:
  - `POST /api/balance`
  - `POST /api/transaction`
  - `POST /api/batch-transactions`
- Server-side bearer token creation/caching (`/auth/createtoken`) is implemented.
- Endpoint-level rate limiting is implemented, including strict limits for:
  - `/betting/history/by-date-v2` -> 1 request / second
  - `/game/users/batch-rtp` -> 1 request / 3 seconds

## Production checks

```bash
npm install
npm run prod:check
```

## Local run

```bash
npm run dev
```
