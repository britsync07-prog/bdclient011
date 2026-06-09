# Admin Panel Banner CRUD Exploration Report

This report documents the investigation of the Express backend admin banner endpoints and the design for integrating a Banners management tab within the Admin panel on the Next.js frontend.

---

## 1. Express Backend Admin Banner Endpoints

All admin banner endpoints are protected by `protect` and `adminOnly` middlewares. They require the following headers:
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json` (for `POST` and `PUT` request payloads)

### A. GET `/api/admin/banners`
- **Purpose**: Retrieve all banners (both active and inactive) in ascending order of their `order` index.
- **Request Parameters**: None
- **Response Structure (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Welcome Bonus Banner",
        "imageUrl": "https://example.com/banner-welcome.jpg",
        "linkUrl": "/promotions/welcome",
        "isActive": true,
        "order": 1,
        "createdAt": "2026-06-07T14:46:44.000Z",
        "updatedAt": "2026-06-07T14:46:44.000Z"
      }
    ]
  }
  ```

### B. POST `/api/admin/banners`
- **Purpose**: Add a new banner record.
- **Request Body**:
  ```json
  {
    "title": "New Promotion",          // String (optional)
    "imageUrl": "https://img.url/b.jpg", // String (required)
    "linkUrl": "/games/lobby",          // String (optional)
    "isActive": true,                   // Boolean (optional, default: true)
    "order": 2                          // Integer (optional, default: 0)
  }
  ```
- **Response Structure (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "title": "New Promotion",
      "imageUrl": "https://img.url/b.jpg",
      "linkUrl": "/games/lobby",
      "isActive": true,
      "order": 2,
      "createdAt": "2026-06-07T14:48:00.000Z",
      "updatedAt": "2026-06-07T14:48:00.000Z"
    }
  }
  ```

### C. PUT `/api/admin/banners/:id`
- **Purpose**: Update an existing banner's fields.
- **Request Parameters**: `id` (integer) - the primary key of the banner.
- **Request Body** (Any combination of the following banner properties):
  ```json
  {
    "title": "Updated Title",
    "imageUrl": "https://img.url/updated.jpg",
    "linkUrl": "/games/slots",
    "isActive": false,
    "order": 3
  }
  ```
- **Response Structure (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "title": "Updated Title",
      "imageUrl": "https://img.url/updated.jpg",
      "linkUrl": "/games/slots",
      "isActive": false,
      "order": 3,
      "createdAt": "2026-06-07T14:48:00.000Z",
      "updatedAt": "2026-06-07T14:49:15.000Z"
    }
  }
  ```

### D. DELETE `/api/admin/banners/:id`
- **Purpose**: Permanently delete a banner record.
- **Request Parameters**: `id` (integer) - the primary key of the banner.
- **Response Structure (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Banner deleted"
  }
  ```

---

## 2. Frontend Admin UI Integration Design (`Frontend/src/app/admin/page.tsx`)

To support Banner CRUD on the frontend dashboard, we must add a new navigation item, manage local banner state, configure API operations, and render dynamic form/list controls.

### A. State Management
We need to manage the list of banners, form states (whether creating or editing), and input field bindings:
```typescript
interface Banner {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  order: number;
}

const [banners, setBanners] = useState<Banner[]>([]);
const [isFormOpen, setIsFormOpen] = useState(false);
const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
const [bannerForm, setBannerForm] = useState({
  title: "",
  imageUrl: "",
  linkUrl: "",
  isActive: true,
  order: 0,
});
```

### B. API Request Functions
The dashboard should implement functions to hit the backend Express API using the admin JWT token retrieved from `localStorage`.
- **Fetch Banners**: Added to `fetchData` callback to fetch `/api/admin/banners`.
- **Add Banner**: Triggers `POST /api/admin/banners` on form submit.
- **Update Banner**: Triggers `PUT /api/admin/banners/:id` when editing is submitted.
- **Delete Banner**: Triggers `DELETE /api/admin/banners/:id` when delete is confirmed.

### C. Forms, List View, and Controls
1. **Sidebar Link**: A navigation tab item `banners` added under the Operations section of the sidebar.
2. **Form UI**: A card element styled with Tailwind that contains fields for Title, Image URL, Link URL, Order, and Active Status. Displays conditional "Create New Banner" or "Edit Banner" text.
3. **List View**: A table rendering:
   - Image preview container (aspect ratio matches main slider rendering).
   - Text metadata (Title, Link URL).
   - Order Index.
   - Status Badge (styled dynamic green/slate border).
   - Control Buttons (Edit/Delete).

---

## 3. Recommended Code Changes & Line Ranges

### File: `Frontend/src/app/admin/page.tsx`

#### 1. Define Banner Interface & Update Imports
- **Location**: Insert after `FinancialRequest` interface declaration (line 25).
- **Proposed Change**:
```typescript
interface Banner {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
```

#### 2. Declare Banner States
- **Location**: Insert inside `AdminDashboard` component, right after `settingsData` state (line 39).
- **Proposed Change**:
```typescript
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    order: 0,
  });
```

#### 3. Fetch Banners in `fetchData` Callback
- **Location**: Insert inside the `try` block of the `fetchData` function, right after the settings API call (line 65).
- **Proposed Change**:
```typescript
      const bannersRes = await fetch(`${BACKEND_URL}/admin/banners`, { headers });
      const bannersJson = await bannersRes.json();
      if (bannersJson.success) {
        setBanners(bannersJson.data || []);
      }
