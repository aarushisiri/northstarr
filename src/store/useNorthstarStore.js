import { useCallback, useEffect, useRef, useState } from "react";
import { createDefaultState } from "./defaultState";
import { todayDateKey } from "../utils/time";
import { supabase } from "../lib/supabaseClient";
import * as api from "./api";
import { readCache, writeCache } from "./cache";
import { enqueue, readOutbox, writeOutbox } from "./offlineOutbox";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

/**
 * useNorthstarStore
 * -----------------
 * Supabase is the single source of truth. A small local cache + outbox
 * exist ONLY to make the app usable offline (see store/cache.js and
 * store/offlineOutbox.js for exactly what each one is, and isn't, for).
 *
 * Data model (see supabase/migrations/0001_init.sql):
 *   daily_logs       — mission, win condition, top3, timeline, stats, sideways (per user per day)
 *   journal_entries  — morning/evening journal (per user per day)
 *   system_progress  — weekly/monthly/yearly per life system (per user)
 *   streaks          — win/cyber/reading/fitness (one row per user)
 *   plans            — append-only history of every imported plan
 *
 * Today's per-system % is never stored — it's always derived client-side
 * from the timeline (see utils/systems.js).
 */

function rowsToSystems(rows) {
  const systems = {};
  (rows || []).forEach((r) => {
    systems[r.system_name] = { weekly: r.weekly, monthly: r.monthly, yearly: r.yearly };
  });
  return systems;
}

async function fetchFullState(userId, dateKey) {
  const [daily, journal, systemRows, streaks] = await Promise.all([
    api.fetchDailyLog(userId, dateKey),
    api.fetchJournalEntry(userId, dateKey),
    api.fetchSystemProgress(userId),
    api.fetchStreaks(userId),
  ]);

  const base = createDefaultState();

  return {
    ...base,
    mission: daily?.mission ?? base.mission,
    winCondition: daily?.win_condition ?? base.winCondition,
    top3: daily?.top3 ?? base.top3,
    timeline: daily?.timeline ?? base.timeline,
    stats: daily?.stats && Object.keys(daily.stats).length ? daily.stats : base.stats,
    sideways: daily?.sideways ?? false,
    journal: journal
      ? {
          gratitude: journal.gratitude ?? "",
          intentions: journal.intentions ?? "",
          wins: journal.wins ?? "",
          lessons: journal.lessons ?? "",
          challenges: journal.challenges ?? "",
          carryForward: journal.carry_forward ?? "",
        }
      : base.journal,
    systems:
      systemRows && systemRows.length ? { ...base.systems, ...rowsToSystems(systemRows) } : base.systems,
    streaks: streaks
      ? { win: streaks.win, cyber: streaks.cyber, reading: streaks.reading, fitness: streaks.fitness }
      : base.streaks,
    lastImportedAt: daily?.updated_at ?? null,
  };
}

async function pushFullState(userId, dateKey, state) {
  await Promise.all([
    api.upsertDailyLog(userId, dateKey, {
      mission: state.mission,
      win_condition: state.winCondition,
      top3: state.top3,
      timeline: state.timeline,
      stats: state.stats,
      sideways: state.sideways,
    }),
    api.upsertJournalEntry(userId, dateKey, {
      gratitude: state.journal.gratitude,
      intentions: state.journal.intentions,
      wins: state.journal.wins,
      lessons: state.journal.lessons,
      challenges: state.journal.challenges,
      carry_forward: state.journal.carryForward,
    }),
    api.upsertSystemProgress(userId, state.systems),
    api.upsertStreaks(userId, state.streaks),
  ]);
}

