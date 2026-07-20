import { CircleDot, AlertTriangle } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

export default function Sidebar({ active, setActive, onSideways, sideways }) {
  return (
    <aside className="ns-sidebar">
      <div className="ns-brand">
        <div className="ns-brand-mark">
          <CircleDot size={18} strokeWidth={2.2} />
        </div>
        <div className="ns-brand-text">
          <div className="ns-brand-name">Northstar</div>
          <div className="ns-brand-sub">Execution, not planning</div>
        </div>
      </div>

      <nav className="ns-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`ns-nav-item ${isActive ? "ns-nav-item-active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="ns-sidebar-footer">
        <button
          className={`ns-sideways-btn ${sideways ? "ns-sideways-btn-active" : ""}`}
          onClick={onSideways}
        >
          <AlertTriangle size={15} strokeWidth={2} />
          <span>{sideways ? "Restore Full Day" : "Day Went Sideways"}</span>
        </button>
      </div>
    </aside>
  );
}