```

#### 4. Add Banner CRUD Event Handlers
- **Location**: Insert before `handleLogout` function (line 157).
- **Proposed Change**:
```typescript
  const resetBannerForm = () => {
    setBannerForm({
      title: "",
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      order: 0,
    });
  };

  const startEditBanner = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive,
      order: banner.order,
    });
    setIsFormOpen(true);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/banners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bannerForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Banner created successfully");
        setIsFormOpen(false);
        resetBannerForm();
        fetchData();
      } else {
        alert(data.message || "Failed to create banner");
      }
    } catch {
      alert("Error creating banner");
    }
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBannerId === null) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/banners/${editingBannerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bannerForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Banner updated successfully");
        setIsFormOpen(false);
        setEditingBannerId(null);
        resetBannerForm();
        fetchData();
      } else {
        alert(data.message || "Failed to update banner");
      }
    } catch {
      alert("Error updating banner");
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/banners/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert("Banner deleted successfully");
        fetchData();
      } else {
        alert(data.message || "Failed to delete banner");
      }
    } catch {
      alert("Error deleting banner");
    }
  };
```

#### 5. Add Banner Navigation Tab Item to Sidebar
- **Location**: Insert in operations list of the Sidebar, after the "Site Settings" `SidebarItem` (line 187).
- **Proposed Change**:
```typescript
                 <SidebarItem id="banners" icon="🖼️" label="Banners CMS" active={activeTab === "banners"} onClick={setActiveTab} />
```

#### 6. Add Banner tab content in Dashboard Main Area
- **Location**: Insert in the main content container, after the `settings` tab block (line 405).
- **Proposed Change**:
```typescript
            {activeTab === "banners" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="mb-0">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Homepage Banners</h3>
                    <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2" />
                  </div>
                  {!isFormOpen && (
                    <button
                      onClick={() => {
                        setEditingBannerId(null);
                        resetBannerForm();
                        setIsFormOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-widest"
                    >
                      + Add New Banner
                    </button>
                  )}
                </div>

                {isFormOpen && (
                  <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-[40px] p-12 shadow-2xl">
                    <h4 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">
                      {editingBannerId ? "Edit Banner" : "Create New Banner"}
                    </h4>
                    <form onSubmit={editingBannerId ? handleUpdateBanner : handleAddBanner} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Banner Title (Optional)</label>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all"
                          placeholder="e.g. 200% First Deposit Bonus"
                          value={bannerForm.title}
                          onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Image URL (Required)</label>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all"
                          placeholder="https://example.com/banner.jpg"
                          value={bannerForm.imageUrl}
                          onChange={e => setBannerForm({...bannerForm, imageUrl: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Link URL (Optional)</label>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all"
                          placeholder="e.g. /promotions or /game/pragmatic-gates-of-olympus"
                          value={bannerForm.linkUrl}
                          onChange={e => setBannerForm({...bannerForm, linkUrl: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Order Index</label>
                          <input
                            type="number"
                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all"
                            value={bannerForm.order}
                            onChange={e => setBannerForm({...bannerForm, order: parseInt(e.target.value) || 0})}
                            min={0}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Status</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all"
                            value={bannerForm.isActive ? "true" : "false"}
                            onChange={e => setBannerForm({...bannerForm, isActive: e.target.value === "true"})}
                          >
                            <option value="true">Active (Visible)</option>
                            <option value="false">Inactive (Hidden)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-emerald-900/40 uppercase tracking-[0.2em] text-xs"
                        >
                          {editingBannerId ? "Update Banner" : "Save Banner"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            setEditingBannerId(null);
                            resetBannerForm();
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-5 rounded-3xl transition-all uppercase tracking-[0.2em] text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                      <tr>
                        <th className="px-10 py-6 w-1/4">Preview</th>
                        <th className="px-10 py-6">Title / URL Link</th>
                        <th className="px-10 py-6 w-24 text-center">Order</th>
                        <th className="px-10 py-6 w-32 text-center">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {banners.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-10 py-12 text-center text-slate-500 italic">
                            No banners found. Click "+ Add New Banner" to get started.
                          </td>
                        </tr>
                      ) : (
                        banners.map((banner) => (
                          <tr key={banner.id} className="hover:bg-slate-800/20 transition-colors group">
                            <td className="px-10 py-6">
                              <div className="relative w-full h-16 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={banner.imageUrl}
                                  alt={banner.title || "Banner Preview"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x200?text=Invalid+Image+URL';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <div className="font-bold text-white">{banner.title || <span className="italic text-slate-500 font-normal">Untitled Banner</span>}</div>
                              <div className="text-xs text-slate-400 mt-1 font-mono break-all">{banner.linkUrl || "No Link"}</div>
                            </td>
                            <td className="px-10 py-6 text-center font-bold text-emerald-400">{banner.order}</td>
                            <td className="px-10 py-6 text-center">
                              <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                banner.isActive
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-10 py-6 text-right space-x-4">
                              <button
                                onClick={() => startEditBanner(banner)}
                                className="text-emerald-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
```

---

## 4. Auxiliary Findings & Critical Contract Mismatches

During the audit of `Frontend/src/app/admin/page.tsx`, we found the following issues that require immediate correction to ensure the other tabs of the admin page work properly:

### A. Game RTP Endpoint and Payload Mismatches
1. **Endpoint Route**: 
   - **Current**: Requests `POST ${BACKEND_URL}/admin/set-rtp` (line 89).
   - **Fix**: Point to `${BACKEND_URL}/admin/game/set-rtp` to match the backend router config.
2. **Payload Fields**: 
   - **Current**: Sends `{ userCode: string, vendorCode: string, rtp: number }` (lines 32, 95).
   - **Fix**: Change body field `userCode` to `username` to satisfy backend Zod schemas.

### B. KYC Update Payload Mismatch
- **Current**: Sends `JSON.stringify({ status })` (line 113).
- **Fix**: Change field to `kycStatus` matching Zod schema: `JSON.stringify({ kycStatus: status })`.
