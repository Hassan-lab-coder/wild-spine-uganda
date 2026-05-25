"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!active) {
          return;
        }

        if (exchangeError) {
          setError(exchangeError.message);
          setReady(false);
          setLoading(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setReady(Boolean(data.session));
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setLoading(false);
      }
    });

    checkSession();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. Redirecting to admin...");
    window.setTimeout(() => router.push("/admin"), 1200);
  }

  return (
    <main className="bg-black text-white min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black mb-3">Reset Password</h1>
        <p className="text-gray-400 mb-8">
          Choose a new password for your Wild Spine admin account.
        </p>

        {loading ? (
          <p className="text-gray-400">Checking reset link...</p>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="password"
              className="form-input"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="bg-yellow-500 text-black py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="grid gap-5">
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              This reset link is missing or expired. Request a fresh password reset email.
            </p>
            <a
              href="/login#auth-forgot-password"
              className="text-center bg-yellow-500 text-black py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              Request New Link
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
