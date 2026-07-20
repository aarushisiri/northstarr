import { useCallback, useEffect, useRef, useState } from "react";
import { createDefaultState } from "./defaultState";
import { STORAGE_KEY } from "../utils/constants";

/**
 * useNorthstarStore
 * -----------------
 * The single place that reads and writes persisted app state.
 *
 * V1 persists to localStorage. To move to Supabase (or any other backend)
 * later, this is the only file that needs to change: swap `readState` /
 * `writeState` for network calls (optimistic-update the local `state` the
 * same way, then sync in the background). Every page consumes this hook
 * and doesn't know or care where the data actually lives.
 */

function readState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Northstar: failed to read saved state", err);
    return null;
  }
}

function writeState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Northstar: failed to save state", err);
  }
}

export function useNorthstarStore() {
  const [state, setState] = useState(createDefaultState);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  // Load once on mount.
  useEffect(() => {
    const saved = readState();
    if (saved) {
      setState({ ...createDefaultState(), ...saved });
    }
    setLoaded(true);
  }, []);

  // Debounce writes so rapid interactions (typing, quick toggles) don't
  // thrash localStorage.
  const persist = useCallback((next) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => writeState(next), 300);
  }, []);

  const update = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { state, update, loaded };
}