export function useNorthstarStore(userId) {
  const [state, setState] = useState(() => readCache() || createDefaultState());
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced"); // "synced" | "syncing" | "offline"
  const dateKeyRef = useRef(todayDateKey());
  const pushTimer = useRef(null);
  const online = useOnlineStatus();

  /* Initial load + realtime subscription --------------------------------- */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const dateKey = dateKeyRef.current;

    (async () => {
      try {
        const fresh = await fetchFullState(userId, dateKey);
        if (cancelled) return;
        setState(fresh);
        writeCache(fresh);
        setSyncStatus("synced");
      } catch (err) {
        console.error("Northstar: initial load failed, showing local cache", err);
        setSyncStatus("offline");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    // Realtime: another device's write shows up here within moments,
    // without polling and without the person doing anything.
    const channel = supabase
      .channel(`northstar-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_logs", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (!payload.new || payload.new.log_date !== dateKey) return;
          setState((prev) => ({
            ...prev,
            mission: payload.new.mission,
            winCondition: payload.new.win_condition,
            top3: payload.new.top3,
            timeline: payload.new.timeline,
            stats: payload.new.stats,
            sideways: payload.new.sideways,
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "journal_entries", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (!payload.new || payload.new.entry_date !== dateKey) return;
          setState((prev) => ({
            ...prev,
            journal: {
              gratitude: payload.new.gratitude,
              intentions: payload.new.intentions,
              wins: payload.new.wins,
              lessons: payload.new.lessons,
              challenges: payload.new.challenges,
              carryForward: payload.new.carry_forward,
            },
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_progress", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (!payload.new) return;
          setState((prev) => ({
            ...prev,
            systems: {
              ...prev.systems,
              [payload.new.system_name]: {
                weekly: payload.new.weekly,
                monthly: payload.new.monthly,
                yearly: payload.new.yearly,
              },
            },
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "streaks", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (!payload.new) return;
          setState((prev) => ({
            ...prev,
            streaks: {
              win: payload.new.win,
              cyber: payload.new.cyber,
              reading: payload.new.reading,
              fitness: payload.new.fitness,
            },
          }));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  /* Mirror every state change into the local cache ------------------------ */
  useEffect(() => {
    writeCache(state);
  }, [state]);

  /* Replay the offline outbox whenever we come back online ---------------- */
  const flushOutbox = useCallback(async () => {
    let queue = readOutbox();
    while (queue.length) {
      const op = queue[0];
      try {
        if (op.kind === "snapshot") {
          await pushFullState(op.payload.userId, op.payload.dateKey, op.payload.state);
        } else if (op.kind === "plan") {
          await api.insertPlanRecord(op.payload.userId, op.payload.rawText, op.payload.parsed, op.payload.notes);
        }
        queue = queue.slice(1);
        writeOutbox(queue);
        setSyncStatus("synced");
      } catch (err) {
        console.error("Northstar: still can't reach Supabase, will retry", err);
        setSyncStatus("offline");
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (online && userId) flushOutbox();
  }, [online, userId, flushOutbox]);

  // Belt-and-braces retry: some browsers don't fire the "online" event
  // reliably. Check every 20s while something is still queued.
  useEffect(() => {
    const id = setInterval(() => {
      if (navigator.onLine && readOutbox().length) flushOutbox();
    }, 20000);
    return () => clearInterval(id);
  }, [flushOutbox]);

  /* Debounced push to Supabase, falling back to the outbox on failure ----- */
  const scheduleSync = useCallback(
    (nextState) => {
      if (!userId) return;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(async () => {
        setSyncStatus("syncing");
        try {
          await pushFullState(userId, dateKeyRef.current, nextState);
          setSyncStatus("synced");
        } catch (err) {
          console.error("Northstar: sync failed, queued for retry when back online", err);
          enqueue({
            kind: "snapshot",
            payload: { userId, dateKey: dateKeyRef.current, state: nextState },
          });
          setSyncStatus("offline");
        }
      }, 500);
    },
    [userId]
  );

  const update = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        scheduleSync(next);
        return next;
      });
    },
    [scheduleSync]
  );

  // Importing a plan both replaces the current day's state and appends a
  // permanent row to the plans history table.
  const importPlan = useCallback(
    (rawText, data, errors) => {
      setState((prev) => {
        const next = { ...prev, ...data, sideways: false };
        scheduleSync(next);
        return next;
      });

      if (!userId) return;
      api.insertPlanRecord(userId, rawText, data, errors).catch((err) => {
        console.error("Northstar: couldn't record plan history, queued for retry", err);
        enqueue({ kind: "plan", payload: { userId, rawText, parsed: data, notes: errors } });
      });
    },
    [userId, scheduleSync]
  );

  // Safe: clears only the local cache/outbox and refetches from Supabase.
  // Useful if the local mirror ever looks stale — Supabase data is untouched.
  const refreshFromServer = useCallback(async () => {
    writeOutbox([]);
    if (!userId) return;
    try {
      const fresh = await fetchFullState(userId, dateKeyRef.current);
      setState(fresh);
      writeCache(fresh);
      setSyncStatus("synced");
    } catch (err) {
      console.error("Northstar: couldn't refresh from Supabase", err);
      setSyncStatus("offline");
    }
  }, [userId]);

  // Destructive: actually deletes this user's rows from every table.
  const deleteAllData = useCallback(async () => {
    if (!userId) return;
    await api.deleteAllUserData(userId);
    writeOutbox([]);
    const fresh = createDefaultState();
    setState(fresh);
    writeCache(fresh);
  }, [userId]);

  return { state, update, importPlan, refreshFromServer, deleteAllData, loaded, syncStatus };
}
