// Pure time-formatting helpers. No React, no state — safe to unit test in isolation.

export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function timeToMinutes(t) {
  const match = String(t).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function formatMinutes(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = ((mins % 60) + 60) % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? "AM" : "PM";
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/**
 * Classifies each timeline block relative to the current time.
 * Status is one of: "done" | "moved" | "current" | "past" | "future"
 */
export function classifyBlocks(timeline, now) {
  return timeline.map((block) => {
    const end = block.startMin + block.duration;
    let status = "future";
    if (block.movedToTomorrow) status = "moved";
    else if (block.checked) status = "done";
    else if (now >= block.startMin && now < end) status = "current";
    else if (now >= end) status = "past";
    return { ...block, status };
  });
}

export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down";
}
