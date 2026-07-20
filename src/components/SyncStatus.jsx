import { Cloud, CloudOff, RefreshCw } from "lucide-react";

const CONFIG = {
  synced: { icon: Cloud, label: "Synced", cls: "" },
  syncing: { icon: RefreshCw, label: "Syncing…", cls: "ns-sync-syncing" },
  offline: { icon: CloudOff, label: "Offline — will sync", cls: "ns-sync-offline" },
};

export default function SyncStatus({ status }) {
  const cfg = CONFIG[status] || CONFIG.synced;
  const Icon = cfg.icon;
  return (
    <div className={`ns-sync-status ${cfg.cls}`}>
      <Icon size={13} strokeWidth={2} />
      <span>{cfg.label}</span>
    </div>
  );
}
