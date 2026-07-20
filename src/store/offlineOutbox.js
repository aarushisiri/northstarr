const OUTBOX_KEY = "northstar:outbox:v1";

/**
 * The outbox holds writes that failed to reach Supabase (no connection,
 * request error, etc). Each entry is replayed in order once connectivity
 * returns (see useNorthstarStore.js: flushOutbox), then removed. It is not
 * app data — just a queue of pending Supabase operations.
 *
 * "snapshot" entries are compressed: since only the latest full state
 * actually matters, a new snapshot replaces the previous queued one instead
 * of piling up. "plan" entries (import-history inserts) are appended as-is,
 * since each one is a distinct historical record worth keeping.
 */

export function readOutbox() {
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Northstar: failed to read offline outbox", err);
    return [];
  }
}

export function writeOutbox(queue) {
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Northstar: failed to persist offline outbox", err);
  }
}

export function enqueue(op) {
  const queue = readOutbox();
  const entry = { ...op, queuedAt: new Date().toISOString() };

  if (op.kind === "snapshot" && queue.length && queue[queue.length - 1].kind === "snapshot") {
    queue[queue.length - 1] = entry;
  } else {
    queue.push(entry);
  }

  writeOutbox(queue);
}
