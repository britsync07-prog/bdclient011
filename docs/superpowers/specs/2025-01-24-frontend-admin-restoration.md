# PBBET Frontend & Admin Restoration Design

## 1. Authentication Restoration
### 1.1 Unified Login
- Update `login/page.tsx` and `admin/login/page.tsx` to use the backend `/api/auth/login` endpoint.
- Store `token` and `user` object in `localStorage`.
- Set `isAdmin` in `localStorage` if `user.role === 'ADMIN'`.
- Registration (`register/page.tsx`) will redirect to login or optionally log in immediately.

## 2. Casino Game Lobby Restoration
### 2.1 Live Balance & Refresh
- Display real balance from `user.balance`.
- Add a "Refresh" button that calls `/api/user/profile` to sync balance.
### 2.2 Game Launching
- Wire `handlePlay` to `/api/user/launch`.
- Ensure `vendorCode` and `gameCode` are passed correctly.
### 2.3 Game Store Mapping
- Update `GameStoreContext.tsx` to map backend game fields:
  - `id` <- `gameCode`
  - `name` <- `gameName`
  - `vendorCode` <- `vendorCode`
  - `thumbnail` <- `thumbnail`

## 3. Admin Dashboard Restoration
### 3.1 Secure Data Fetching
- Use JWT token in `Authorization` header for all requests.
### 3.2 Feature Implementation
- **Dashboard Stats**: Calculate totals from fetched users and transactions.
- **KYC Desk**: List users, allow `Approve/Reject` status updates.
- **Financial Desk**: List pending transactions, allow `Approve` (which updates user balance on backend).
- **RTP Engine**: Connect slider to `set-rtp` endpoint.

## 4. Technical Constraints
- **Styling**: Maintain Emerald Green theme (`emerald-500`, `emerald-600`).
- **Types**: Fix all TypeScript errors to ensure `npm run build` passes.
- **Environment**: Use `NEXT_PUBLIC_BACKEND_URL` for API calls.
