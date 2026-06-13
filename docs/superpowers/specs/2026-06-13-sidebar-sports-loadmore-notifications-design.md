# Design: Sidebar Sports, Load More, Remove Hot Tag, and Notification System

This design outlines the implementation for:
1. Adding the Sports category to the sidebar navigation.
2. Replacing "Show All" with a "Load More" pagination system (increments of 20).
3. Removing the "Hot" badge from game thumbnails.
4. Implementing a working interactive notification dropdown bar in the header.

## Proposed Changes

### 1. Sidebar Sports Category
* Add `{ key: "sports", icon: Target }` to `SIDEBAR_ITEMS` in `Frontend/src/app/page.tsx`.
* Add logic in `handleNavClick`:
  ```typescript
  } else if (key === "sports") {
    setCategory("sports");
  }
  ```

### 2. Load More Pagination
* Remove the `showMoreGames` state.
* Add `visibleCount` state: `const [visibleCount, setVisibleCount] = useState(12);`.
* Add resetting logic:
  ```typescript
  useEffect(() => {
    setVisibleCount(12);
  }, [state.selectedCategory, state.showFavoritesOnly]);
  ```
* Update rendering:
  * Display games using `filteredGames.slice(0, visibleCount)`.
  * Render the "Load More" button if `filteredGames.length > visibleCount`, which increments `visibleCount` by 20.

### 3. Remove "Hot" Tag
* Remove the `game.isPopular` check block that renders the `"Hot"` badge over game cards in `Frontend/src/app/page.tsx`.

### 4. Notification Dropdown System
* Add `readNotifications` state map: `const [readNotifications, setReadNotifications] = useState<Record<number, boolean>>({});`.
* Add `showNotifications` toggle state: `const [showNotifications, setShowNotifications] = useState(false);`.
* Map notification content dynamically based on current language `t`.
* Implement the interactive absolute-positioned dropdown container with a click-away overlay.
