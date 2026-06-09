# Frontend & Admin Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore full functionality to the PBBET frontend and admin dashboard by wiring them to the real backend API.

**Architecture:** Use JWT authentication, local persistence for user state, and React context for game state. Implementation follows a modular approach for each dashboard tab.

**Tech Stack:** Next.js 15, TypeScript, React Context, Tailwind CSS.

---

### Task 1: Auth Restoration (Login, Register, Admin Login)

**Files:**
- Modify: `Frontend/src/app/login/page.tsx`
- Modify: `Frontend/src/app/register/page.tsx`
- Modify: `Frontend/src/app/admin/login/page.tsx`

- [ ] **Step 1: Update Login Page**
  Ensure `login/page.tsx` correctly saves the `token`, `user` object, and an `isAdmin` flag to `localStorage`.

- [ ] **Step 2: Update Register Page**
  Ensure `register/page.tsx` correctly handles the backend response and redirects to login.

- [ ] **Step 3: Fix Admin Login Page**
  Replace hardcoded credentials in `admin/login/page.tsx` with a call to the backend `/auth/login`. Verify `user.role === 'ADMIN'`.

---

### Task 2: Casino Lobby Enhancements

**Files:**
- Modify: `Frontend/src/components/features/games/CasinoGameLobby.tsx`

- [ ] **Step 1: Add Refresh Balance Button**
  Add a button next to the credits display in `CasinoGameLobby.tsx`.

- [ ] **Step 2: Implement Balance Refresh Logic**
  Create a `refreshBalance` function that calls `${BACKEND_URL}/user/profile` and updates both `localStorage` and local state.

- [ ] **Step 3: Wire handlePlay to Backend**
  Ensure `handlePlay` uses `vendorCode` and `gameCode` correctly to fetch the launch URL from `${BACKEND_URL}/user/launch`.

---

### Task 3: Game Store Mapping Fix

**Files:**
- Modify: `Frontend/src/contexts/GameStoreContext.tsx`

- [ ] **Step 1: Update fetchGames Mapping**
  Update the `fetchGames` function to correctly map backend fields to the `Game` type. Ensure `vendorCode` is captured.

---

### Task 4: Admin Dashboard - Dashboard & User Management Tabs

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx`

- [ ] **Step 1: Secure API Calls with JWT**
  Update `fetchData` in `admin/page.tsx` to include the `Authorization: Bearer <token>` header.

- [ ] **Step 2: Implement Real Stats**
  Ensure "Total Users", "Pending KYC", and "Total Liquidity" are calculated from live data.

- [ ] **Step 3: User Management Table**
  Ensure the user table displays real data from the backend.

---

### Task 5: Admin Dashboard - KYC Verification Tab

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx`

- [ ] **Step 1: Implement KYC List**
  Filter users with `kycStatus: 'PENDING'` for the KYC tab.

- [ ] **Step 2: Implement Approve/Reject KYC**
  Add buttons and logic to call `PATCH /api/admin/users/:userId/kyc` with the new status.

---

### Task 6: Admin Dashboard - Financial Desk Tab

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx`

- [ ] **Step 1: Implement Financial Requests List**
  Fetch and display pending transactions from `${BACKEND_URL}/admin/financial-requests`.

- [ ] **Step 2: Implement Approve Financial Request**
  Add logic to call `POST /api/admin/financial-requests/:transactionId/approve`.

---

### Task 7: Admin Dashboard - Game Manage (RTP) Tab

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx`

- [ ] **Step 1: Implement Set RTP Logic**
  Update `handleSetRTP` to call `${BACKEND_URL}/admin/game/set-rtp` with `username`, `vendorCode`, and `rtp`.

---

### Task 8: Final Verification & Type Checks

**Files:**
- Modify: `Frontend/package.json` (to check build command)

- [ ] **Step 1: Fix Type Errors**
  Run `npm run build` in the `Frontend` directory and fix any remaining TypeScript or linting errors.

- [ ] **Step 2: Verify End-to-End Flow**
  Manually verify login -> lobby -> game launch and admin login -> dashboard operations.
