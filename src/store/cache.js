const CACHE_KEY = "northstar:cache:v1";

/**
 * This is a mirror of the last state Supabase confirmed — nothing more.
 * It exists purely so the app has something to render instantly on load,
 * and something to show while fully offline. Supabase is always the real
 * source of truth once it's reachable; user actions never write here
 * directly (see store/useNorthstarStore.js).
 */
export function readCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Northstar: failed to read offline cache", err);
    return null;
  }
}

export function writeCache(state) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Northstar: failed to write offline cache", err);
  }
}

export function clearCache() {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.error("Northstar: failed to clear offline cache", err);
  }
}
