"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.user.role !== "ADMIN") {
          setError("Access denied: Administrative privileges required.");
          return;
        }
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/admin");
      } else {
        setError(data.message || "Authentication failed. Please try again.");
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 via-[#F8FAFC] to-rose-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* Header Band */}
          <div className="bg-[#E11D48] px-8 py-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              PBBET
            </h1>
            <span className="inline-block mt-1 bg-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Admin Portal
            </span>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <p className="text-sm text-slate-500 font-medium mb-6 text-center">
              Sign in with your administrator credentials.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/25 focus:border-[#E11D48] transition-all placeholder:text-slate-300"
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/25 focus:border-[#E11D48] transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-4 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                aria-label="Sign in to admin panel"
                className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm shadow-sm shadow-rose-200 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Sign In to Admin
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          PBBET Administration System &mdash; Authorized Access Only
        </p>
      </div>
    </div>
  );
}
