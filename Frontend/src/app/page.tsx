"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Hexagon, Home, Coins, CircleDot, Users, Gift, Gem, Network, Headphones,
  Search, Globe, ChevronDown, MessageSquare, Star, Crown, Bitcoin, Trophy,
  LayoutGrid, Cherry, Radio, Grid3x3, DollarSign, ChevronRight, User,
  HelpCircle, ShieldCheck, Heart, X, LogOut, Wallet, Menu, Loader2,
  Gamepad2, Building2, HeadphonesIcon, Mail, AlertTriangle, BadgeCheck,
  Spade, Ticket, Target,
} from "lucide-react";
import { useGameStore } from "@/contexts/GameStoreContext";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useFilteredGames } from "@/hooks/useFilteredGames";
import { Category } from "@/types/game";
import { TRANSLATIONS } from "@/constants";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

// ─── Payment & Provider logos (from footer component) ───
const paymentLogos = [
  { src: "/images/payments/pay34.png", alt: "bKash" },
  { src: "/images/payments/pay22.png", alt: "Nagad" },
  { src: "/images/payments/pay33.png", alt: "Rocket" },
  { src: "/images/payments/pay61.png", alt: "Upay" },
  { src: "/images/payments/pay59.png", alt: "Tether USDT" },
  { src: "/images/payments/pay45.png", alt: "Bank Transfer" },
];

const providerLogos = [
  { src: "/images/providers/provider-saba.png", alt: "SABA Sports" },
  { src: "/images/providers/provider-jdb.png", alt: "JDB" },
  { src: "/images/providers/provider-cq9.png", alt: "CQ9" },
  { src: "/images/providers/provider-pg.png", alt: "PG Soft" },
  { src: "/images/providers/provider-evo.png", alt: "Ezugi / Evolution" },
  { src: "/images/providers/provider-ka.png", alt: "KA Gaming" },
  { src: "/images/providers/provider-awcv2_jili.png", alt: "JILI" },
  { src: "/images/providers/provider-awcv2_fc.png", alt: "FaChai" },
  { src: "/images/providers/provider-awcv2_pp.png", alt: "Pragmatic Play" },
  { src: "/images/providers/provider-netent.png", alt: "NetEnt" },
  { src: "/images/providers/provider-playngo.png", alt: "Play'n GO" },
  { src: "/images/providers/provider-jdbaspribe.png", alt: "Spribe" },
  { src: "/images/providers/provider-sbov2.png", alt: "SBO Virtuals" },
  { src: "/images/providers/provider-awcv2_sexybcrt.png", alt: "Sexy Baccarat" },
];

// Social Icons
const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const BangladeshFlag = () => (
  <svg viewBox="0 0 20 12" className="w-4 h-2.5 rounded-[1px] object-cover shrink-0 inline-block" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="12" fill="#006a4e"/>
    <circle cx="9" cy="6" r="3.5" fill="#f42a41"/>
  </svg>
);

const USFlag = () => (
  <svg viewBox="0 0 20 12" className="w-4 h-2.5 rounded-[1px] object-cover shrink-0 inline-block" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="12" fill="#b22234"/>
    <path d="M0,0.92h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0zm0,1.84h20v0.92H0z" fill="#fff"/>
    <rect width="8" height="6.4" fill="#3c3b6e"/>
    <circle cx="2" cy="1.6" r="0.4" fill="#fff"/>
    <circle cx="4" cy="1.6" r="0.4" fill="#fff"/>
    <circle cx="6" cy="1.6" r="0.4" fill="#fff"/>
    <circle cx="3" cy="3.2" r="0.4" fill="#fff"/>
    <circle cx="5" cy="3.2" r="0.4" fill="#fff"/>
    <circle cx="2" cy="4.8" r="0.4" fill="#fff"/>
    <circle cx="4" cy="4.8" r="0.4" fill="#fff"/>
    <circle cx="6" cy="4.8" r="0.4" fill="#fff"/>
  </svg>
);

