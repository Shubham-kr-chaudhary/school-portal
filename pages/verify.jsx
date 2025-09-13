import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Verify() {
  const router = useRouter();
  const { email: emailQuery } = router.query;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (emailQuery) setEmail(String(emailQuery));
  }, [emailQuery]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      if (res.data && res.data.success) {
        
        router.push("/addSchool");
      } else {
        setErrorMsg("Invalid or expired code.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sp-page-container">
      <div className="sp-card-wrapper">
        <h1 className="sp-page-heading" style={{ marginBottom: 12 }}>
          Enter verification code
        </h1>

        {errorMsg && (
          <div className="sp-banner" role="alert" aria-live="assertive" style={{ marginBottom: 12 }}>
            <div>{errorMsg}</div>
            <div className="sp-banner-actions">
              <button onClick={() => setErrorMsg("")} className="sp-btn sp-btn-ghost">
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

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            required
            className="sp-input"
            maxLength={6}
            inputMode="numeric"
          />

          <div className="sp-actions" style={{ marginTop: 6 }}>
            <button type="submit" disabled={busy} className="sp-btn sp-btn-primary full">
              {busy ? "Verifying..." : "Verify"}
            </button>

            <button type="button" onClick={() => router.push("/login")} className="sp-btn sp-btn-outline">
              Back
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, color: "#6b7280" }}>
            Didn't receive a code? Go back to <a className="sp-link" onClick={() => router.push("/login")} style={{ cursor: "pointer", color: "#2563eb" }}>Login</a> and resend.
          </div>
        </form>
      </div>
    </div>
  );
}
