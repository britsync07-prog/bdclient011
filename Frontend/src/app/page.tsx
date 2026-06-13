"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Hexagon, Home, Coins, CircleDot, Users, Gift, Gem, Network, Headphones,
  Search, Globe, ChevronDown, MessageSquare, Star, Crown, Bitcoin, Trophy,
  LayoutGrid, Cherry, Radio, Grid3x3, DollarSign, ChevronRight, ChevronLeft, User,
  HelpCircle, ShieldCheck, Heart, X, LogOut, Wallet, Menu, Loader2,
  Gamepad2, Building2, HeadphonesIcon, Mail, AlertTriangle, BadgeCheck,
  Spade, Ticket, Target,
  LayoutDashboard, Sparkles, Anchor, Zap, Dices,
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
  { key: "all", label: "Hot Games", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "slots", label: "Slots", icon: <Cherry className="h-4 w-4" /> },
  { key: "live", label: "Live Casino", icon: <Radio className="h-4 w-4" /> },
  { key: "crash", label: "Crash Games", icon: <Zap className="h-4 w-4" /> },
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

const SIDEBAR_ITEMS = [
  { key: "all", icon: LayoutDashboard },
  { key: "casino", icon: Radio },
  { key: "slots", icon: Cherry },
  { key: "megaways", icon: Sparkles },
  { key: "cards", icon: Spade },
  { key: "table", icon: Grid3x3 },
  { key: "fishing", icon: Anchor },
  { key: "crash", icon: Zap },
  { key: "lottery", icon: Dices },
  { key: "arcade", icon: Gamepad2 },
  { key: "promotions", icon: Gift },
  { key: "vip", icon: Crown },
  { key: "favorites", icon: Star },
];

