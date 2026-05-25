"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const resetRedirectTo =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}/reset-password`;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/admin");
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: resetRedirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset email sent. Open the link in your inbox to choose a new password.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="section-kicker">Admin access</p>
        <h1 className="mb-3 text-3xl font-black">
          {mode === "login" ? "Sign in to Wild Spine" : "Reset your password"}
        </h1>
        <p className="mb-8 text-gray-400">
          {mode === "login"
            ? "Use your approved admin email and password."
            : "Enter your admin email and we will send a secure reset link."}
        </p>

        <form onSubmit={mode === "login" ? handleLogin : handleReset} className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-gray-300">
            Email address
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {mode === "login" && (
            <label className="grid gap-2 text-sm font-bold text-gray-300">
              Password
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          )}

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
            disabled={loading}
            className="rounded-full bg-yellow-500 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Send Reset Email"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "reset" : "login");
            setError("");
            setMessage("");
          }}
          className="mt-6 w-full text-center text-sm font-bold text-yellow-500 hover:text-yellow-400"
        >
          {mode === "login" ? "Forgot password?" : "Back to sign in"}
        </button>
      </div>
    </main>
  );
}
