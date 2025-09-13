import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return alert("Please enter your email");
    setBusy(true);
    try {
      await axios.post("/api/auth/request-otp", { email });
      setSent(true);
      setCountdown(30); 
    } catch (err) {
      console.error(err);
      alert("Failed to send code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sp-page-container">
      <div className="sp-card-wrapper">
        <h1 className="sp-page-heading" style={{ marginBottom: 12 }}>Sign in with email (OTP)</h1>

        
        {sent && (
          <div className="sp-banner" role="status" aria-live="polite">
            <div>
              Code sent — check your email. {countdown > 0 ? `(you can resend in ${countdown}s)` : ""}
            </div>
            <div className="sp-banner-actions">
              <button
                onClick={() => router.push({ pathname: "/verify", query: { email } })}
                className="sp-btn sp-btn-primary"
              >
                Enter code
              </button>
              <button
                onClick={() => { setSent(false); }}
                className="sp-btn sp-btn-ghost"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sp-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="sp-input"
          />

          <div className="sp-actions" style={{ marginTop: 6 }}>
            <button
              type="submit"
              disabled={busy || (countdown > 0 && sent)}
              className="sp-btn sp-btn-primary full"
            >
              {busy ? "Sending..." : sent ? (countdown > 0 ? `Resend (${countdown}s)` : "Resend code") : "Send code"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="sp-btn sp-btn-outline"
            >
              Home
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={() => router.push({ pathname: "/verify", query: { email } })}
              className="sp-btn sp-btn-outline"
            >
              I already have a code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
