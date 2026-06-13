# Design: Homepage Category Options Reduction and Layout Optimization

This design covers reducing the number of category options in the homepage navigation bar to prevent truncation on smaller screens, while keeping the category navigation on a single row.

## Requirements
* Reduce the categories listed in the horizontal navigation on the homepage to fit on a single row.
* Prevent label truncation (such as "Hot.....") on all mobile/desktop screen widths.
* Keep the list of core options to: **Hot Games, Slots, Live Casino, Crash Games, Sports**.

## Proposed Changes

### 1. Frontend Categories List (`src/app/page.tsx`)
Modify the `CATEGORIES` array to only include the 5 core options:
```typescript
const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "Hot Games", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "slots", label: "Slots", icon: <Cherry className="h-4 w-4" /> },
  { key: "live", label: "Live Casino", icon: <Radio className="h-4 w-4" /> },
  { key: "crash", label: "Crash Games", icon: <Zap className="h-4 w-4" /> },
  { key: "sports", label: "Sports", icon: <Target className="h-4 w-4" /> },
];
```

### 2. Category Chip Styling Optimization
Currently, the category chips are rendered using `flex-1` which divides the space equally. We will replace `flex-1` with `flex-auto` or `grow` to size chips according to their content length (e.g. "Live Casino" gets more width than "Slots").
We will also tweak the margins/paddings on mobile screens to ensure the full bar fits nicely in one row on small mobile screens.
