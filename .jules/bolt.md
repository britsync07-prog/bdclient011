## 2025-06-10 - [React Render Optimization in Game Lobby]
**Learning:** In large lists (100+ items), `React.memo` is only effective if the callbacks passed to children are stable. Using `useRef` to store frequently changing state (like `favorites` or `user` data) inside handlers allows them to remain stable while still accessing the latest data when called.
**Action:** Always check dependency stability when using `React.memo` on list items. Use the `ref` pattern for handlers that need latest state but must remain stable to prevent mass re-renders.

## 2026-06-11 - [In-memory caching for site settings]
**Learning:** Returning a cached object by reference in JavaScript allows external callers to mutate the cache unintentionally.
**Action:** Always use defensive copying (e.g., `{ ...this._cache }`) when returning objects from a cache to maintain data integrity.
