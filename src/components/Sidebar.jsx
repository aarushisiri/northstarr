import { CircleDot, AlertTriangle, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./navItems";
import SyncStatus from "./SyncStatus";
import { useAuth } from "../auth/AuthProvider";

export default function Sidebar({ active, setActive, onSideways, sideways, syncStatus }) {
  const { user, signOut } = useAuth();

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
        <SyncStatus status={syncStatus} />

        <button
          className={`ns-sideways-btn ${sideways ? "ns-sideways-btn-active" : ""}`}
          onClick={onSideways}
        >
          <AlertTriangle size={15} strokeWidth={2} />
          <span>{sideways ? "Restore Full Day" : "Day Went Sideways"}</span>
        </button>

        <div className="ns-account-row">
          <span className="ns-account-email">{user?.email}</span>
          <button className="ns-account-signout" onClick={signOut} title="Sign out">
            <LogOut size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
}
