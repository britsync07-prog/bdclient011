"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Trophy,
  Dices,
  Spade,
  Zap,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { logClientAction } from "@/lib/logger";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

function FloatingBlob({
  className,
  delay = "0s",
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute rounded-full opacity-10 blur-3xl animate-pulse ${className}`}
      style={{ animationDelay: delay, animationDuration: "4s" }}
    />
  );
}

function GameBadge({
  icon: Icon,
  label,
  delay,
  color,
}: {
  icon: React.ElementType;
  label: string;
  delay: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl px-4 py-3 shadow-lg"
      style={{
        animation: `floatBadge 3s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-slate-800 font-semibold text-sm">{label}</span>
    </div>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    logClientAction("Click Login Submit", { username });
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        logClientAction("Login Success", { username });
        router.push("/");
      } else {
        let errMsg = data.message || "Login failed";
        if (!data.message && data.errors && Array.isArray(data.errors)) {
          errMsg = data.errors.map((e: any) => e.message).join(". ");
        }
        logClientAction("Login Fail", { username, error: errMsg });
        setError(errMsg);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Login Error", { username, error: errMsg });
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-left  { animation: slideInLeft  0.7s ease both; }
        .animate-slide-right { animation: slideInRight 0.7s ease both; }
        .animate-fade-up     { animation: fadeInUp     0.5s ease both; }
        .glow-blue { box-shadow: 0 0 30px rgba(59,130,246,0.45), 0 4px 16px rgba(59,130,246,0.25); }
        .glow-blue:hover { box-shadow: 0 0 42px rgba(59,130,246,0.6), 0 6px 24px rgba(59,130,246,0.35); }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
      `}</style>

      <div
        className="min-h-screen flex"
        style={{
          background:
            "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        }}
      >
        {/* LEFT BRANDING PANEL */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center border-r border-slate-200">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(145deg, #eff6ff 0%, #f8fafc 40%, #f1f5f9 70%, #e2e8f0 100%)",
            }}
          />

          <FloatingBlob
            className="w-96 h-96 bg-blue-400 top-[-80px] left-[-80px]"
            delay="0s"
          />
          <FloatingBlob
            className="w-72 h-72 bg-cyan-400 bottom-[-60px] right-[-60px]"
            delay="1.5s"
          />
          <FloatingBlob
            className="w-48 h-48 bg-amber-400 top-1/2 left-1/3"
            delay="0.8s"
          />

          <div className="absolute w-[500px] h-[500px] rounded-full border border-slate-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-[380px] h-[380px] rounded-full border border-slate-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div
            className={`relative z-10 text-center px-12 ${mounted ? "animate-slide-left" : "opacity-0"}`}
          >
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100/40 backdrop-blur rounded-3xl border border-blue-500/30 mb-6 shadow-2xl">
                <span className="text-blue-600 font-black text-3xl italic tracking-tight">
                  PB
                </span>
              </div>
              <h1 className="text-6xl font-black text-slate-800 italic tracking-tight drop-shadow-lg">
                PBBET
              </h1>
              <p className="text-blue-600 font-medium text-lg mt-2 tracking-wide">
                Next-Gen iGaming Platform
              </p>
            </div>

            <div className="flex items-center gap-4 mb-10 px-8">
              <div className="flex-1 h-px bg-slate-200" />
              <Zap size={16} className="text-blue-500/50" />
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="flex flex-col gap-4 items-center">
              <GameBadge
                icon={Trophy}
                label="Live Tournaments"
                delay="0s"
                color="bg-blue-600"
              />
              <GameBadge
                icon={Dices}
                label="500+ Casino Games"
                delay="0.4s"
                color="bg-amber-500"
              />
              <GameBadge
                icon={Spade}
                label="Premium Card Tables"
                delay="0.8s"
                color="bg-cyan-600"
              />
              <GameBadge
                icon={ShieldCheck}
                label="Secure & Licensed"
                delay="1.2s"
                color="bg-emerald-600"
              />
            </div>

            <p className="text-slate-600 text-xs mt-10 tracking-widest uppercase">
              Trusted by 1M+ players worldwide
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
          <div
            className={`w-full max-w-md ${mounted ? "animate-slide-right" : "opacity-0"}`}
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 lg:p-10 text-slate-800">
              {/* Mobile logo */}
              <div className="flex lg:hidden flex-col items-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl border border-blue-200 mb-3">
                  <span className="text-[#3b82f6] font-black text-xl italic">
                    PB
                  </span>
                </div>
                <span className="text-[#3b82f6] font-black text-3xl italic tracking-tight">
                  PBBET
                </span>
              </div>

              {/* Desktop logo mark */}
              <div className="hidden lg:flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-[#3b82f6] font-black text-sm italic">
                    PB
                  </span>
                </div>
                <span className="text-[#3b82f6] font-black text-2xl italic tracking-tight">
                  PBBET
                </span>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Sign in to your account and keep playing
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="login-username"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#3b82f6] rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm"
                    placeholder="Enter your username"
                    aria-label="Username"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#3b82f6] rounded-xl px-4 py-3.5 pr-12 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm"
                      placeholder="••••••••"
                      aria-label="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#3b82f6] transition-colors cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium animate-fade-up"
                    role="alert"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 cursor-pointer glow-blue mt-2 text-sm uppercase tracking-widest"
                  aria-label="Log in to your account"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Log In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-slate-500 text-xs font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <p className="text-center text-slate-600 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#3b82f6] hover:text-[#1d4ed8] font-bold transition-colors cursor-pointer underline underline-offset-2"
                  aria-label="Go to Sign Up page"
                >
                  Sign Up Now
                </Link>
              </p>
            </div>

            <p className="text-center text-slate-600 text-xs mt-6">
              By continuing, you agree to PBBET&apos;s{" "}
              <span className="text-slate-700 font-medium">Terms of Service</span>{" "}
              &amp;{" "}
              <span className="text-slate-700 font-medium">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
