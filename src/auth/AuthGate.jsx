import { useState } from "react";
import { Mail, CircleDot } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function AuthGate({ children }) {
  const { user, loading, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  if (loading) {
    return (
      <div className="ns-root ns-loading">
        <div className="ns-loading-text">Loading Northstar…</div>
      </div>
    );
  }

  if (user) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await signInWithMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Couldn't send the link. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ns-auth-screen">
      <div className="ns-auth-card">
        <div className="ns-brand-mark ns-auth-mark">
          <CircleDot size={20} strokeWidth={2.2} />
        </div>
        <div className="ns-auth-title">Northstar</div>
        <div className="ns-auth-sub">Sign in to sync your plan across every device.</div>

        {sent ? (
          <div className="ns-auth-sent">
            <Mail size={16} strokeWidth={2} />
            <span>
              Check <strong>{email}</strong> for a sign-in link.
            </span>
          </div>
        ) : (
          <form className="ns-auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ns-auth-input"
            />
            <button type="submit" className="ns-btn-primary ns-auth-submit" disabled={sending}>
              {sending ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        {error && <div className="ns-auth-error">{error}</div>}
      </div>
    </div>
  );
}
