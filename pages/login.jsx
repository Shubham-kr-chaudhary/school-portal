import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post("/api/auth/request-otp", { email });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Sign in with email (OTP)</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded">
            {busy ? "Sending..." : "Send code"}
          </button>
          <button type="button" onClick={() => router.push("/verify")} className="px-4 py-2 bg-gray-200 rounded">
            Enter code
          </button>
        </div>

        {sent && <div className="text-sm text-green-600">Code sent — check your email. Then enter it on the verify page.</div>}
      </form>
    </div>
  );
}
