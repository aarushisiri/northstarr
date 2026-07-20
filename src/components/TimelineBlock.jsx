import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Pill, Checkbox } from "./Primitives";
import { priorityColor } from "../utils/systems";

export default function TimelineBlock({ block, onToggle }) {
  const [open, setOpen] = useState(false);
  const isPast = block.status === "past" || block.status === "done";
  const isCurrent = block.status === "current";
  const collapsedPast = isPast && !open;

  return (
    <div
      className={[
        "ns-tblock",
        isCurrent ? "ns-tblock-current" : "",
        block.status === "moved" ? "ns-tblock-moved" : "",
        collapsedPast ? "ns-tblock-collapsed" : "",
      ].join(" ")}
    >
      <div className="ns-tblock-time-col">
        <div className="ns-tblock-time">{block.time}</div>
        <div className="ns-tblock-dur">{block.duration}m</div>
      </div>

      <div className="ns-tblock-spine">
        <span className="ns-tblock-dot" style={{ background: priorityColor(block.priority) }} />
        {isCurrent && <span className="ns-tblock-pulse" />}
      </div>

      <button className="ns-tblock-body" onClick={() => setOpen((o) => !o)}>
        <div className="ns-tblock-head">
          <Checkbox
            checked={block.checked}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(block.id);
            }}
          />
          <span className={`ns-tblock-task ${block.checked ? "ns-tblock-task-done" : ""}`}>
            {block.task}
          </span>
          <Pill tone={block.priority}>{block.system}</Pill>
          {block.status === "moved" && <Pill tone="muted">Moved to tomorrow</Pill>}
          <ChevronDown size={14} className={`ns-chevron ${open ? "ns-chevron-open" : ""}`} />
        </div>

        {!collapsedPast && (
          <div className="ns-tblock-detail">
            {block.purpose && <div className="ns-tblock-purpose">{block.purpose}</div>}
            <div className="ns-tblock-tags">
              {block.skippable && <span className="ns-tag">Can be skipped</span>}
              {block.dependencies && <span className="ns-tag">Depends on: {block.dependencies}</span>}
            </div>
            {block.notes && <div className="ns-tblock-notes">{block.notes}</div>}
          </div>
        )}
      </button>
    </div>
  );
}
