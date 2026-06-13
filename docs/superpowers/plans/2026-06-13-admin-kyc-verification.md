# Admin KYC Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a KYC Verification management feature to the admin panel where admins can review user-submitted NID front and back cards, zoom into them in a high-resolution modal, and approve or reject/cancel the verification directly.

**Architecture:** Extend the Next.js React client in the admin panel to handle additional user fields (`nidFront`, `nidBack`), insert a column in the user management table for document thumbnail previews, and build an overlay modal for document inspection and direct action.

**Tech Stack:** Next.js (React/TypeScript), Tailwind CSS, Lucide icons.

---

### Task 1: Update User Interface Types

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx:40-47`

- [ ] **Step 1: Add NID fields to the User interface**
  Extend the `User` interface to include optional fields for NID images:
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

- [ ] **Step 2: Commit**
  ```bash
  git add Frontend/src/app/admin/page.tsx
  git commit -m "feat(admin): extend User type interface with NID image fields"
  ```

---

### Task 2: Implement Documents Column and Thumbnails in Users Table

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx` (around lines 950-1025)

- [ ] **Step 1: Add table header**
  In the user management `table` head element, insert the "Documents" header between "ব্যালেন্স" (Balance) and "KYC Status":
  ```tsx
  <th className="px-6 py-4">ব্যালেন্স</th>
  <th className="px-6 py-4">Documents</th>
  <th className="px-6 py-4">KYC Status</th>
  ```

- [ ] **Step 2: Render thumbnails in row cells**
  In the `tbody` mapping, construct the full NID image paths by resolving backend URLs and render interactive thumbnails:
  ```tsx
  <td className="px-6 py-4 font-mono font-semibold text-[#0F172A]">
    ৳{parseFloat(user.balance as string || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
  </td>
  <td className="px-6 py-4">
    {user.nidFront || user.nidBack ? (
      <div className="flex items-center gap-2">
        {user.nidFront && (
          <div 
            onClick={() => setActiveKycViewerUser(user)}
            className="cursor-pointer group relative w-10 h-7 rounded border border-slate-200 overflow-hidden bg-slate-100 hover:border-indigo-500 transition-all hover:scale-105"
            title="Click to view front side"
          >
            <img 
              src={user.nidFront.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${user.nidFront}` : user.nidFront} 
              alt="Front" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        {user.nidBack && (
          <div 
            onClick={() => setActiveKycViewerUser(user)}
            className="cursor-pointer group relative w-10 h-7 rounded border border-slate-200 overflow-hidden bg-slate-100 hover:border-indigo-500 transition-all hover:scale-105"
            title="Click to view back side"
          >
            <img 
              src={user.nidBack.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${user.nidBack}` : user.nidBack} 
              alt="Back" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    ) : (
      <span className="text-slate-400 text-xs italic">No Documents</span>
    )}
  </td>
  <td className="px-6 py-4">
    <KycBadge status={user.kycStatus} />
  </td>
  ```

- [ ] **Step 3: Define activeKycViewerUser state**
  Add state hook near other frontend states (around line 300-400):
  ```typescript
  const [activeKycViewerUser, setActiveKycViewerUser] = useState<User | null>(null);
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add Frontend/src/app/admin/page.tsx
  git commit -m "feat(admin): add Documents column with interactive NID thumbnails"
  ```

---

### Task 3: Implement Inspection Modal

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx`

- [ ] **Step 1: Add modal rendering block**
  Append the inspection modal at the bottom of the page wrapper:
  ```tsx
  {/* KYC NID Inspection Modal */}
  {activeKycViewerUser && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-[#0F172A] text-lg">
              KYC Document Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewing documents for player: <span className="font-semibold text-indigo-600">{activeKycViewerUser.username}</span>
            </p>
          </div>
          <button
            onClick={() => setActiveKycViewerUser(null)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Documents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Photo */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                NID Card Front Side
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-2 min-h-[250px]">
                {activeKycViewerUser.nidFront ? (
                  <img
                    src={activeKycViewerUser.nidFront.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${activeKycViewerUser.nidFront}` : activeKycViewerUser.nidFront}
                    alt="NID Front"
                    className="max-h-[350px] object-contain rounded-lg w-full"
                  />
                ) : (
                  <span className="text-slate-400 text-sm italic">Front photo not uploaded</span>
                )}
              </div>
            </div>

            {/* Back Photo */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                NID Card Back Side
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-2 min-h-[250px]">
                {activeKycViewerUser.nidBack ? (
                  <img
                    src={activeKycViewerUser.nidBack.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${activeKycViewerUser.nidBack}` : activeKycViewerUser.nidBack}
                    alt="NID Back"
                    className="max-h-[350px] object-contain rounded-lg w-full"
                  />
                ) : (
                  <span className="text-slate-400 text-sm italic">Back photo not uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Status:</span>
            <KycBadge status={activeKycViewerUser.kycStatus} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveKycViewerUser(null)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await handleUpdateKYC(activeKycViewerUser.id, "REJECTED");
                setActiveKycViewerUser(null);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <XCircle className="w-4 h-4" />
              Reject KYC
            </button>
            <button
              onClick={async () => {
                await handleUpdateKYC(activeKycViewerUser.id, "APPROVED");
                setActiveKycViewerUser(null);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Approve KYC
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add Frontend/src/app/admin/page.tsx
  git commit -m "feat(admin): implement NID high-resolution document viewer modal"
  ```

---

### Task 4: Ensure Complete Local Sync of React State on Update

**Files:**
- Modify: `Frontend/src/app/admin/page.tsx:420-450`

- [ ] **Step 1: Verify and update handleUpdateKYC state sync**
  Make sure that when `handleUpdateKYC` executes, it maps over the local state of users to update the specific record:
  ```typescript
  const handleUpdateKYC = async (userId: string, status: string) => {
    logClientAction("Admin Update KYC Submit", { userId, status });
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/kyc`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ kycStatus: status }),
      });
      const data = await res.json();
      if (res.ok) {
        logClientAction("Admin Update KYC Success", { userId, status });
        showToast(`KYC ${status.toLowerCase()} successfully`, true);
        
        // Update user state dynamically
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, kycStatus: status } : u))
        );
      } else {
        logClientAction("Admin Update KYC Fail", { userId, status, error: data.message });
        showToast("Failed to update KYC", false);
      }
    } catch (err: any) {
      const errMsg = err?.message || "Unknown error";
      logClientAction("Admin Update KYC Error", { userId, status, error: errMsg });
      showToast("Failed to update KYC", false);
    }
  };
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add Frontend/src/app/admin/page.tsx
  git commit -m "fix(admin): update local state after successful KYC update API call"
  ```

---

### Task 5: Compilation and Verification

- [ ] **Step 1: Compile Next.js build**
  Clean Next.js cache and run compile verification:
  ```bash
  cd Frontend
  rm -rf .next
  npm run build
  ```
  Expected: Success without compilation errors.

- [ ] **Step 2: Commit and Push**
  ```bash
  git push origin main
  ```
