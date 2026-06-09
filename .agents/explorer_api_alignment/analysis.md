# PBBET API Integration Alignment Report

**Date**: 2026-06-07  
**Status**: Investigation Completed  
**Focus**: Next.js API Routes Wallet Delegation, Admin Contract Mismatches, and Dynamic Games Metadata Alignment

---

## 1. Executive Summary

This report documents the detailed investigation and design for aligning the Next.js API routes and the admin dashboard with the Express backend APIs. 

1. **Seamless Wallet Integration**: The local memory store (`seamless-store.ts`) is bypassed. The Next.js API routes (`/api/balance`, `/api/transaction`, `/api/batch-transactions` and their counterparts under `/api/seamless/...`) are designed to delegate/proxy all client requests directly to the corresponding Express backend endpoints (`POST /api/balance`, `POST /api/transaction`, `POST /api/batch-transactions`) using `fetch`, forwarding the `Authorization` header and payload unmodified.
2. **Admin Dashboard Contract Fixes**: Fixes have been designed for the 3 mismatches in `Frontend/src/app/admin/page.tsx` when interacting with `server/src/routes/adminRoutes.js` and `server/src/controllers/adminController.js`:
   * Changing the set RTP route from `/admin/set-rtp` to `/admin/game/set-rtp`.
   * Mapping `userCode` to `username` in the set RTP payload.
   * Mapping `status` to `kycStatus` in the KYC status update patch body.
3. **Dynamic Game Properties Mapping**: A dynamic parsing strategy has been designed for both the Express backend controller (`server/src/controllers/userController.js`) and the frontend game store context (`Frontend/src/contexts/GameStoreContext.tsx`) to infer game `category` and `rating` dynamically based on vendor code and game names, instead of hardcoding them to `"slots"` and `4.5`.

---

## 2. Detailed Code Modifications & Alignment Design

### A. Next.js Seamless Wallet API Routes Delegation

To eliminate the Next.js local memory store `seamless-store.ts`, the Next.js seamless API endpoints are modified to act as reverse-proxies that forward requests to the Express backend.

#### 1. File: `Frontend/src/app/api/seamless/balance/route.ts`
* **Current state**: Uses `getUserBalance` from `@/lib/seamless-store`.
* **Line Range**: 1 - 18
* **Recommended Code Replacement**:
```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Seamless balance proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", errorCode: 1 },
      { status: 500 }
    );
  }
}
```

#### 2. File: `Frontend/src/app/api/seamless/transaction/route.ts`
* **Current state**: Uses `applyTransaction`, `isDuplicateTransaction`, and `markTransaction` from `@/lib/seamless-store`.
* **Line Range**: 1 - 27
* **Recommended Code Replacement**:
```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Seamless transaction proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", errorCode: 1 },
      { status: 500 }
    );
  }
}
```

#### 3. File: `Frontend/src/app/api/seamless/batch-transactions/route.ts`
* **Current state**: Binds to `@/lib/seamless-store` in a loop.
* **Line Range**: 1 - 40
* **Recommended Code Replacement**:
```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/batch-transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Seamless batch-transactions proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", errorCode: 1 },
      { status: 500 }
    );
  }
}
```

---

### B. Admin Dashboard Contract Alignments

#### 4. File: `Frontend/src/app/admin/page.tsx`
* **Target Changes**: Fix API endpoints, property mapping, and KYC patch body layout.
* **Mismatch 1 & 2 (RTP Config)**: Fixes endpoint from `/admin/set-rtp` to `/admin/game/set-rtp`, and maps payload properties: `userCode` to `username`.
  * **Line Range**: 85 - 102
  * **Recommended Code Replacement**:
  ```typescript
  const handleSetRTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/game/set-rtp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorCode: rtpData.vendorCode,
          username: rtpData.userCode,
          rtp: rtpData.rtp
        }),
      });
      const data = await res.json();
      alert(data.message || "RTP updated successfully");
    } catch {
      alert("Failed to update RTP");
    }
  };
  ```

