import { useState } from "react";
import { Flame, Shield, BookMarked, Dumbbell } from "lucide-react";
import { Bar } from "../components/Primitives";
import { useNow } from "../hooks/useNow";
import { classifyBlocks } from "../utils/time";
import { SYSTEMS } from "../utils/constants";
import { sortSystemsByField, computeTodayPct } from "../utils/systems";

const TABS = [
  { id: "today", label: "Today", field: "today" },
  { id: "weekly", label: "Weekly Review", field: "weekly" },
  { id: "monthly", label: "Monthly Review", field: "monthly" },
];

const STREAK_DEFS = [
  { key: "win", label: "Win Streak", icon: Flame, emphasize: true },
  { key: "cyber", label: "Cyber Streak", icon: Shield },
  { key: "reading", label: "Reading Streak", icon: BookMarked },
  { key: "fitness", label: "Fitness Streak", icon: Dumbbell },
];

export default function Review({ state }) {
  const [tab, setTab] = useState("today");
  const now = useNow();
  const blocks = classifyBlocks(state.timeline, now);
  const active = blocks.filter((b) => b.status !== "moved");
  const completionPct = active.length
    ? (active.filter((b) => b.checked).length / active.length) * 100
    : 0;

  const field = TABS.find((t) => t.id === tab).field;
  const sorted = sortSystemsByField(state, SYSTEMS, field);

  return (
    <div className="ns-page">
      <div className="ns-page-header">
        <div className="ns-page-title">Review</div>
        <div className="ns-page-sub">Where your effort actually went, system by system.</div>
      </div>

      <div className="ns-review-top">
        <div className="ns-card ns-review-summary">
          <div className="ns-ring-pct">{Math.round(completionPct)}%</div>
          <div className="ns-empty-hint">of today's timeline completed</div>
        </div>
        <div className="ns-card ns-review-summary">
          <div className="ns-ring-pct">
            {state.top3.filter((t) => t.done).length}/{state.top3.length}
          </div>
          <div className="ns-empty-hint">Top 3 completed</div>
        </div>
        <div className="ns-card ns-review-summary">
          <div className="ns-ring-pct">{state.streaks.win}</div>
          <div className="ns-empty-hint">day win streak</div>
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-section-title">Streaks</div>
        <div className="ns-stats-grid">
          {STREAK_DEFS.map((def) => {
            const Icon = def.icon;
            const value = state.streaks[def.key];
            return (
              <div
                key={def.key}
                className={`ns-stat-chip ${def.emphasize ? "ns-stat-chip-done" : ""}`}
              >
                <Icon size={15} strokeWidth={2} />
                <div className="ns-stat-info">
                  <div className="ns-stat-label">{def.label}</div>
                  <div className="ns-stat-value">{value} day{value === 1 ? "" : "s"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-review-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`ns-review-tab ${tab === t.id ? "ns-review-tab-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ns-section-title" style={{ marginTop: 16 }}>
          System progress
          {tab === "today" && (
            <span className="ns-empty-hint" style={{ marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
              — calculated automatically from completed tasks
            </span>
          )}
        </div>
        <div className="ns-review-bars">
          {sorted.map((name) => (
            <ReviewBarRow key={name} state={state} name={name} field={field} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewBarRow({ state, name, field }) {
  const pct =
    field === "today" ? computeTodayPct(state.timeline, name) : state.systems[name]?.[field] ?? 0;

  return (
    <div className="ns-review-bar-row">
      <div className="ns-review-bar-label">{name}</div>
      <Bar pct={pct} />
      <div className="ns-review-bar-pct">{Math.round(pct)}%</div>
    </div>
  );
}
