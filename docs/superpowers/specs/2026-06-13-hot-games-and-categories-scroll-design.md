# Spec: Hot Games Default & Category Smooth Scroll Navigation

This specification describes the changes to replace the "All Games" category with "Hot Games" as the default landing page view and implement functional scroll-navigation controls for the horizontal category selector.

## 1. Goal
1. Default the landing page tab to "গরম খেলা" (Hot Games, key `"all"`) instead of "All Games" (`"home"`).
2. Align the horizontal category chips selection bar on the landing page to support the exact 10 game categories from the sidebar.
3. Fix accessibility and visibility of categories that go off-screen by providing functional scroll left/right chevron buttons.

---

## 2. Technical Design

### 2.1 Default Category State
Modify `initialState.selectedCategory` in [GameStoreContext.tsx](file:///home/saimon/grp/gamble/Frontend/src/contexts/GameStoreContext.tsx):
- Change default `selectedCategory` from `"home"` to `"all"`.

### 2.2 Category Chips Alignment
Align the `CATEGORIES` config array in [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx):
```typescript
const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "Hot Games", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "live", label: "Casino", icon: <Gamepad2 className="h-4 w-4" /> },
  { key: "slots", label: "Slots", icon: <Cherry className="h-4 w-4" /> },
  { key: "megaways", label: "Megaways", icon: <Sparkles className="h-4 w-4" /> },
  { key: "cards", label: "Card Games", icon: <Spade className="h-4 w-4" /> },
  { key: "table", label: "Table Games", icon: <Spade className="h-4 w-4" /> },
  { key: "fishing", label: "Fishing", icon: <Anchor className="h-4 w-4" /> },
  { key: "crash", icon: <Zap className="h-4 w-4" /> },
  { key: "lottery", icon: <Dices className="h-4 w-4" /> },
  { key: "arcade", icon: <Crown className="h-4 w-4" /> },
];
```
*Note: Add `useRef` to the React import statement and add `ChevronLeft` to the `lucide-react` import statement in [page.tsx](file:///home/saimon/grp/gamble/Frontend/src/app/page.tsx).*

### 2.3 Category Label Localization
Update `getCategoryLabel` inside the `HomePage` component to handle all keys:
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

### 2.4 Functional Scroll Navigation
Create `categoriesRef` and scroll helper inside `HomePage`:
```typescript
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scrollCategories = useCallback((direction: "left" | "right") => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      categoriesRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);
```

Replace the category chip container with the ref-bound horizontal slider flanked by chevron buttons:
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

---

## 3. Verification Plan
- Verify page compilation using `npm run build` inside `Frontend/`.
- Verify E2E tests are passing using `node tests/e2e/run-tests.js`.
