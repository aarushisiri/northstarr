import { Check } from "lucide-react";

export function Bar({ pct, tone = "accent" }) {
  return (
    <div className="ns-bar-track">
      <div
        className={`ns-bar-fill ns-bar-${tone}`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

export function Pill({ children, tone }) {
  return <span className={`ns-pill ${tone ? `ns-pill-${tone}` : ""}`}>{children}</span>;
}

export function Checkbox({ checked, onClick, size = 12 }) {
  return (
    <span
      className={`ns-checkbox ${checked ? "ns-checkbox-checked" : ""}`}
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && <Check size={size} strokeWidth={3} />}
    </span>
  );
}