export default function HomePage() {
  const { state, setSearchTerm, setCategory, toggleFavoritesOnly } = useGameStore();
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
      case "all": return t.HOT_GAMES || "Hot Games";
      case "casino": return t.CASINO || "Casino";
      case "slots": return t.SLOTS || "Slots";
      case "megaways": return t.MEGAWAYS || "Megaways";
      case "cards": return t.CARDS || "Card Games";
      case "table": return t.TABLE || "Table Games";
      case "fishing": return t.FISHING || "Fishing";
      case "crash": return t.CRASH || "Crash Games";
      case "lottery": return t.LOTTERY || "Lottery";
      case "arcade": return t.ARCADE || "Arcade";
      case "promotions": return t.PROMOTIONS || "Promotions";
      case "vip": return t.VIP || "VIP";
      case "favorites": return t.FAVORITES || "Favorites";
      default: return key;
    }
  }, [t]);

  const getCategoryLabel = useCallback((key: string) => {
    switch (key) {
      case "home": return t.ALL_GAMES || "All Games";
      case "all": return t.HOT_GAMES || "Hot Games";
      case "slots": return t.SLOTS || "Slots";
      case "megaways": return t.MEGAWAYS || "Megaways";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    
    // Reset favorites filter if moving away from favorites
    if (state.showFavoritesOnly && key !== "favorites") {
      toggleFavoritesOnly();
    }
    
    if (key === "favorites") {
      if (!state.showFavoritesOnly) {
        toggleFavoritesOnly();
      }
    } else if (key === "all") {
      setCategory("all");
    } else if (key === "casino") {
      setCategory("live");
    } else if (key === "slots") {
      setCategory("slots");
    } else if (key === "megaways") {
      setCategory("megaways");
    } else if (key === "cards") {
      setCategory("cards");
    } else if (key === "table") {
      setCategory("table");
    } else if (key === "fishing") {
      setCategory("fishing");
    } else if (key === "crash") {
      setCategory("crash");
    } else if (key === "lottery") {
      setCategory("lottery");
    } else if (key === "arcade") {
      setCategory("arcade");
    }
    setMobileMenuOpen(false);
  }, [state.showFavoritesOnly, toggleFavoritesOnly, setCategory]);

  const isItemActive = useCallback((key: string) => {
    if (key === "favorites") return state.showFavoritesOnly;
    if (key === "promotions" || key === "vip") return activeNav === key;
    return state.selectedCategory === (key === "casino" ? "live" : key) && !state.showFavoritesOnly;
  }, [state.selectedCategory, state.showFavoritesOnly, activeNav]);

  // Display games - limit to 12 unless show more
  const displayedGames = useMemo(() => {
    if (showMoreGames) return filteredGames;
    return filteredGames.slice(0, 12);
  }, [filteredGames, showMoreGames]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="antialiased h-screen flex overflow-hidden bg-[#0b1329] text-[#f8fafc]">
      {/* Marquee animation keyframes (from globals or inline) */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>

      {/* BEGIN: Sidebar */}
      <aside className={`${isSidebarCollapsed ? "w-20" : "w-64"} transition-all duration-300 flex-shrink-0 border-r border-white/5 bg-[#0b1329] hidden md:flex flex-col z-20 relative`}>
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-6 justify-between"} border-b border-white/5 shrink-0`}>
          <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
            <Hexagon className="text-amber-500 fill-amber-500/20 h-6 w-6 shrink-0" />
            {!isSidebarCollapsed && <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">PBBET</span>}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`${isSidebarCollapsed ? "absolute -right-3 top-5 bg-[#0b1329] border border-white/10 rounded-full p-1 z-30" : "text-slate-400 hover:text-white"}`}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4 text-white" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 overflow-x-hidden">
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const active = isItemActive(item.key);
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  title={getNavLabel(item.key)}
                  className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-6"} py-3 transition-colors ${
                    active
                      ? "nav-item-active"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isSidebarCollapsed ? "m-0" : "mr-3"} shrink-0`} />
                  {!isSidebarCollapsed && <span className="font-medium text-sm whitespace-nowrap">{getNavLabel(item.key)}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        {user && (
          <div className={`p-4 border-t border-white/5 space-y-3 bg-[#0b1329] shrink-0 flex flex-col ${isSidebarCollapsed ? "items-center" : ""}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                <User className="h-4 w-4 text-blue-400" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.username}</p>
                  <p className="text-xs text-amber-400 font-extrabold">৳{user.balance?.toLocaleString()}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              title={t.DEPOSIT || "Deposit"}
              className={`w-full gold-gradient-btn ${isSidebarCollapsed ? "p-2 aspect-square" : "py-2"} rounded-full text-center text-sm font-bold tracking-wide shadow-lg flex justify-center items-center`}
            >
              {isSidebarCollapsed ? <Wallet className="h-4 w-4" /> : (t.DEPOSIT || "Deposit")}
            </button>
            <button
              onClick={handleLogout}
              title={t.LOGOUT || "Logout"}
              className={`w-full flex items-center justify-center ${isSidebarCollapsed ? "p-2" : "gap-2 py-2"} text-slate-400 hover:text-white text-xs rounded-full hover:bg-white/5 transition-all font-semibold uppercase tracking-wider`}
            >
              <LogOut className="h-4 w-4" /> {!isSidebarCollapsed && (t.LOGOUT || "Logout")}
            </button>
          </div>
        )}
      </aside>
      {/* END: Sidebar */}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#0b1329] border-r border-white/5 flex flex-col overflow-y-auto">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <Hexagon className="text-amber-500 fill-amber-500/20 h-6 w-6" />
                <span className="text-xl font-bold tracking-tight text-white">PBBET</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                  const active = isItemActive(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => { handleNavClick(item.key); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center px-6 py-3 transition-colors ${
                        active
                          ? "nav-item-active"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3 shrink-0" />
                      <span className="font-medium text-sm">{getNavLabel(item.key)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            {/* User info in mobile sidebar when logged in */}
            {user && (
              <div className="p-6 border-t border-white/5 space-y-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.username}</p>
                    <p className="text-xs text-amber-400 font-extrabold">৳{user.balance?.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowDepositModal(true);
                  }}
                  className="w-full gold-gradient-btn py-2 rounded-full text-center text-sm font-bold tracking-wide shadow-lg"
                >
                  {t.DEPOSIT || "Deposit"}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs py-2 rounded-full hover:bg-white/5 transition-all font-semibold uppercase tracking-wider"
                >
                  <LogOut className="h-3.5 w-3.5" /> {t.LOGOUT || "Logout"}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* BEGIN: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* BEGIN: Header */}
        <header className="h-16 glass-header sticky top-0 z-30 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center flex-1 gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-full py-2 pl-10 pr-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-[#1e293b] transition-all" 
                placeholder={t.SEARCH_PLACEHOLDER || "Search"} 
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1e293b]/50 p-1 rounded-full border border-white/10">
              <button
                onClick={() => handleLanguageChange("BN")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  lang === "BN" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <BangladeshFlag /> BN
              </button>
              <button
                onClick={() => handleLanguageChange("EN")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  lang === "EN" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <USFlag /> EN
              </button>
            </div>
            
            <button className="text-slate-300 hover:text-white transition-colors relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2">
                  <Wallet className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">৳{user.balance?.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="gold-gradient-btn px-6 py-2 rounded-full font-semibold text-sm tracking-wide hidden sm:block"
                >
                  {t.DEPOSIT || "Deposit"}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white px-2"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/login" className="gold-gradient-btn px-4 sm:px-6 py-2 rounded-full font-semibold text-sm tracking-wide">
                  {t.LOGIN || "Login"}
                </Link>
                <Link href="/register" className="blue-gradient-btn px-4 sm:px-6 py-2 rounded-full font-semibold text-sm tracking-wide hidden sm:block">
                  {t.SIGNUP || "Sign Up"}
                </Link>
              </div>
            )}
          </div>
        </header>
        {/* END: Header */}

        {/* BEGIN: Main Scrollable Content */}
        {/* overflow-x-hidden ensures no horizontal page scrolling */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 z-10 space-y-6 min-w-0 max-w-full">
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
              {/* Inline style for marquee to ensure animation works reliably without arbitrary tailwind classes */}
              <p className="text-sm text-amber-100 whitespace-nowrap inline-block" style={{ animation: "marquee 20s linear infinite" }}>
                {settings.announcement || "New Crypto Deposit Bonus! 200% Match up to 5 BTC + 100 Free Spins!"} <span className="mx-8 text-white/20">|</span> {t.MARQUEE_LEADERBOARD || "Live Leaderboard Updated! Check Your Rank!"}
              </p>
            </div>
          </div>

          {activeNav === 'vip' ? (
            <div className="py-8">
              <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-[#0b1329] to-slate-900 border border-amber-500/30 p-8 md:p-12 relative overflow-hidden flex flex-col items-center text-center">
                <Crown className="w-20 h-20 text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{t.VIP_CLUB_TITLE || "VIP Club"}</h2>
                <p className="text-slate-300 max-w-2xl mb-8 leading-relaxed">
                  Join the elite PBBET VIP Club and unlock a world of exclusive benefits, higher limits, and a dedicated personal manager just for you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                  <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <User className="h-10 w-10 text-amber-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-bold text-white mb-2">{t.PERSONAL_MANAGER || "Personal Manager"}</h3>
                    <p className="text-sm text-slate-400">{t.PERSONAL_MANAGER_DESC || "24/7 dedicated support tailored to your needs."}</p>
                  </div>
                  <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <Zap className="h-10 w-10 text-amber-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-bold text-white mb-2">{t.HIGHER_LIMITS || "Higher Limits"}</h3>
                    <p className="text-sm text-slate-400">{t.HIGHER_LIMITS_DESC || "Enjoy increased withdrawal and betting limits."}</p>
                  </div>
                  <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <Gift className="h-10 w-10 text-amber-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-bold text-white mb-2">{t.EXCLUSIVE_EVENTS || "Exclusive Events"}</h3>
                    <p className="text-sm text-slate-400">{t.EXCLUSIVE_EVENTS_DESC || "Invitations to VIP-only tournaments and real-world events."}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeNav === 'promotions' ? (
            <div className="py-4">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Gift className="text-rose-500 h-6 w-6"/> {t.PROMOTIONS_TITLE || "Promotions"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-rose-600/90 to-rose-900 border border-white/10 card-hover flex flex-col justify-between min-h-[200px]">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">{t.LOBBY_CARD_VIP_CASHBACK || "VIP Cashback"}</h3>
                    <p className="text-sm text-rose-100/80 mb-6">{t.LOBBY_CARD_VIP_DESC || "200% Match up to 5 BTC + 100 Free Spins"}</p>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{t.READ_MORE || "Read More"}</button>
                  </div>
                  <Crown className="absolute -bottom-4 -right-4 h-32 w-32 text-rose-300 opacity-20" />
                </div>
                <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-blue-600/90 to-indigo-900 border border-white/10 card-hover flex flex-col justify-between min-h-[200px]">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">{t.LOBBY_CARD_RAFFLE || "Weekly Crypto Raffle"}</h3>
                    <p className="text-sm text-blue-100/80 mb-6">{t.LOBBY_CARD_RAFFLE_DESC || "Get the daily weekly crypto raffle"}</p>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{t.READ_MORE || "Read More"}</button>
                  </div>
                  <Bitcoin className="absolute -bottom-4 -right-4 h-32 w-32 text-blue-300 opacity-20" />
                </div>
                <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-slate-700/90 to-slate-900 border border-amber-500/30 card-hover flex flex-col justify-between min-h-[200px]">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-amber-400 mb-2">{t.LOBBY_CARD_TOURNAMENT || "High Roller Tournament"}</h3>
                    <p className="text-sm text-slate-300 mb-6">{t.LOBBY_CARD_TOURNAMENT_DESC || "Special offers for high roller tournaments"}</p>
                    <button className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-amber-500/50">{t.READ_MORE || "Read More"}</button>
                  </div>
                  <Trophy className="absolute -bottom-4 -right-4 h-32 w-32 text-amber-500 opacity-10" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Hero & Promo Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Hero Banner */}
                <div className="lg:col-span-6 xl:col-span-7 relative rounded-2xl overflow-hidden group card-hover min-h-[280px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent z-10 p-8 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight max-w-md">{t.HERO_TITLE || "THE ULTIMATE CRYPTO CASINO EXPERIENCE"}</h1>
                    <div>
                      {user ? (
                        <button
                          onClick={() => setCategory("slots")}
                          className="gold-gradient-btn px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                        >
                          {t.PLAY_NOW || "Claim Now"}
                        </button>
                      ) : (
                        <Link
                          href="/register"
                          className="gold-gradient-btn px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] inline-block"
                        >
                          {t.SIGNUP || "Claim Now"}
                        </Link>
                      )}
                    </div>
                  </div>
                  <img alt="Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjFThcWaQapjh4o8aL7LCv-70xeQLuO1jAiaGDQjPrpuEBQ67HSBopHhrfNqsQU6SathaRyRnXD0bDoIfZRVki3PCrlrUgazS4pvDVdsyg9A21JCghjG6d9XFv79G4wSE3yU34hvywc9_XP3XEullHWQw40wk48ypYE6CFzjF6FZtjRwvul0uvK_fM2gNyC6DMLh4xcMrb0avvg2d5fMbBfpInUp-X_AFYccrR1GvGpB8PwHdGWJW-U4tQFnZXCx3V2E3G8U2Hkq0" />
                </div>
                
                {/* Promo Tiles */}
                <div className="lg:col-span-6 xl:col-span-5 grid grid-cols-2 gap-4">
                  {/* Promo 1 */}
                  <div className="rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-rose-600 to-rose-900 border border-white/10 card-hover flex flex-col justify-between group">
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white mb-1">{t.LOBBY_CARD_VIP_CASHBACK || "VIP Cashback"}</h3>
                      <p className="text-xs text-rose-100/80">{t.LOBBY_CARD_VIP_DESC || "200% Match up to 5 BTC 100 free Spins"}</p>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                    <Crown className="absolute bottom-4 right-4 h-12 w-12 text-rose-300 opacity-50" />
                  </div>
                  
                  {/* Promo 2 */}
                  <div className="rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 border border-white/10 card-hover flex flex-col justify-between group">
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white mb-1">{t.LOBBY_CARD_RAFFLE || "Weekly Crypto Raffle"}</h3>
                      <p className="text-xs text-blue-100/80">{t.LOBBY_CARD_RAFFLE_DESC || "Get the daily weekly crypto raffle"}</p>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                    <Bitcoin className="absolute bottom-4 right-4 h-12 w-12 text-blue-300 opacity-50" />
                  </div>
                  
                  {/* Promo 3 */}
                  <div className="col-span-2 rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 card-hover flex flex-col justify-center group h-28">
                    <div className="relative z-10 flex justify-between items-center w-full">
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 mb-1">{t.LOBBY_CARD_TOURNAMENT || "High Roller Tournament"}</h3>
                        <p className="text-xs text-slate-300">{t.LOBBY_CARD_TOURNAMENT_DESC || "Offers for high roller tournament"}</p>
                      </div>
                      <Trophy className="h-10 w-10 text-amber-500 opacity-80 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>

              {/* Categories Navigation */}
              <div className="flex items-center gap-1 md:gap-3 overflow-hidden pb-4 pt-2 w-full max-w-full justify-between">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setCategory(cat.key);
                      setActiveNav(cat.key);
                      setShowMoreGames(false);
                    }}
                    className={`${!isSidebarCollapsed ? "px-2 py-1.5 text-[10px]" : "px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm"} rounded-full flex items-center justify-center gap-1 md:gap-2 font-medium whitespace-nowrap shrink min-w-0 flex-1 ${
                      state.selectedCategory === cat.key
                        ? "category-chip active"
                        : "category-chip bg-[#1e293b]/80 hover:bg-[#1e293b] text-slate-300"
                    }`}
                  >
                    <div className="shrink-0">{cat.icon}</div> <span className="truncate">{getCategoryLabel(cat.key)}</span>
                  </button>
                ))}

              </div>

              {/* Category Title */}
              <div className="mb-4 mt-2">
                <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                   {state.showFavoritesOnly ? (t.FAVORITES || "Favorites") : getCategoryLabel(state.selectedCategory)}
                </h2>
              </div>

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
                      setCategory("slots");
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
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-white/20 transition-colors"
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
            </>
          )}          {/* Section Indicator */}
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-8 h-1 rounded-full bg-amber-500"></div>
            <div className="w-8 h-1 rounded-full bg-white/20"></div>
          </div>

          {/* Bottom Section: Leaderboard & Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-12">
            {/* Leaderboard */}
            <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden">
              {/* Added overflow-x-auto wrapper around table to prevent clipping on small screens */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm min-w-[500px]">
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
          
          {/* Footer - preserving it as it was but matching styling */}
          <footer className="border-t border-white/5 pt-12 pb-8 mt-8">
            {/* Adjusted gap for responsive grids to prevent overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mb-10">
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

            {/* Copyright */}
            <div className="border-t border-white/5 pt-8 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          </footer>
        </main>
        {/* END: Main Scrollable Content */}
      </div>
      {/* END: Main Content Area */}

      {/* Deposit Modal */}
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
