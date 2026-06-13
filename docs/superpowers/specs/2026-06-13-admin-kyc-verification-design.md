# Design: Admin KYC Verification UI

This design document covers implementing the admin-side verification interface for reviewing submitted User KYC documents (NID card front and back photos).

## Proposed Changes

### 1. Frontend Types (`Frontend/src/app/admin/page.tsx`)
Extend the `User` interface to include the `nidFront` and `nidBack` image URL paths:
```typescript
interface User {
  id: string;
  username: string;
  balance: string | number;
  kycStatus: string;
  role: string;
  createdAt: string;
  nidFront?: string;
  nidBack?: string;
}
```

### 2. User Table UI (`Frontend/src/app/admin/page.tsx`)
* **New Table Header**: Add a column header "Documents" / "পরিচয়পত্র" between the "Balance" and "KYC Status" columns in the users table.
* **Document Thumbnails**:
  * For each user row, render a "Documents" cell.
  * If the user has uploaded documents (`nidFront` or `nidBack` exists), display two side-by-side clickable preview images.
  * Construct image sources by prepending the backend URL host:
    ```typescript
    const frontUrl = user.nidFront?.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${user.nidFront}` : user.nidFront;
    const backUrl = user.nidBack?.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${user.nidBack}` : user.nidBack;
    ```
  * Use a clean CSS layout for thumbnails with a subtle scale-up animation on hover, and clear labels ("Front" / "Back").
  * If the user hasn't uploaded any documents, render a muted text badge: `"No Documents"`.

### 3. Inspection Modal (`Frontend/src/app/admin/page.tsx`)
* Implement a stateful modal component (e.g., `activeKycViewerUser` containing the user object to inspect).
* The modal will present:
  * User details (Username, Current Status).
  * High-resolution view of the NID Front and NID Back images side-by-side (or stacked on mobile devices) for clear legibility.
  * Action buttons: "Approve KYC" (green) and "Reject KYC" (red) to perform the action directly from the modal.
  * Close button (`X`) and backdrop click handler to exit the modal view.

### 4. API Integration & React State Sync (`Frontend/src/app/admin/page.tsx`)
* The existing `handleUpdateKYC(userId, status)` triggers the backend `PATCH /api/admin/users/:userId/kyc`.
* Ensure that when the KYC update succeeds, the user list state (`users` and `filteredUsers`) updates the specific user's `kycStatus` field dynamically:
  ```typescript
  setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: status } : u));
  ```
* Ensure the inspection modal is dismissed automatically upon action completion.