* **Mismatch 3 (KYC Status Update)**: Fixes payload property from `status` to `kycStatus`.
  * **Line Range**: 104 - 119
  * **Recommended Code Replacement**:
  ```typescript
  const handleUpdateKYC = async (userId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/kyc`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ kycStatus: status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };
  ```

---

### C. Game Categories & Ratings Dynamic Mappings

To implement dynamic parsing instead of hardcoded slots category and 4.5 rating values, changes are applied on both the Express backend and the Next.js game context.

#### 5. File: `server/src/controllers/userController.js`
* **Target Changes**: Add category and rating parser helper mapping to the games collection response mapping.
* **Line Range**: 53 - 59
* **Recommended Code Replacement**:
```javascript
        const games = result.data.message.map(game => {
          // Parse category dynamically
          let category = 'slots';
          const nameLower = (game.gameName || '').toLowerCase();
          const vendorLower = (vendor.vendorCode || '').toLowerCase();
          
          if (vendorLower.includes('slot') || nameLower.includes('slot') || nameLower.includes('book') || nameLower.includes('gates') || nameLower.includes('sweet') || nameLower.includes('dog')) {
            category = 'slots';
          } else if (vendorLower.includes('live') || vendorLower.includes('evolution') || nameLower.includes('live') || nameLower.includes('lobby')) {
            category = 'live';
          } else if (nameLower.includes('blackjack') || nameLower.includes('roulette') || nameLower.includes('poker') || nameLower.includes('baccarat') || nameLower.includes('dice') || nameLower.includes('card') || nameLower.includes('table') || nameLower.includes('crash')) {
            category = 'table';
          }

          // Parse rating dynamically (deterministic range 4.0 - 5.0 based on game name string)
          const charSum = (game.gameName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const rating = parseFloat((4.0 + (charSum % 11) * 0.1).toFixed(1));

          return {
            gameCode: game.gameCode,
            gameName: game.gameName,
            provider: vendor.vendorName || vendor.vendorCode,
            thumbnail: game.thumbnail,
            vendorCode: vendor.vendorCode,
            category,
            rating: Math.min(5.0, Math.max(4.0, rating))
          };
        });
```

#### 6. File: `Frontend/src/contexts/GameStoreContext.tsx`
* **Target Changes**: Read categories and ratings dynamically from the API results, falling back to dynamic local parser logic if backend fields are absent.
* **Line Range**: 97 - 105
* **Recommended Code Replacement**:
```typescript
          const mappedGames = data.games.map((g: { 
            gameCode: string; 
            gameName: string; 
            provider: string; 
            thumbnail: string; 
            vendorCode: string;
            category?: string;
            rating?: number;
          }) => {
            // Fallback dynamic parsing if backend fields are omitted
            let category: "slots" | "table" | "live" = "slots";
            if (g.category === "slots" || g.category === "table" || g.category === "live") {
              category = g.category;
            } else {
              const vendor = (g.vendorCode || "").toLowerCase();
              const name = (g.gameName || "").toLowerCase();
              if (vendor.includes("slot") || name.includes("slot") || name.includes("book") || name.includes("gates") || name.includes("sweet") || name.includes("dog")) {
                category = "slots";
              } else if (vendor.includes("live") || vendor.includes("evolution") || name.includes("live") || name.includes("lobby")) {
                category = "live";
              } else if (name.includes("blackjack") || name.includes("roulette") || name.includes("poker") || name.includes("baccarat") || name.includes("dice") || name.includes("card") || name.includes("table") || name.includes("crash")) {
                category = "table";
              }
            }

            let rating = 4.5;
            if (typeof g.rating === "number" && !isNaN(g.rating)) {
              rating = g.rating;
            } else {
              const charSum = (g.gameName || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
              rating = parseFloat((4.0 + (charSum % 11) * 0.1).toFixed(1));
            }

            return {
              id: g.gameCode,
              name: g.gameName,
              provider: g.provider,
              category,
              rating,
              thumbnail: g.thumbnail,
              vendorCode: g.vendorCode,
            };
          });
```