// ─── Category config ───
const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "All Games", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "slots", label: "Slots", icon: <Cherry className="h-4 w-4" /> },
  { key: "live", label: "Live Casino", icon: <Radio className="h-4 w-4" /> },
  { key: "table", label: "Table Games", icon: <Grid3x3 className="h-4 w-4" /> },
  { key: "cards", label: "Card Games", icon: <Spade className="h-4 w-4" /> },
  { key: "crash", label: "Crash Games", icon: <Bitcoin className="h-4 w-4" /> },
  { key: "fishing", label: "Fishing", icon: <DollarSign className="h-4 w-4" /> },
  { key: "arcade", label: "Arcade", icon: <Gamepad2 className="h-4 w-4" /> },
  { key: "lottery", label: "Lottery", icon: <Ticket className="h-4 w-4" /> },
  { key: "sports", label: "Sports", icon: <Target className="h-4 w-4" /> },
];

// ─── Sidebar nav items ───
const NAV_ITEMS = [
  { icon: Home, label: "Home", key: "home" },
  { icon: Coins, label: "Casino", key: "casino" },
  { icon: CircleDot, label: "Sports", key: "sports" },
  { icon: Users, label: "Live Dealer", key: "live" },
  { icon: Gift, label: "Promotions", key: "promotions" },
  { icon: Gem, label: "VIP", key: "vip" },
  { icon: Network, label: "Affiliate", key: "affiliate" },
  { icon: Headphones, label: "Support", key: "support" },
];

