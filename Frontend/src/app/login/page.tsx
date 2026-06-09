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
      className={`absolute rounded-full opacity-20 blur-3xl animate-pulse ${className}`}
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
      className="flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-3 shadow-lg"
      style={{
        animation: `floatBadge 3s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-white font-semibold text-sm">{label}</span>
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
        router.push("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
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
        .glow-rose { box-shadow: 0 0 30px rgba(225,29,72,0.45), 0 4px 16px rgba(225,29,72,0.25); }
        .glow-rose:hover { box-shadow: 0 0 42px rgba(225,29,72,0.6), 0 6px 24px rgba(225,29,72,0.35); }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #0F172A !important;
        }
      `}</style>

      <div
        className="min-h-screen flex"
        style={{
          background:
            "linear-gradient(135deg, #F8FAFC 0%, #FFF1F2 50%, #EFF6FF 100%)",
        }}
      >
        {/* LEFT BRANDING PANEL */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(145deg, #E11D48 0%, #BE123C 40%, #9F1239 70%, #1E3A8A 100%)",
            }}
          />

          <FloatingBlob
            className="w-96 h-96 bg-rose-300 top-[-80px] left-[-80px]"
            delay="0s"
          />
          <FloatingBlob
            className="w-72 h-72 bg-blue-400 bottom-[-60px] right-[-60px]"
            delay="1.5s"
          />
          <FloatingBlob
            className="w-48 h-48 bg-pink-300 top-1/2 left-1/3"
            delay="0.8s"
          />

          <div className="absolute w-[500px] h-[500px] rounded-full border border-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-[380px] h-[380px] rounded-full border border-white/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div
            className={`relative z-10 text-center px-12 ${mounted ? "animate-slide-left" : "opacity-0"}`}
          >
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur rounded-3xl border border-white/25 mb-6 shadow-2xl">
                <span className="text-white font-black text-3xl italic tracking-tight">
                  PB
                </span>
              </div>
              <h1 className="text-6xl font-black text-white italic tracking-tight drop-shadow-lg">
                PBBET
              </h1>
              <p className="text-rose-200 font-medium text-lg mt-2 tracking-wide">
                Next-Gen iGaming Platform
              </p>
            </div>

            <div className="flex items-center gap-4 mb-10 px-8">
              <div className="flex-1 h-px bg-white/20" />
              <Zap size={16} className="text-white/50" />
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <div className="flex flex-col gap-4 items-center">
              <GameBadge
                icon={Trophy}
                label="Live Tournaments"
                delay="0s"
                color="bg-amber-500"
              />
              <GameBadge
                icon={Dices}
                label="500+ Casino Games"
                delay="0.4s"
                color="bg-violet-500"
              />
              <GameBadge
                icon={Spade}
                label="Premium Card Tables"
                delay="0.8s"
                color="bg-blue-500"
              />
              <GameBadge
                icon={ShieldCheck}
                label="Secure & Licensed"
                delay="1.2s"
                color="bg-emerald-500"
              />
            </div>

            <p className="text-white/50 text-xs mt-10 tracking-widest uppercase">
              Trusted by 1M+ players worldwide
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div
            className={`w-full max-w-md ${mounted ? "animate-slide-right" : "opacity-0"}`}
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 p-8 lg:p-10">
              {/* Mobile logo */}
              <div className="flex lg:hidden flex-col items-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-50 rounded-2xl border border-rose-100 mb-3">
                  <span className="text-[#E11D48] font-black text-xl italic">
                    PB
                  </span>
                </div>
                <span className="text-[#E11D48] font-black text-3xl italic tracking-tight">
                  PBBET
                </span>
              </div>

              {/* Desktop logo mark */}
              <div className="hidden lg:flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center">
                  <span className="text-[#E11D48] font-black text-sm italic">
                    PB
                  </span>
                </div>
                <span className="text-[#E11D48] font-black text-2xl italic tracking-tight">
                  PBBET
                </span>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
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
                    className="block text-sm font-semibold text-[#0F172A] mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 focus:border-[#E11D48] rounded-xl px-4 py-3.5 text-[#0F172A] placeholder-slate-400 outline-none transition-all duration-200 text-sm"
                    placeholder="Enter your username"
                    aria-label="Username"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-semibold text-[#0F172A] mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#E11D48] rounded-xl px-4 py-3.5 pr-12 text-[#0F172A] placeholder-slate-400 outline-none transition-all duration-200 text-sm"
                      placeholder="••••••••"
                      aria-label="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E11D48] transition-colors cursor-pointer"
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
                  className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 cursor-pointer glow-rose mt-2 text-sm uppercase tracking-widest"
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
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-slate-400 text-xs font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <p className="text-center text-slate-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#E11D48] hover:text-[#BE123C] font-bold transition-colors cursor-pointer underline underline-offset-2"
                  aria-label="Go to Sign Up page"
                >
                  Sign Up Now
                </Link>
              </p>
            </div>

            <p className="text-center text-slate-400 text-xs mt-6">
              By continuing, you agree to PBBET&apos;s{" "}
              <span className="text-slate-500 font-medium">Terms of Service</span>{" "}
              &amp;{" "}
              <span className="text-slate-500 font-medium">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
