import { Bar } from "./Primitives";
import { SYSTEM_SHORT } from "../utils/constants";

export default function SystemCard({ name, progress, taskCount, onClick }) {
  return (
    <button className="ns-system-card" onClick={onClick}>
      <div className="ns-system-card-top">
        <span className="ns-system-badge">{SYSTEM_SHORT[name]}</span>
        <span className="ns-system-pct">{Math.round(progress.today)}%</span>
      </div>
      <div className="ns-system-name">{name}</div>
      <Bar pct={progress.today} />
      <div className="ns-system-foot">
        {taskCount} task{taskCount !== 1 ? "s" : ""} today
      </div>
    </button>
  );
}
