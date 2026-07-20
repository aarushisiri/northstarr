import { useMemo } from "react";
import { Target, Flame, Check, Sparkles } from "lucide-react";
import ProgressRing from "../components/ProgressRing";
import { Pill, Checkbox } from "../components/Primitives";
import { useNow } from "../hooks/useNow";
import { useIsMobile } from "../hooks/useMediaQuery";
import { classifyBlocks, formatMinutes, greetingForHour } from "../utils/time";
import { STAT_DEFS } from "../utils/constants";

export default function Home({ state, update }) {
  const now = useNow();
  const isMobile = useIsMobile();
  const blocks = useMemo(() => classifyBlocks(state.timeline, now), [state.timeline, now]);

  const activeBlocks = blocks.filter((b) => b.status !== "moved");
  const totalCount = activeBlocks.length;
  const doneCount = activeBlocks.filter((b) => b.checked).length;
  const pct = totalCount ? (doneCount / totalCount) * 100 : 0;

  const current = blocks.find((b) => b.status === "current");
  const upcoming = blocks.filter((b) => b.status === "future").sort((a, b) => a.startMin - b.startMin);
  const next = upcoming[0];
  const timeRemaining = current ? Math.max(0, current.startMin + current.duration - now) : null;

  const toggleBlock = (id) => {
    update((prev) => ({
      ...prev,
      timeline: prev.timeline.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b)),
    }));
  };

  const toggleTop3 = (id) => {
    update((prev) => ({
      ...prev,
      top3: prev.top3.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  };

  // Mobile shows a reduced first screen: mission, current, next, win, done button.
  if (isMobile) {
    return (
      <div className="ns-page">
        {state.sideways && (
          <div className="ns-banner">
            <Sparkles size={15} strokeWidth={2} />
            <span>Mission adjusted.</span>
          </div>
        )}
        <div className="ns-greeting">{greetingForHour()}.</div>
        <div className="ns-mission-row">
          <Target size={18} strokeWidth={2} className="ns-mission-icon" />
          <span className="ns-mission-text">{state.mission}</span>
        </div>

        <div className="ns-card ns-now-card">
          <div className="ns-now-glow" />
          <div className="ns-now-label">Right now</div>
          {current ? (
            <>
              <div className="ns-now-task">{current.task}</div>
              <div className="ns-now-footer">
                <span className="ns-now-time">{timeRemaining} min left</span>
                <button className="ns-check-btn" onClick={() => toggleBlock(current.id)}>
                  <Check size={14} strokeWidth={2.5} /> Done
                </button>
              </div>
            </>
          ) : (
            <div className="ns-now-empty">Nothing scheduled right now.</div>
          )}
        </div>

        {next && (
          <div className="ns-card ns-next-card">
            <div className="ns-now-label">Next</div>
            <div className="ns-next-task">{next.task}</div>
            <div className="ns-next-meta">
              <span className="ns-next-time">{formatMinutes(next.startMin)}</span>
            </div>
          </div>
        )}

        <div className="ns-card ns-win-card">
          <div className="ns-win-label">Win condition</div>
          <div className="ns-win-text">{state.winCondition}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ns-page">
      {state.sideways && (
        <div className="ns-banner">
          <Sparkles size={15} strokeWidth={2} />
          <span>Mission adjusted. Only what matters today stayed on the list.</span>
        </div>
      )}

      <div className="ns-greeting-row">
        <div>
          <div className="ns-greeting">{greetingForHour()}.</div>
          <div className="ns-mission-row">
            <Target size={18} strokeWidth={2} className="ns-mission-icon" />
            <span className="ns-mission-text">{state.mission}</span>
          </div>
        </div>
        {state.streaks.win > 0 && (
          <div className="ns-streak">
            <Flame size={16} strokeWidth={2} />
            <span>{state.streaks.win} day win streak</span>
          </div>
        )}
      </div>

      <div className="ns-home-grid">
        <div className="ns-card ns-ring-card">
          <ProgressRing pct={pct} label="today" />
          <div className="ns-ring-caption">{doneCount} of {totalCount} blocks complete</div>
        </div>

        <div className="ns-card ns-now-card">
          <div className="ns-now-glow" />
          <div className="ns-now-label">Current time block</div>
          {current ? (
            <>
              <div className="ns-now-task">{current.task}</div>
              <div className="ns-now-meta">
                <Pill>{current.system}</Pill>
                {current.purpose && <span className="ns-now-purpose">{current.purpose}</span>}
              </div>
              <div className="ns-now-footer">
                <span className="ns-now-time">{timeRemaining} min remaining</span>
                <button className="ns-check-btn" onClick={() => toggleBlock(current.id)}>
                  <Check size={14} strokeWidth={2.5} /> Mark done
                </button>
              </div>
            </>
          ) : (
            <div className="ns-now-empty">No block scheduled right now. Free time — use it deliberately.</div>
          )}
        </div>

        <div className="ns-card ns-next-card">
          <div className="ns-now-label">Next up</div>
          {next ? (
            <>
              <div className="ns-next-task">{next.task}</div>
              <div className="ns-next-meta">
                <span className="ns-next-time">{formatMinutes(next.startMin)}</span>
                <Pill>{next.system}</Pill>
              </div>
            </>
          ) : (
            <div className="ns-now-empty">Nothing left on today's timeline.</div>
          )}
        </div>
      </div>

      <div className="ns-card ns-win-card">
        <div className="ns-win-label">Today's win condition</div>
        <div className="ns-win-text">{state.winCondition}</div>
      </div>

      <div className="ns-home-lower ns-home-secondary">
        <div className="ns-card ns-top3-card">
          <div className="ns-section-title">Today's Top 3</div>
          {state.top3.length === 0 && <div className="ns-empty-hint">No Top 3 imported yet.</div>}
          {state.top3.map((t) => (
            <button key={t.id} className="ns-top3-row" onClick={() => toggleTop3(t.id)}>
              <Checkbox checked={t.done} />
              <span className={t.done ? "ns-top3-text ns-top3-done" : "ns-top3-text"}>{t.text}</span>
            </button>
          ))}
        </div>

        <div className="ns-card ns-stats-card">
          <div className="ns-section-title">Quick Stats</div>
          <div className="ns-stats-grid">
            {STAT_DEFS.map((def) => {
              const Icon = def.icon;
              const val = state.stats[def.key];
              const done = def.kind === "bool" ? val === "done" : val && val.current >= val.goal;
              return (
                <div key={def.key} className={`ns-stat-chip ${done ? "ns-stat-chip-done" : ""}`}>
                  <Icon size={15} strokeWidth={2} />
                  <div className="ns-stat-info">
                    <div className="ns-stat-label">{def.label}</div>
                    <div className="ns-stat-value">
                      {def.kind === "bool" ? (done ? "Done" : "Pending") : `${val?.current ?? 0}/${val?.goal ?? 0}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
