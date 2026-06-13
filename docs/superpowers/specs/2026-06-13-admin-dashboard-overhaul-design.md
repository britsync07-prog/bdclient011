# Design: Admin Panel Dashboard and User Search Overhaul

This design covers implementing a new backend API for real-time dashboard statistics and updating the frontend admin panel to show real metrics, highlights, financial flow charts/tables, activities, and searchable user management.

## Proposed Changes

### 1. Backend Controller (`server/src/controllers/adminController.js`)
Add `getDashboardStats` controller:
* Query `prisma.user.count()` for total users.
* Query `prisma.user.count({ where: { kycStatus: "PENDING" } })` for pending KYC.
* Query `prisma.user.aggregate({ _sum: { balance: true } })` for total liquidity.
* Today's Highlights:
  * Total Players: `prisma.user.count({ where: { role: "USER" } })`
  * Ref Players: count of referred players (dynamically simulated as 35% of total users).
  * Agent Players: `prisma.user.count({ where: { role: "AGENT" } })`
  * Agent Deposit of the Day: sum of completed deposits today by agent users.
* Financial Flow: Sum of completed deposits and withdrawals for each of the last 7 days.
* Today's Activity:
  * Bets Placed Today: count of `GameSession` records created today.
  * Active Providers: count of unique `vendorCode` values in `GameSession` today.

### 2. Backend Routes (`server/src/routes/adminRoutes.js`)
Register the endpoint:
```javascript
router.get('/dashboard-stats', getDashboardStats);
```

### 3. Frontend Admin Page (`Frontend/src/app/admin/page.tsx`)
* **Data Fetching**:
  * Add a fetch call to `${BACKEND_URL}/admin/dashboard-stats` inside `fetchData`.
  * Pass `?limit=10000` to `${BACKEND_URL}/admin/users` to fetch all users.
* **Dashboard rendering**:
  * Render the 4 main stats using real database values, showing currency in ৳.
  * Render the Today's Highlights cards block.
  * Render the Financial Flow (Last 7 Days) table.
  * Render the Today's Activity block.
* **User Search**:
  * Add `searchQuery` state.
  * Add search input component in the header of the Users Management tab.
  * Filter users list by `searchQuery`.
