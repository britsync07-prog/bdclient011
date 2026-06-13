"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Zap,
  Wallet,
  Gamepad2,
  Headphones,
  Gift,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
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

function Benefit({
  icon: Icon,
  title,
  subtitle,
  color,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="flex items-center gap-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl px-5 py-4 shadow-md"
      style={{ animation: `floatBadge 3.5s ease-in-out infinite`, animationDelay: delay }}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-left">
        <p className="text-slate-800 font-bold text-sm leading-tight">{title}</p>
        <p className="text-slate-500 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Strength:{" "}
        <span
          className={`font-semibold ${
            strength <= 1
              ? "text-red-500"
              : strength === 2
              ? "text-amber-500"
              : strength === 3
              ? "text-lime-500"
              : "text-emerald-500"
          }`}
        >
          {labels[strength]}
        </span>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const allFilled =
    username.trim().length >= 3 &&
    password.length >= 8 &&
    confirmPassword === password;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    logClientAction("Click Register Submit", { username });
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        logClientAction("Register Success", { username });
        router.push("/");
      } else {
        logClientAction("Register Fail", { username, error: data.message || "Registration failed" });
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Register Error", { username, error: errMsg });
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
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
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
          50%       { box-shadow: 0 0 0 6px rgba(37,99,235,0.15); }
        }
        .animate-slide-left  { animation: slideInLeft  0.7s ease both; }
        .animate-slide-right { animation: slideInRight 0.7s ease both; }
        .animate-fade-up     { animation: fadeInUp     0.5s ease both; }
        .glow-blue { box-shadow: 0 0 30px rgba(37,99,235,0.4), 0 4px 16px rgba(37,99,235,0.2); }
        .glow-blue:hover { box-shadow: 0 0 42px rgba(37,99,235,0.55), 0 6px 24px rgba(37,99,235,0.3); }
        .success-ring { animation: successPulse 2s ease-in-out infinite; }
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
            className="w-96 h-96 bg-blue-400 top-[-80px] right-[-60px]"
            delay="0s"
          />
          <FloatingBlob
            className="w-72 h-72 bg-cyan-400 bottom-[-60px] left-[-40px]"
            delay="1.5s"
          />
          <FloatingBlob
            className="w-48 h-48 bg-amber-400 top-1/3 left-1/4"
            delay="0.7s"
          />

          <div className="absolute w-[520px] h-[520px] rounded-full border border-slate-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-[390px] h-[390px] rounded-full border border-slate-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div
            className={`relative z-10 text-center px-12 ${mounted ? "animate-slide-left" : "opacity-0"}`}
          >
            {/* Logo */}
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
                Join the Next-Gen iGaming Revolution
              </p>
            </div>

            <div className="flex items-center gap-4 mb-8 px-8">
              <div className="flex-1 h-px bg-slate-200" />
              <Zap size={16} className="text-blue-500/50" />
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Benefits */}
            <div className="flex flex-col gap-4">
              <Benefit
                icon={Wallet}
                title="Instant Deposits & Withdrawals"
                subtitle="BDT, USD & Crypto accepted"
                color="bg-blue-600"
                delay="0s"
              />
              <Benefit
                icon={Gamepad2}
                title="500+ Premium Games"
                subtitle="Slots, Live Casino, Sports & more"
                color="bg-amber-500"
                delay="0.35s"
              />
              <Benefit
                icon={Headphones}
                title="24/7 Live Support"
                subtitle="Always here to help you"
                color="bg-cyan-600"
                delay="0.7s"
              />
              <Benefit
                icon={Gift}
                title="Exclusive Welcome Bonus"
                subtitle="Up to ৳10,000 on first deposit"
                color="bg-emerald-600"
                delay="1.05s"
              />
            </div>

            <p className="text-slate-650 text-xs mt-8 tracking-widest uppercase">
              Licensed · Secured · Trusted
            </p>
          </div>
        </div>

        {/* RIGHT REGISTER CARD */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
          <div
            className={`w-full max-w-md ${mounted ? "animate-slide-right" : "opacity-0"}`}
          >
            <div
              className={`bg-white rounded-3xl shadow-2xl border transition-all duration-500 p-8 lg:p-10 text-slate-800 ${
                allFilled
                  ? "border-blue-500/40 success-ring"
                  : "border-slate-200"
              }`}
            >
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                      Create Account
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">
                      Start your iGaming journey today
                    </p>
                  </div>
                  {allFilled && (
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center animate-fade-up">
                      <CheckCircle2 size={20} className="text-[#3b82f6]" />
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-5" noValidate>
                {/* Username */}
                <div>
                  <label
                    htmlFor="reg-username"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Choose Username
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#3b82f6] rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm"
                    placeholder="e.g. lucky_player1"
                    aria-label="Choose a username"
                    required
                  />
                  {username.length > 0 && username.length < 3 && (
                    <p className="text-xs text-amber-500 mt-1 ml-1">
                      Must be at least 3 characters
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#3b82f6] rounded-xl px-4 py-3.5 pr-12 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm"
                      placeholder="••••••••"
                      aria-label="Create a password"
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
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="reg-confirm"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-slate-50 border-2 rounded-xl px-4 py-3.5 pr-12 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm ${
                        confirmPassword.length > 0
                          ? passwordsMatch
                            ? "border-emerald-500/50 focus:border-emerald-500"
                            : "border-red-500/50 focus:border-red-400"
                          : "border-slate-200 focus:border-[#3b82f6]"
                      }`}
                      placeholder="••••••••"
                      aria-label="Confirm your password"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {confirmPassword.length > 0 && passwordsMatch && (
                        <Check size={14} className="text-emerald-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="text-slate-500 hover:text-[#3b82f6] transition-colors cursor-pointer"
                        aria-label={
                          showConfirm
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1 ml-1 animate-fade-up">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium animate-fade-up"
                    role="alert"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase tracking-widest mt-2 ${
                    allFilled ? "glow-blue" : ""
                  }`}
                  aria-label="Create your account"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Terms */}
              <p className="text-center text-slate-650 text-xs mt-5 leading-relaxed px-2">
                By signing up, you confirm you are 18+ and agree to our{" "}
                <span className="text-slate-700 font-medium">Terms</span>{" "}
                &amp;{" "}
                <span className="text-slate-700 font-medium">
                  Privacy Policy
                </span>
              </p>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-slate-500 text-xs font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <p className="text-center text-slate-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#3b82f6] hover:text-[#1d4ed8] font-bold transition-colors cursor-pointer underline underline-offset-2"
                  aria-label="Go to Login page"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