export default function HomePage() {
  const { state, setSearchTerm, setCategory } = useGameStore();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const filteredGames = useFilteredGames();

  const [lang, setLang] = useState<"BN" | "EN">("BN");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as "BN" | "EN";
    if (savedLang && (savedLang === "BN" || savedLang === "EN")) {
      setLang(savedLang);
    }
  }, []);

  const handleLanguageChange = useCallback((newLang: "BN" | "EN") => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  const getNavLabel = useCallback((key: string) => {
    switch (key) {
      case "home": return t.HOME;
      case "casino": return t.CASINO;
      case "sports": return t.SPORTS;
      case "live": return t.LIVE || "Live Dealer";
      case "promotions": return t.PROMOTIONS;
      case "vip": return t.VIP;
      case "affiliate": return t.REFERRAL || "Affiliate";
      case "support": return t.CONTACT || "Support";
      default: return key;
    }
  }, [t]);

  const getCategoryLabel = useCallback((key: string) => {
    switch (key) {
      case "home": return t.ALL_GAMES || "All Games";
      case "slots": return t.SLOTS || "Slots";
      case "live": return t.LIVE || "Live Casino";
      case "table": return t.TABLE || "Table Games";
      case "cards": return t.CARDS || "Card Games";
      case "crash": return t.CRASH || "Crash Games";
      case "fishing": return t.FISHING || "Fishing";
      case "arcade": return t.ARCADE || "Arcade";
      case "lottery": return t.LOTTERY || "Lottery";
      case "sports": return t.SPORTS || "Sports";
      default: return key;
    }
  }, [t]);

  const [user, setUser] = useState<{ username: string; balance: number } | null>(null);
  const [activeNav, setActiveNav] = useState("casino");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [launchingGameId, setLaunchingGameId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [showMoreGames, setShowMoreGames] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [depositStatus, setDepositStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Check auth state
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${BACKEND_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser({ username: data.username, balance: data.balance });
        })
        .catch(() => setUser(null));
    }

    // Fetch site settings
    fetch(`${BACKEND_URL}/user/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .catch(() => {});
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  }, []);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositStatus(null);
    const amountNum = Number(depositAmount);
    if (!depositAmount || isNaN(amountNum) || amountNum <= 0) {
      setDepositStatus({ type: "error", message: lang === "BN" ? "দয়া করে একটি সঠিক পরিমাণ প্রবেশ করুন" : "Please enter a valid amount" });
      return;
    }
    setDepositing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDepositStatus({ type: "error", message: lang === "BN" ? "অনুমোদন টোকেন পাওয়া যায়নি" : "Authorization token not found" });
        setDepositing(false);
        return;
      }
      const res = await fetch(`${BACKEND_URL}/user/deposit-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amountNum }),
      });
      const data = await res.json();
      if (res.ok) {
        setDepositStatus({ type: "success", message: t.DEPOSIT_SUCCESS || "Deposit request submitted successfully!" });
        setDepositAmount("");
        // Optionally refresh profile/balance after a short delay
        setTimeout(() => {
          setShowDepositModal(false);
          setDepositStatus(null);
        }, 3000);
      } else {
        setDepositStatus({ type: "error", message: data.message || (lang === "BN" ? "জমার অনুরোধ জমা দিতে ব্যর্থ হয়েছে" : "Failed to submit deposit request") });
      }
    } catch {
      setDepositStatus({ type: "error", message: lang === "BN" ? "সার্ভারের সাথে সংযোগ করতে ব্যর্থ হয়েছে" : "Failed to connect to server" });
    } finally {
      setDepositing(false);
    }
  };

  const handleLaunchGame = useCallback(async (gameId: string, vendorCode?: string, gameCode?: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (!vendorCode || !gameCode) return;

    setLaunchingGameId(gameId);
    try {
      const res = await fetch(`${BACKEND_URL}/user/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorCode, gameCode }),
      });
      const data = await res.json();
      if (res.ok && data.launchUrl) {
        window.open(data.launchUrl, "_blank");
      } else {
        alert(data.message || t.ALERT_LAUNCH_FAIL || "Failed to launch game. Please try again.");
      }
    } catch {
      alert(t.ALERT_CONNECT_FAIL || "Failed to connect to server. Please try again.");
    } finally {
      setLaunchingGameId(null);
    }
  }, [t]);

  const handleNavClick = useCallback((key: string) => {
    setActiveNav(key);
    if (key === "home") setCategory("home");
    else if (key === "casino") setCategory("home");
    else if (key === "live") setCategory("live");
    else if (key === "sports") setCategory("sports");
    setMobileMenuOpen(false);
  }, [setCategory]);

  // Display games - limit to 12 unless show more
  const displayedGames = useMemo(() => {
    if (showMoreGames) return filteredGames;
    return filteredGames.slice(0, 12);
  }, [filteredGames, showMoreGames]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen flex overflow-hidden w-full bg-[#0b1329] text-slate-100 font-sans antialiased">
      {/* Marquee animation keyframes */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>

      {/* BEGIN: Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0b1329] hidden md:flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Hexagon className="text-amber-500 fill-amber-500/20 h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-white">PBBET</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center px-6 py-3 transition-colors ${
                  activeNav === item.key
                    ? "nav-item-active"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium text-sm">{getNavLabel(item.key)}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User info in sidebar when logged in */}
        {user && (
          <div className="p-4 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <User className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-amber-400 font-semibold">৳{user.balance?.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="w-full gold-gradient-btn py-2.5 rounded-xl text-center text-sm font-semibold block shadow-lg"
            >
              {t.DEPOSIT || "Deposit"}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-3 w-3" /> {t.LOGOUT || "Logout"}
            </button>
          </div>
        )}
      </aside>
      {/* END: Sidebar */}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0b1329] border-r border-white/5 flex flex-col">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Hexagon className="text-amber-500 fill-amber-500/20 h-6 w-6" />
                <span className="text-xl font-bold text-white">PBBET</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center px-6 py-3 transition-colors ${
                      activeNav === item.key
                        ? "nav-item-active"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium text-sm">{getNavLabel(item.key)}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* BEGIN: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* BEGIN: Header */}
        <header className="h-16 glass-header sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center flex-1 gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-full py-2 pl-10 pr-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-[#1e293b] transition-all"
                placeholder={t.SEARCH_PLACEHOLDER || "Search games or providers..."}
                type="text"
                value={state.searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {state.searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-[#0b1329] p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => handleLanguageChange("BN")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lang === "BN"
                    ? "bg-[#3b82f6] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BangladeshFlag />
                বাংলা
              </button>
              <button
                onClick={() => handleLanguageChange("EN")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lang === "EN"
                    ? "bg-[#3b82f6] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <USFlag />
                EN
              </button>
            </div>
            <button className="text-slate-300 hover:text-white transition-colors relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-white/10 mx-1 sm:mx-2"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-[#1e293b]/50 border border-white/10 rounded-full px-4 py-2">
                  <Wallet className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">৳{user.balance?.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="gold-gradient-btn px-4 py-2 rounded-full font-semibold text-sm tracking-wide"
                >
                  {t.DEPOSIT || "Deposit"}
                </button>
                <Link
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLogout(); }}
                  className="blue-gradient-btn px-4 sm:px-6 py-2 rounded-full font-semibold text-sm tracking-wide"
                >
                  {t.LOGOUT || "Logout"}
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="gold-gradient-btn px-4 sm:px-6 py-2 rounded-full font-semibold text-sm tracking-wide">
                  {t.LOGIN || "Login"}
                </Link>
                <Link href="/register" className="blue-gradient-btn px-4 sm:px-6 py-2 rounded-full font-semibold text-sm tracking-wide">
                  {t.SIGNUP || "Sign Up"}
                </Link>
              </>
            )}
          </div>
        </header>
        {/* END: Header */}

        {/* BEGIN: Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 z-10 space-y-6">
          {/* Mobile Search */}
          <div className="sm:hidden relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-[#1e293b]/50 border border-white/10 rounded-full py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-[#1e293b] transition-all"
              placeholder={t.SEARCH_PLACEHOLDER || "Search games..."}
              type="text"
              value={state.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {state.searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Marquee Notification */}
          <div className="glass-panel rounded-full py-2 px-6 flex items-center gap-3 overflow-hidden border border-amber-500/20">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="flex-1 overflow-hidden relative">
              <p className="text-sm text-amber-100 whitespace-nowrap animate-[marquee_20s_linear_infinite]">
                {settings.announcement || "Welcome to PBBET! Register now and get exclusive bonuses. Play 500+ casino games from top providers!"} <span className="mx-8 text-white/20">|</span> {t.MARQUEE_LEADERBOARD || "Live Leaderboard Updated! Check Your Rank!"}
              </p>
            </div>
          </div>

          {/* Hero & Promo Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Hero Banner */}
            <div className="lg:col-span-6 xl:col-span-7 relative rounded-2xl overflow-hidden group card-hover min-h-[240px] sm:min-h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent z-10 p-6 sm:p-8 flex flex-col justify-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight max-w-md">{t.HERO_TITLE || "THE ULTIMATE CRYPTO CASINO EXPERIENCE"}</h1>
                <div>
                  {user ? (
                    <button
                      onClick={() => setCategory("home")}
                      className="gold-gradient-btn px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    >
                      {t.PLAY_NOW || "Play Now"}
                    </button>
                  ) : (
                    <Link
                      href="/register"
                      className="gold-gradient-btn px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] inline-block"
                    >
                      {t.SIGNUP || "Join Now"}
                    </Link>
                  )}
                </div>
              </div>
              <img alt="Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjFThcWaQapjh4o8aL7LCv-70xeQLuO1jAiaGDQjPrpuEBQ67HSBopHhrfNqsQU6SathaRyRnXD0bDoIfZRVki3PCrlrUgazS4pvDVdsyg9A21JCghjG6d9XFv79G4wSE3yU34hvywc9_XP3XEullHWQw40wk48ypYE6CFzjF6FZtjRwvul0uvK_fM2gNyC6DMLh4xcMrb0avvg2d5fMbBfpInUp-X_AFYccrR1GvGpB8PwHdGWJW-U4tQFnZXCx3V2E3G8U2Hkq0" />
            </div>

            {/* Promo Tiles */}
            <div className="lg:col-span-6 xl:col-span-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-rose-600 to-rose-900 border border-white/10 card-hover flex flex-col justify-between group">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t.LOBBY_CARD_VIP_CASHBACK || "VIP Cashback"}
                  </h3>
                  <p className="text-xs text-rose-100/80">
                    {t.LOBBY_CARD_VIP_DESC || "200% Match up to 5 BTC & 100 free spins"}
                  </p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                <Crown className="absolute bottom-4 right-4 h-12 w-12 text-rose-300 opacity-50" />
              </div>

              <div className="rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 border border-white/10 card-hover flex flex-col justify-between group">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t.LOBBY_CARD_RAFFLE || "Weekly Crypto Raffle"}
                  </h3>
                  <p className="text-xs text-blue-100/80">
                    {t.LOBBY_CARD_RAFFLE_DESC || "Get the daily weekly crypto raffle"}
                  </p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                <Bitcoin className="absolute bottom-4 right-4 h-12 w-12 text-blue-300 opacity-50" />
              </div>

              <div className="col-span-2 rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 card-hover flex flex-col justify-center group h-28">
                <div className="relative z-10 flex justify-between items-center w-full">
                  <div>
                    <h3 className="text-xl font-bold text-amber-400 mb-1">
                      {t.LOBBY_CARD_TOURNAMENT || "High Roller Tournament"}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {t.LOBBY_CARD_TOURNAMENT_DESC || "Offers for high roller tournament"}
                    </p>
                  </div>
                  <Trophy className="h-10 w-10 text-amber-500 opacity-80 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>

          {/* Categories Navigation */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setCategory(cat.key);
                  setShowMoreGames(false);
                }}
                className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium whitespace-nowrap snap-start transition-all ${
                  state.selectedCategory === cat.key
                    ? "category-chip active"
                    : "category-chip bg-[#1e293b]/80 hover:bg-[#1e293b] text-slate-300"
                }`}
              >
                {cat.icon} {getCategoryLabel(cat.key)}
              </button>
            ))}

            <button className="ml-auto bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors flex-shrink-0">
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Games count */}
          {state.searchTerm && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {(t.GAMES_FOUND || "{count} games found").replace("{count}", String(filteredGames.length))} {t.SEARCH_RESULTS_FOR || "for"} &ldquo;{state.searchTerm}&rdquo;
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.RESET_FILTERS || "Clear search"}
              </button>
            </div>
          )}

          {/* Game Grid */}
          {state.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-panel rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-800/50"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.NO_GAMES_FOUND || "No games found"}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {t.NO_GAMES_MESSAGE || "Try a different search or category"}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategory("home");
                }}
                className="blue-gradient-btn px-6 py-2 rounded-full font-semibold text-sm"
              >
                {t.RESET_FILTERS || "Reset Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {displayedGames.map((game) => (
                <div key={game.id} className="glass-panel rounded-xl overflow-hidden group card-hover">
                  <div className="relative aspect-video overflow-hidden bg-slate-800">
                    {game.isNew && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase z-10">
                        {t.NEW || "New"}
                      </div>
                    )}
                    {game.isPopular && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase z-10">
                        {t.HOT || "Hot"}
                      </div>
                    )}
                    {game.thumbnail ? (
                      <img
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={game.thumbnail}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                        <Gamepad2 className="h-8 w-8 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleLaunchGame(game.id, game.vendorCode, game.gameCode)}
                        className="gold-gradient-btn px-6 py-2 rounded-full font-bold text-sm"
                        disabled={launchingGameId === game.id}
                      >
                        {launchingGameId === game.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t.PLAY || "PLAY"
                        )}
                      </button>
                      <button
                        onClick={() => toggleFavorite(game.id)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(game.id) ? "text-red-500 fill-red-500" : "text-white"}`} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-white font-medium truncate text-sm">{game.name}</h4>
                    <p className="text-xs text-slate-400">{game.provider}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show More */}
          {!showMoreGames && filteredGames.length > 12 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowMoreGames(true)}
                className="blue-gradient-btn px-8 py-3 rounded-full font-semibold text-sm tracking-wide"
              >
                {t.SHOW_ALL || "Show All"} {filteredGames.length} {t.GAMES || "Games"}
              </button>
            </div>
          )}

          {/* Section Indicator */}
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-8 h-1 rounded-full bg-amber-500"></div>
            <div className="w-8 h-1 rounded-full bg-white/20"></div>
          </div>

          {/* Bottom Section: Leaderboard & Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Leaderboard */}
            <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">{t.LEADERBOARD_RANK || "Rank"}</th>
                    <th className="px-6 py-4 font-medium">{t.LEADERBOARD_PLAYER || "Player"}</th>
                    <th className="px-6 py-4 font-medium">{t.LEADERBOARD_GAME || "Game"}</th>
                    <th className="px-6 py-4 font-medium text-right">{t.LEADERBOARD_WIN || "Win Amount"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-slate-300">1.</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/30">
                        <Crown className="h-3 w-3 text-emerald-400" />
                      </div>
                      <span className="font-medium text-white group-hover:text-amber-400 transition-colors">CryptoKing</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">Bitcoin Slots</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-semibold">+1.25 BTC</td>
                  </tr>
                  <tr className="bg-white/[0.02] hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-slate-300">2.</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center border border-purple-500/30">
                        <User className="h-3 w-3 text-purple-400" />
                      </div>
                      <span className="font-medium text-white group-hover:text-amber-400 transition-colors">LuckyAce99</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">Gates of Olympus</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-semibold">+0.89 BTC</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors group opacity-50">
                    <td className="px-6 py-4 text-slate-300">3.</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-900/50 flex items-center justify-center border border-rose-500/30">
                        <User className="h-3 w-3 text-rose-400" />
                      </div>
                      <span className="font-medium text-white group-hover:text-amber-400 transition-colors">HighRoller</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">Sweet Bonanza</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-semibold">+0.52 BTC</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Trust Badge */}
            <div className="glass-panel rounded-2xl flex flex-col items-center justify-center p-6 text-center border-t-2 border-t-blue-500/30 relative">
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="w-16 h-16 mb-4 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full"></div>
                <ShieldCheck className="w-full h-full text-blue-400 relative z-10" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{t.RNG_CERTIFIED || "RNG Certified"}</h4>
              <p className="text-sm text-slate-400">{t.SECURE || "& Secure"}</p>
            </div>
          </div>

          {/* ═══════ FOOTER ═══════ */}
          <footer className="border-t border-white/5 pt-12 pb-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
              {/* Brand column */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <Hexagon className="text-amber-500 fill-amber-500/20 h-6 w-6" />
                  <span className="text-2xl font-extrabold tracking-tight text-white">PBBET</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {settings.about_us || "PBBET is the ultimate crypto casino platform offering 500+ premium games from top providers. Licensed, secure, and trusted by players worldwide."}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{t.EST || "Est."} {currentYear - 1}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t.FOLLOW_US || "Follow Us"}</p>
                  <div className="flex items-center gap-2">
                    <a href={settings.social_twitter || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/30 transition-all">
                      <TwitterXIcon />
                    </a>
                    <a href={settings.social_facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400/30 transition-all">
                      <FacebookIcon />
                    </a>
                    <a href={settings.social_telegram || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400/30 transition-all">
                      <TelegramIcon />
                    </a>
                    {settings.contact_email && (
                      <a href={`mailto:${settings.contact_email}`} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/30 transition-all">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Games links */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
                  <Gamepad2 size={13} className="text-amber-400" /> {t.GAMES || "Games"}
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: t.HOME || "Casino Games", cat: "home" as Category },
                    { label: t.LIVE || "Live Dealers", cat: "live" as Category },
                    { label: t.SLOTS || "Slot Machines", cat: "slots" as Category },
                    { label: t.TABLE || "Table Games", cat: "table" as Category },
                    { label: t.CRASH || "Crash Games", cat: "crash" as Category },
                  ].map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => { setCategory(link.cat); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="text-sm text-slate-400 hover:text-amber-400 transition-colors font-medium"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company links */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
                  <Building2 size={13} className="text-amber-400" /> {t.COMPANY || "Company"}
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: t.ABOUT_US || "About Us", href: "#" },
                    { label: t.BLOG_NEWS || "Blog & News", href: "#" },
                    { label: t.CAREERS || "Careers", href: "#" },
                    { label: t.REFERRAL || "Affiliate Program", href: "#" }
                  ].map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-slate-400 hover:text-amber-400 transition-colors font-medium">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support links */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
                  <HeadphonesIcon size={13} className="text-amber-400" /> {t.CONTACT || "Support"}
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: t.LIVE_SUPPORT || "24/7 Live Support", href: "#" },
                    { label: t.RESPONSIBLE_GAMING || "Play Responsibly", href: "#" },
                    { label: t.SECURITY_CENTER || "Security Center", href: "#" },
                    { label: t.FAQ || "FAQ Help", href: "#" }
                  ].map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-slate-400 hover:text-amber-400 transition-colors font-medium">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Methods & Partners */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-white/5 pt-8 mt-4 space-y-6">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5">{t.PAYMENT_METHODS || "Payment Methods"}</h5>
                  <div className="flex flex-wrap items-center gap-4 opacity-60 hover:opacity-100 transition-all duration-300">
                    {paymentLogos.map((logo, index) => (
                      <div key={index} className="bg-white/5 p-1.5 px-3 rounded-lg border border-white/10 shadow-sm flex items-center justify-center">
                        <img src={logo.src} alt={logo.alt} title={logo.alt} className="h-[24px] w-auto object-contain select-none" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5">{t.PARTNERS || "Partners"}</h5>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-4 opacity-45 hover:opacity-100 transition-all duration-300">
                    {providerLogos.map((logo, index) => (
                      <img key={index} src={logo.src} alt={logo.alt} title={logo.alt} className="h-[22px] md:h-[24px] w-auto object-contain select-none" loading="lazy" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Responsible Gaming Notice */}
            <div className="border-t border-white/5 pt-8 space-y-6">
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-1">{t.PLAY_RESPONSIBLY || "Play Responsibly"}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.PLAY_RESPONSIBLY_DETAILS || "Gaming should be for entertainment and fun. If you think you might have a gambling problem, please seek professional help immediately."}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck size={13} className="text-amber-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-300">{t.OVER18_ONLY || "18+ Only"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-300">{t.LICENSED_REGULATED || "Licensed & Regulated"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-300">{t.SECURE_GAMING || "Secure Gaming"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    © {currentYear} <span className="font-bold text-amber-400">PBBET</span> — {t.ROYAL_CASINO || "Premium Crypto Casino"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.PREMIUM_GAMING_EXPERIENCE || "Premium gaming experience powered by state-of-the-art technology"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {[
                    { label: t.PRIVACY || "Privacy Policy", href: "#" },
                    { label: t.TERMS || "Terms & Conditions", href: "#" },
                    { label: t.RESPONSIBLE_GAMING || "Responsible Gaming", href: "#" }
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="text-xs text-slate-500 hover:text-amber-400 transition-colors font-medium">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </main>
        {/* END: Main Scrollable Content */}
      </div>
      {/* END: Main Content Area */}

      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-[#151f38] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => { setShowDepositModal(false); setDepositStatus(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-400" />
              {t.DEPOSIT || "Deposit Request"}
            </h3>
            <form onSubmit={handleDepositSubmit} className="space-y-6">
              {depositStatus && (
                <div className={`p-4 rounded-xl text-xs font-semibold ${depositStatus.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {depositStatus.message}
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.DEPOSIT_AMOUNT || "Deposit Amount (BDT)"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    disabled={depositing}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="500"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-[#0b1329]/80 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              {/* Quick select amounts */}
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(String(amt))}
                    className="py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    ৳{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={depositing}
                className="w-full py-3.5 rounded-xl font-bold bg-[#3b82f6] hover:bg-blue-600 text-white transition-all disabled:opacity-50"
              >
                {depositing ? (lang === "BN" ? "প্রক্রিয়াকরণ হচ্ছে..." : "Processing...") : (t.DEPOSIT_SUBMIT || "Submit Request")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
