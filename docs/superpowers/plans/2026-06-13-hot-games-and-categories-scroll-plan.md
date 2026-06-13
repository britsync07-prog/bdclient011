# Hot Games Default & Category Smooth Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set the default homepage category to "Hot Games" ("গরম খেলা") and make the horizontal category chips selection bar fully scrollable with left/right navigation chevron buttons.

**Architecture:** Change initial category state in `GameStoreContext` from `"home"` to `"all"`. Update `CATEGORIES` in `page.tsx` to match the exact 10 game categories from the sidebar. Wrap the categories chips in a relative div with scroll left/right handlers driven by `categoriesRef`.

**Tech Stack:** Next.js, React, Tailwind CSS, Lucide icons.

---

### Task 1: Update GameStore Initial Category State

**Files:**
- Modify: `Frontend/src/contexts/GameStoreContext.tsx`
- Test: `node tests/e2e/run-tests.js`

- [ ] **Step 1.1: Change selectedCategory default value**
  Modify [GameStoreContext.tsx](file:///home/saimon/grp/gamble/Frontend/src/contexts/GameStoreContext.tsx):
  Change `selectedCategory: "home"` to `selectedCategory: "all"` inside `initialState` (line 44):
  ```typescript
  const initialState: GameState = {
    games: [],
    searchTerm: "",
    selectedCategory: "all",
    showFavoritesOnly: false,
    isLoading: true,
  };
  ```

- [ ] **Step 1.2: Verify project builds successfully**
  Run: `npm run build` inside `Frontend`
  Expected: Compiled successfully

- [ ] **Step 1.3: Run E2E tests**
  Run: `node tests/e2e/run-tests.js`
  Expected: PASS

- [ ] **Step 1.4: Commit changes**
  Run: `git add Frontend/src/contexts/GameStoreContext.tsx && git commit -m "feat: default homepage category to all (Hot Games)"`

---

### Task 2: Realignment of Category Configuration & Translation Keys

**Files:**
- Modify: `Frontend/src/app/page.tsx`
- Test: `npm run build`

- [ ] **Step 2.1: Add ChevronLeft to lucide-react imports**
  Add `ChevronLeft` to the import destructured from `lucide-react` at the top of [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx):
  ```typescript
  import {
    Hexagon, Home, Coins, CircleDot, Users, Gift, Gem, Network, Headphones,
    Search, Globe, ChevronDown, MessageSquare, Star, Crown, Bitcoin, Trophy,
    LayoutGrid, Cherry, Radio, Grid3x3, DollarSign, ChevronRight, User,
    HelpCircle, ShieldCheck, Heart, X, LogOut, Wallet, Menu, Loader2,
    Gamepad2, Building2, HeadphonesIcon, Mail, AlertTriangle, BadgeCheck,
    Spade, Ticket, Target, LayoutDashboard, Sparkles, Anchor, Zap, Dices,
    ChevronLeft,
  } from "lucide-react";
  ```

- [ ] **Step 2.2: Add useRef to React imports**
  Ensure `useRef` is imported from `"react"` at the top of [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx):
  ```typescript
  import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
  ```

- [ ] **Step 2.3: Re-align CATEGORIES constant array**
  Modify [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx) to define the exact 10 categories matching the sidebar order and key classifications:
  ```typescript
  const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Hot Games", icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "live", label: "Casino", icon: <Gamepad2 className="h-4 w-4" /> },
    { key: "slots", label: "Slots", icon: <Cherry className="h-4 w-4" /> },
    { key: "megaways", label: "Megaways", icon: <Sparkles className="h-4 w-4" /> },
    { key: "cards", label: "Card Games", icon: <Spade className="h-4 w-4" /> },
    { key: "table", label: "Table Games", icon: <Spade className="h-4 w-4" /> },
    { key: "fishing", label: "Fishing", icon: <Anchor className="h-4 w-4" /> },
    { key: "crash", label: "Crash Games", icon: <Zap className="h-4 w-4" /> },
    { key: "lottery", label: "Lottery", icon: <Dices className="h-4 w-4" /> },
    { key: "arcade", label: "Arcade", icon: <Crown className="h-4 w-4" /> },
  ];
  ```

- [ ] **Step 2.4: Update getCategoryLabel translator**
  Modify the `getCategoryLabel` helper in `HomePage` component in [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx):
  ```typescript
    const getCategoryLabel = useCallback((key: string) => {
      switch (key) {
        case "all": return t.HOT_GAMES || "Hot Games";
        case "slots": return t.SLOTS || "Slots";
        case "live": return t.LIVE || "Live Casino";
        case "table": return t.TABLE || "Table Games";
        case "cards": return t.CARDS || "Card Games";
        case "crash": return t.CRASH || "Crash Games";
        case "fishing": return t.FISHING || "Fishing";
        case "arcade": return t.ARCADE || "Arcade";
        case "lottery": return t.LOTTERY || "Lottery";
        case "megaways": return t.MEGAWAYS || "Megaways";
        case "sports": return t.SPORTS || "Sports";
        default: return key;
      }
    }, [t]);
  ```

- [ ] **Step 2.5: Verify project builds successfully**
  Run: `npm run build` inside `Frontend`
  Expected: Compiled successfully

- [ ] **Step 2.6: Commit changes**
  Run: `git commit -a -m "feat: realign homepage category list configuration with sidebar"`

---

### Task 3: Implement Scroll ref Navigation and render controls

**Files:**
- Modify: `Frontend/src/app/page.tsx`
- Test: `node tests/e2e/run-tests.js`

- [ ] **Step 3.1: Add categoriesRef and scroll helper**
  Add the `useRef` declaration and scrolling callback inside the `HomePage` component in [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx) (near other hooks):
  ```typescript
    const categoriesRef = useRef<HTMLDivElement>(null);

    const scrollCategories = useCallback((direction: "left" | "right") => {
      if (categoriesRef.current) {
        const scrollAmount = 240;
        categoriesRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }, []);
  ```

- [ ] **Step 3.2: Wrap and render custom scroll navigation in page.tsx**
  Replace the horizontal categories navigation container (around lines 600-622) in [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx) with the ref-bound scrollable container and functional left/right chevron buttons:
  ```tsx
            {/* Categories Navigation */}
            <div className="relative flex items-center group/nav w-full">
              <button
                onClick={() => scrollCategories("left")}
                className="absolute left-2 bg-slate-900/95 hover:bg-slate-900 border border-slate-800 p-2 rounded-full transition-all flex-shrink-0 z-10 -ml-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur opacity-0 group-hover/nav:opacity-100 focus:opacity-100 flex items-center justify-center w-8 h-8 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-slate-400 hover:text-white" />
              </button>

              <div
                ref={categoriesRef}
                className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x no-scrollbar scroll-smooth w-full"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setCategory(cat.key);
                      setShowMoreGames(false);
                    }}
                    className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium whitespace-nowrap snap-start transition-all ${
                      state.selectedCategory === cat.key
                        ? "category-chip active"
                        : "category-chip bg-[#1e293b]/80 hover:bg-[#1e293b] text-slate-300"
                    }`}
                  >
                    {cat.icon} {getCategoryLabel(cat.key)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollCategories("right")}
                className="absolute right-2 bg-slate-900/95 hover:bg-slate-900 border border-slate-800 p-2 rounded-full transition-all flex-shrink-0 z-10 -mr-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur opacity-0 group-hover/nav:opacity-100 focus:opacity-100 flex items-center justify-center w-8 h-8 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 text-slate-400 hover:text-white" />
              </button>
            </div>
  ```

- [ ] **Step 3.3: Verify project builds successfully**
  Run: `npm run build` inside `Frontend`
  Expected: Compiled successfully

- [ ] **Step 3.4: Run E2E tests**
  Run: `node tests/e2e/run-tests.js`
  Expected: PASS

- [ ] **Step 3.5: Commit changes**
  Run: `git commit -a -m "feat: complete categories horizontal scrollbar and button sync"`
