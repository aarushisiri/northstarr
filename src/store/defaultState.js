import { SYSTEMS, STAT_DEFS } from "../utils/constants";

export function createDefaultState() {
  return {
    mission: "Set today's mission",
    winCondition: "Paste your daily plan to set today's win condition.",
    top3: [],
    timeline: [],
    // "today" is intentionally not stored here — it's calculated live from
    // completed timeline tasks (see utils/systems.js: getSystemProgress).
    // weekly/monthly/yearly still come from the imported plan until Northstar
    // keeps its own multi-day history.
    systems: SYSTEMS.reduce((acc, name) => {
      acc[name] = { weekly: 0, monthly: 0, yearly: 0 };
      return acc;
    }, {}),
    stats: STAT_DEFS.reduce((acc, def) => {
      acc[def.key] =
        def.kind === "bool"
          ? "pending"
          : { current: 0, goal: def.key === "steps" ? 8000 : 8 };
      return acc;
    }, {}),
    // Four dedicated streaks rather than one generic counter — each tells
    // you something specific and none of them get diluted by the others.
    streaks: {
      win: 0,
      cyber: 0,
      reading: 0,
      fitness: 0,
    },
    journal: {
      gratitude: "",
      intentions: "",
      wins: "",
      lessons: "",
      challenges: "",
      carryForward: "",
    },
    sideways: false,
    lastImportedAt: null,
  };
}
