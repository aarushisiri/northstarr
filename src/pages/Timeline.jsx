import { useMemo } from "react";
import { Info } from "lucide-react";
import TimelineBlock from "../components/TimelineBlock";
import { useNow } from "../hooks/useNow";
import { classifyBlocks } from "../utils/time";

export default function Timeline({ state, update }) {
  const now = useNow();
  const blocks = useMemo(() => classifyBlocks(state.timeline, now), [state.timeline, now]);

  const toggleBlock = (id) => {
    update((prev) => ({
      ...prev,
      timeline: prev.timeline.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b)),
    }));
  };

  return (
    <div className="ns-page">
      <div className="ns-page-header">
        <div className="ns-page-title">Timeline</div>
        <div className="ns-page-sub">
          Hour by hour. The current block glows; past blocks collapse automatically.
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="ns-card ns-empty-card">
          <Info size={16} strokeWidth={2} />
          <span>No timeline yet. Import today's plan to populate this view.</span>
        </div>
      ) : (
        <div className="ns-timeline-list">
          {blocks.map((block) => (
            <TimelineBlock key={block.id} block={block} onToggle={toggleBlock} />
          ))}
        </div>
      )}
    </div>
  );
}
