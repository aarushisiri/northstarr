import { Home, Clock, BookOpen, Upload } from "lucide-react";

// Mobile deliberately surfaces only the four screens meant for one-handed,
// swipe-friendly use. Systems and Review remain reachable from Home.
const MOBILE_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "import", label: "Import", icon: Upload },
];

export default function MobileNav({ active, setActive }) {
  return (
    <nav className="ns-mobile-nav">
      <div className="ns-mobile-nav-row">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`ns-mobile-nav-item ${isActive ? "ns-mobile-nav-item-active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
