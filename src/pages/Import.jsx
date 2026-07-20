import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { parsePlan, EXAMPLE_PLAN } from "../parser/parsePlan";

export default function Import({ onImport }) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleImport = () => {
    if (!text.trim()) return;
    const { data, errors } = parsePlan(text);
    onImport(data);
    setErrors(errors);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  const loadExample = () => {
    setText(EXAMPLE_PLAN);
    setShowExample(false);
  };

  return (
    <div className="ns-page">
      <div className="ns-page-header">
        <div className="ns-page-title">Import Today's Plan</div>
        <div className="ns-page-sub">
          Paste the structured plan from your AI Chief of Staff. Northstar parses it and updates
          everything automatically.
        </div>
      </div>

      <div className="ns-import-grid">
        <div className="ns-card ns-import-card">
          <textarea
            className="ns-textarea ns-import-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your structured daily plan here..."
            rows={16}
          />
          <div className="ns-import-actions">
            <button className="ns-btn-secondary" onClick={() => setShowExample((s) => !s)}>
              {showExample ? "Hide format" : "See expected format"}
            </button>
            <button className="ns-btn-secondary" onClick={loadExample}>
              Load example
            </button>
            <button className="ns-btn-primary" onClick={handleImport}>
              Import plan
            </button>
          </div>

          {confirmed && (
            <div className="ns-import-confirm">
              <Check size={14} strokeWidth={2.5} /> Plan imported. Northstar is updated.
            </div>
          )}

          {errors && errors.length > 0 && (
            <div className="ns-import-warnings">
              <div className="ns-section-title" style={{ marginBottom: 6 }}>
                Notes from the parser
              </div>
              {errors.map((e, i) => (
                <div key={i} className="ns-import-warning">
                  {e}
                </div>
              ))}
            </div>
          )}
        </div>

        {showExample && (
          <div className="ns-card ns-import-format-card">
            <div className="ns-section-title">Expected format</div>
            <pre className="ns-format-pre">{EXAMPLE_PLAN}</pre>
          </div>
        )}
      </div>

      <div className="ns-card ns-future-card">
        <ArrowRight size={15} strokeWidth={2} />
        <span>
          Built for direct API sync later — the same parser will accept plans sent automatically
          from ChatGPT, no copy-paste required. Today's system percentages are always calculated
          from completed tasks, not from anything in the pasted plan — so the AI only has to
          generate the mission, timeline, and priorities.
        </span>
      </div>
    </div>
  );
}
