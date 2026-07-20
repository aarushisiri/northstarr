import { Sun, Moon } from "lucide-react";

const FIELDS = [
  { key: "gratitude", label: "Gratitude", group: "morning" },
  { key: "intentions", label: "Intentions", group: "morning" },
  { key: "wins", label: "Wins", group: "evening" },
  { key: "lessons", label: "Lessons", group: "evening" },
  { key: "challenges", label: "Challenges", group: "evening" },
  { key: "carryForward", label: "Carry Forward", group: "evening" },
];

export default function Journal({ state, update }) {
  const setField = (field, value) => {
    update((prev) => ({ ...prev, journal: { ...prev.journal, [field]: value } }));
  };

  return (
    <div className="ns-page">
      <div className="ns-page-header">
        <div className="ns-page-title">Journal</div>
        <div className="ns-page-sub">A quiet place to open and close the day. Saved automatically.</div>
      </div>

      <div className="ns-journal-cols">
        <div className="ns-card ns-journal-col">
          <div className="ns-section-title">
            <Sun size={14} strokeWidth={2} /> Morning
          </div>
          {FIELDS.filter((f) => f.group === "morning").map((f) => (
            <div key={f.key} className="ns-journal-field">
              <label className="ns-journal-label">{f.label}</label>
              <textarea
                className="ns-textarea"
                value={state.journal[f.key] || ""}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={`Write your ${f.label.toLowerCase()}...`}
                rows={3}
              />
            </div>
          ))}
        </div>

        <div className="ns-card ns-journal-col">
          <div className="ns-section-title">
            <Moon size={14} strokeWidth={2} /> Evening
          </div>
          {FIELDS.filter((f) => f.group === "evening").map((f) => (
            <div key={f.key} className="ns-journal-field">
              <label className="ns-journal-label">{f.label}</label>
              <textarea
                className="ns-textarea"
                value={state.journal[f.key] || ""}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={`Write your ${f.label.toLowerCase()}...`}
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
