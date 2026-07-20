import { useState } from "react";
import SystemCard from "../components/SystemCard";
import SystemModal from "../components/SystemModal";
import { useNow } from "../hooks/useNow";
import { classifyBlocks } from "../utils/time";
import { SYSTEMS } from "../utils/constants";
import { getSystemProgress } from "../utils/systems";

export default function Systems({ state }) {
  const [selected, setSelected] = useState(null);
  const now = useNow();
  const blocks = classifyBlocks(state.timeline, now);

  return (
    <div className="ns-page">
      <div className="ns-page-header">
        <div className="ns-page-title">Life Systems</div>
        <div className="ns-page-sub">
          Every task belongs to exactly one system. Select one for weekly, monthly, and yearly progress.
        </div>
      </div>

      <div className="ns-systems-grid">
        {SYSTEMS.map((name) => {
          const progress = getSystemProgress(state, name);
          const taskCount = blocks.filter((b) => b.system === name).length;
          return (
            <SystemCard
              key={name}
              name={name}
              progress={progress}
              taskCount={taskCount}
              onClick={() => setSelected(name)}
            />
          );
        })}
      </div>

      {selected && (
        <SystemModal
          name={selected}
          progress={getSystemProgress(state, selected)}
          tasks={blocks.filter((b) => b.system === selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
