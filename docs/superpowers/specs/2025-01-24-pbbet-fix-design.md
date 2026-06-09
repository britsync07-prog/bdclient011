# PBBET Fix Design Document

## 1. Objective
Restore the PBBET iGaming platform to a fully functional state, replacing all dummy data and hardcoded logic with real data-driven implementations integrated with the OroPlay API and MySQL database.

## 2. Architecture Overview
- **Backend**: Node.js/Express, Prisma ORM, MySQL.
- **Frontend**: Next.js 15 (App Router), Vanilla CSS (Emerald Green aesthetic).
- **Integration**: OroPlay API (Games, Launch, Seamless Wallet).

## 3. Detailed Components

### 3.1 Authentication & Authorization
- **Login**: Backend `/api/auth/login` will return `token` and `user` object `{ id, username, role, balance }`.
- **Role-based Access**: Frontend will check `user.role` to determine if a user can access the Admin Dashboard.
- **Persistence**: Store `token` and `user` in `localStorage`.
- **Admin Dashboard**: Remove hardcoded credentials. Use standard login but restricted to `ADMIN` role.

### 3.2 Game Integration
- **Game List**: Backend `/api/user/games` will fetch and return a list of games from OroPlay vendors.
- **Game Launch**: Frontend `handlePlay` will call `/api/user/launch` with `vendorCode` and `gameCode`.
- **Game Store**: Update `GameStoreContext.tsx` to correctly map the backend game data and handle the array response.

### 3.3 Admin Dashboard Restoration
- **Live Data**: All tabs (Users, Financial, Games) will fetch data from `/api/admin/*` using the JWT token.
- **Stats**: Dashboard stats (Total Users, Liquidity) will be calculated from real database records.
- **RTP Engine**: Connect the RTP range slider to the backend `/api/admin/game/set-rtp` endpoint.

### 3.4 Wallet & OroPlay Seamless API
- **Seamless Flow**: Ensure `/api/balance`, `/api/transaction`, and `/api/batch-transactions` correctly interface with Prisma and return OroPlay-compatible error codes.
- **Balance Sync**: User balance must be updated in the database on every transaction.

## 4. Verification Plan
- **Backend Tests**: Use `curl` to verify registration, login, and game fetching.
- **Frontend Build**: Run `npm run build` in the `Frontend` directory to ensure no type/lint errors.
- **Manual Check**: Verify "Play" button opens a real game window and balance updates after a simulated win/loss.

## 5. Success Criteria
- [ ] Users can register and login.
- [ ] Logged-in users see their real balance.
- [ ] Games are fetched from OroPlay and displayed in the lobby.
- [ ] Clicking "Play" launches a game in a new tab.
- [ ] Admin dashboard displays real users and financial data.
- [ ] Admin can set RTP for users via the dashboard.
