import { useState } from "react";
import { Check, ArrowRight, RefreshCw, Trash2 } from "lucide-react";
import { parsePlan, EXAMPLE_PLAN } from "../parser/parsePlan";

export default function Import({ onImport, onRefresh, onDeleteAll }) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleImport = () => {
    if (!text.trim()) return;
    const { data, errors } = parsePlan(text);
    onImport(text, data, errors);
    setErrors(errors);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  const loadExample = () => {
    setText(EXAMPLE_PLAN);
    setShowExample(false);
  };

  const handleDeleteClick = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 4000);
      return;
    }
    onDeleteAll();
    setConfirmingDelete(false);
    setText("");
    setErrors(null);
  };

  return (
    <div className="ns-page">
      <div className="ns-page-header">
        <div className="ns-page-title">Import Today's Plan</div>
        <div className="ns-page-sub">
          Paste the structured plan from your AI Chief of Staff. Northstar parses it, saves it to
          your account, and syncs it to every device you're signed into.
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
              <Check size={14} strokeWidth={2.5} /> Plan imported and syncing.
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
          from completed tasks, not from anything in the pasted plan.
        </span>
      </div>

      <div className="ns-card ns-account-actions">
        <div className="ns-account-action-row">
          <div>
            <div className="ns-section-title" style={{ marginBottom: 4 }}>Refresh from server</div>
            <div className="ns-empty-hint">
              Re-fetches everything from Supabase — useful if a device looks out of sync.
            </div>
          </div>
          <button className="ns-btn-secondary ns-reset-btn" onClick={onRefresh}>
            <RefreshCw size={14} strokeWidth={2} />
            Refresh
          </button>
        </div>

        <div className="ns-account-action-row ns-account-action-danger">
          <div>
            <div className="ns-section-title" style={{ marginBottom: 4 }}>Delete all my data</div>
            <div className="ns-empty-hint">
              Permanently deletes everything in your Northstar account — plans, journal, systems,
              streaks. This cannot be undone.
            </div>
          </div>
          <button
            className={`ns-btn-secondary ns-reset-btn ${confirmingDelete ? "ns-reset-btn-confirm" : ""}`}
            onClick={handleDeleteClick}
          >
            <Trash2 size={14} strokeWidth={2} />
            {confirmingDelete ? "Click again to confirm" : "Delete all data"}
          </button>
        </div>
      </div>
    </div>
  );
}
