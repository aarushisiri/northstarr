import { X } from "lucide-react";
import { Bar, Checkbox } from "./Primitives";

const ROWS = [
  { key: "today", label: "Today" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export default function SystemModal({ name, progress, tasks, onClose }) {
  return (
    <div className="ns-modal-backdrop" onClick={onClose}>
      <div className="ns-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ns-modal-close" onClick={onClose}>
          <X size={16} />
        </button>
        <div className="ns-modal-title">{name}</div>

        {ROWS.map((row) => (
          <div key={row.key} className="ns-modal-row">
            <div className="ns-modal-row-label">{row.label}</div>
            <Bar pct={progress[row.key] ?? 0} />
            <div className="ns-modal-row-pct">{Math.round(progress[row.key] ?? 0)}%</div>
          </div>
        ))}

        <div className="ns-modal-subtitle">Today's tasks</div>
        <div className="ns-modal-tasks">
          {tasks.length === 0 && <div className="ns-empty-hint">No tasks in this system today.</div>}
          {tasks.map((task) => (
            <div key={task.id} className="ns-modal-task-row">
              <Checkbox checked={task.checked} size={11} />
              <span className={task.checked ? "ns-top3-done" : ""}>{task.task}</span>
              <span className="ns-modal-task-time">{task.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
