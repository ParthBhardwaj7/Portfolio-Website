"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="font-display text-center text-2xl tracking-tight">Admin login</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-white/50" htmlFor="user">
              Username
            </label>
            <input
              id="user"
              className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-white/50" htmlFor="pass">
              Password
            </label>
            <input
              id="pass"
              type="password"
              className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-3 text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-xs text-white/40">
          <a href="/" className="hover:text-white/70">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}
