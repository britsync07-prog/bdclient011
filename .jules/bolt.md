## 2026-06-11 - [In-memory caching for site settings]
**Learning:** Returning a cached object by reference in JavaScript allows external callers to mutate the cache unintentionally.
**Action:** Always use defensive copying (e.g., `{ ...this._cache }`) when returning objects from a cache to maintain data integrity.
