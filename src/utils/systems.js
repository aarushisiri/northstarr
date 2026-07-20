export function priorityColor(priority) {
  if (priority === "high") return "var(--accent)";
  if (priority === "low") return "var(--muted)";
  return "var(--accent-2)";
}

/**
 * Today's progress for a system is calculated automatically from the
 * timeline — no manual estimate needed. A task counts once it's checked;
 * tasks moved to tomorrow (Day Went Sideways) don't count against today.
 */
export function computeTodayPct(timeline, systemName) {
  const tasks = timeline.filter(
    (t) => t.system === systemName && !t.movedToTomorrow
  );
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.checked).length;
  return (done / tasks.length) * 100;
}

/**
 * Combines the computed "today" figure with the weekly/monthly/yearly
 * figures that still come from the imported plan (until Northstar keeps its
 * own multi-day history and can compute those automatically too).
 */
export function getSystemProgress(state, systemName) {
  const stored = state.systems[systemName] || {};
  return {
    today: computeTodayPct(state.timeline, systemName),
    weekly: stored.weekly ?? 0,
    monthly: stored.monthly ?? 0,
    yearly: stored.yearly ?? 0,
  };
}

/**
 * Sorts systems by a given progress field. "today" is computed live;
 * weekly/monthly/yearly are read from stored (imported) values.
 */
export function sortSystemsByField(state, systemNames, field = "today") {
  const valueFor = (name) =>
    field === "today"
      ? computeTodayPct(state.timeline, name)
      : state.systems[name]?.[field] ?? 0;

  return [...systemNames].sort((a, b) => valueFor(b) - valueFor(a));
}
