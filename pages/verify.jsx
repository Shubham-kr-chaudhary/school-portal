import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      if (res.data && res.data.success) {
        router.push("/addSchool"); // logged in — go to add page
      } else {
        alert("Invalid code");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Enter your code</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit code"
          required
          className="w-full p-2 border rounded"
          maxLength={6}
          inputMode="numeric"
        />

        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded">
            {busy ? "Verifying..." : "Verify"}
          </button>
          <button type="button" onClick={() => router.push("/login")} className="px-4 py-2 bg-gray-200 rounded">
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
