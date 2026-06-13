"use client";

import React, { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Gamepad2,
  Cherry,
  Trophy,
  Gift,
  Crown,
  User as UserIcon,
  LogOut,
  Wallet,
  RefreshCw,
  Star,
  Dices,
  Spade,
  CircleDollarSign,
  X,
  Clock,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Shield,
  Anchor,
  Zap,
  Home,
  Search,
  Play,
  Heart,
  ChevronRight,
  ChevronLeft,
  Mail,
} from "lucide-react";

import { Footer } from "@/components/layout/footer/Footer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Toast } from "@/components/ui/Toast";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useGameStore } from "@/contexts/GameStoreContext";
import { useFilteredGames } from "@/hooks/useFilteredGames";
import { Banners } from "../banners/Banners";
import { logClientAction } from "@/lib/logger";

import { escapeHtml } from "@/utils/security";
import { TOAST_DURATION, TRANSLATIONS } from "@/constants";
import { Game, Category } from "@/types/game";
import { createFavoriteMessage } from "@/utils/helpers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

// ─── Types for Live Leaderboard and Bet History ──────────────────────────────
interface BetLog {
  id: string;
  game: string;
  user: string;
  time: string;
  amount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
}

interface PlayerTransaction {
  id: string | number;
  type: string;
  createdAt: string;
  amount: number;
  status: string;
}

interface SportsMatch {
  id: number;
  home: string;
  away: string;
  league: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  date: string;
}

interface SelectedSportsBet {
  match: SportsMatch;
  choice: "Home" | "Draw" | "Away";
  team: string;
  odds: number;
}

const CasinoGameLobby: React.FC = () => {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    balance: number | string;
  } | null>(null);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [dynamicEvents, setDynamicEvents] = useState<{ id: number; title: string; imageUrl: string; linkUrl: string | null }[]>([]);
  const [policyModal, setPolicyModal] = useState<{ isOpen: boolean; title: string; contentKey: string } | null>(null);
  const [policyContent, setPolicyContent] = useState("");
  const [policyLoading, setPolicyLoading] = useState(false);

  // Premium Modals and Widget States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState<PlayerTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [promotionsModalOpen, setPromotionsModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  const [sportsModalOpen, setSportsModalOpen] = useState(false);
  const [sportsWager, setSportsWager] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<SelectedSportsBet | null>(null);
  const [sportsSelectedCategory, setSportsSelectedCategory] = useState<string>("All");
  const [detailedMatchView, setDetailedMatchView] = useState<any | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "bot"; text: string; time: string }[]>([
    { sender: "bot", text: "Welcome to PBBET 24/7 Live Support! How can I assist you today? (e.g. ask about deposits, withdrawals, KYC status, or RTP updates)", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [userChatMessage, setUserChatMessage] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"EN" | "BN">("BN");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Simulated live leaderboards / bets state
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"recent" | "high" | "personal">("recent");
  const [liveBets, setLiveBets] = useState<BetLog[]>([]);
  const [highRollers, setHighRollers] = useState<BetLog[]>([]);
  const [personalBets, setPersonalBets] = useState<BetLog[]>([]);

  const {
    state,
    hasActiveFilters,
    setSearchTerm,
    setCategory,
    toggleFavoritesOnly,
    clearFilters,
  } = useGameStore();

  const { favorites, toggleFavorite } = useFavoritesContext();
  const filteredGames = useFilteredGames();
  const [visibleCount, setVisibleCount] = useState(12);

  const refreshBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${BACKEND_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to refresh balance", err);
    }
  }, []);

  const fetchPersonalBets = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${BACKEND_URL}/user/transactions?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const mappedLogs: BetLog[] = data.data.map((tx: any) => {
          const isWin = tx.amount > 0;
          return {
            id: tx.transactionCode || String(tx.id),
            game: tx.type,
            user: user?.username || "Player",
            time: new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            amount: Math.abs(tx.amount),
            multiplier: tx.type === "WIN" ? 1 : 0,
            payout: (tx.type === "WIN" || tx.type === "DEPOSIT") ? Math.abs(tx.amount) : 0,
            isWin,
          };
        });
        setPersonalBets(mappedLogs);
      }
    } catch (err) {
      console.error("Failed to fetch personal bets", err);
    }
  }, [user?.username]);

  // Fetch these logs when activeLeaderboardTab === "personal"
  useEffect(() => {
    if (activeLeaderboardTab === "personal") {
      fetchPersonalBets();
    }
  }, [activeLeaderboardTab, fetchPersonalBets]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setToastMessage("Please enter a valid amount");
      setShowToast(true);
      return;
    }
    setDepositing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setToastMessage("Authorization token not found");
        setShowToast(true);
        setDepositing(false);
        return;
      }
      const res = await fetch(`${BACKEND_URL}/user/deposit-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage("Deposit request submitted! Waiting for admin approval.");
        setShowToast(true);
        setDepositModalOpen(false);
        setDepositAmount("");
        // Trigger a refresh of personal logs
        fetchPersonalBets();
      } else {
        setToastMessage(data.message || "Failed to submit deposit request");
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
      setToastMessage("Error submitting deposit request");
      setShowToast(true);
    } finally {
      setDepositing(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        refreshBalance();
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, [refreshBalance]);

  // Seed initial simulated bets
  useEffect(() => {
    const gamesList = ["Sweet Bonanza", "Gates of Olympus", "Plinko", "Dice", "Blackjack", "Roulette", "Crazy Time", "Limbo"];
    const usersList = ["shane_w", "lucky_jack", "whale_99", "betting_pro", "spin_master", "vip_player", "zero_cool", "oroplay_fan"];

    const generateRandomBet = (isHighRoller = false): BetLog => {
      const amt = isHighRoller
        ? Math.floor(Math.random() * 4500) + 500
        : Math.floor(Math.random() * 90) + 10;
      const mult = parseFloat((Math.random() * 4.9 + 0.1).toFixed(2));
      const isWin = Math.random() > 0.45;
      const pay = isWin ? parseFloat((amt * mult).toFixed(2)) : 0;
      return {
        id: Math.random().toString(36).substring(2, 9),
        game: gamesList[Math.floor(Math.random() * gamesList.length)],
        user: usersList[Math.floor(Math.random() * usersList.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        amount: amt,
        multiplier: isWin ? mult : 0,
        payout: pay,
        isWin,
      };
    };

    const initialBets = Array.from({ length: 6 }, () => generateRandomBet());
    const initialHigh = Array.from({ length: 6 }, () => generateRandomBet(true));
    setLiveBets(initialBets);
    setHighRollers(initialHigh);

    const interval = setInterval(() => {
      setLiveBets((prev) => [generateRandomBet(), ...prev.slice(0, 7)]);
      if (Math.random() > 0.6) {
        setHighRollers((prev) => [generateRandomBet(true), ...prev.slice(0, 7)]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const handlePlay = useCallback(
    async (gameId: string) => {
      const game = state.games.find((g) => g.id === gameId);
      if (!game) return;

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const vendorCode = (game as any).vendorCode || "";
      const gameCode = (game as any).gameCode || game.id;

      setToastMessage(`Launching ${game.name}...`);
      setShowToast(true);

      const gameWin = window.open("about:blank", "_blank");
      if (gameWin) {
        gameWin.document.title = `Loading ${game.name}...`;
        gameWin.document.body.style.backgroundColor = "#f8fafc";
        gameWin.document.body.style.color = "#0f172a";
        gameWin.document.body.style.display = "flex";
        gameWin.document.body.style.flexDirection = "column";
        gameWin.document.body.style.justifyContent = "center";
        gameWin.document.body.style.alignItems = "center";
        gameWin.document.body.style.height = "100vh";
        gameWin.document.body.style.margin = "0";
        gameWin.document.body.style.fontFamily = 'system-ui, sans-serif';
        gameWin.document.body.innerHTML = `
          <div class="spinner" style="border: 4px solid rgba(59, 130, 246, 0.1); width: 48px; height: 48px; border-radius: 50%; border-left-color: #3b82f6; animation: spin 1s linear infinite; margin-bottom: 24px;"></div>
          <div style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #3b82f6;">Launching ${game.name}...</div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
      }

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
          if (gameWin) gameWin.location.href = data.launchUrl;
        } else {
          setToastMessage(`Error: ${data.message || "Failed to launch game"}`);
          if (gameWin) gameWin.close();
        }
      } catch (err) {
        setToastMessage("Error launching game");
        if (gameWin) gameWin.close();
      }
    },
    [state.games, router]
  );

  const handleToggleFavorite = useCallback(
    (gameId: string) => {
      const game = state.games.find((g) => g.id === gameId);
      toggleFavorite(gameId);
      if (game) {
        const wasFavorite = favorites.includes(gameId);
        setToastMessage(createFavoriteMessage(game.name, !wasFavorite));
        setShowToast(true);
      }
    },
    [state.games, favorites, toggleFavorite]
  );

  const isCategoryActive = useCallback((value: string) => {
    if (value === "favorites") return state.showFavoritesOnly;
    return state.selectedCategory === value;
  }, [state.showFavoritesOnly, state.selectedCategory]);

  const categoryChips = [
    { label: currentLanguage === "BN" ? "গরম খেলা" : "Hot Games", icon: <LayoutDashboard size={18} />, value: "all" },
    { label: currentLanguage === "BN" ? "ক্যাসিনো" : "Casino", icon: <Gamepad2 size={18} />, value: "live" },
    { label: currentLanguage === "BN" ? "স্লট" : "Slot", icon: <Cherry size={18} />, value: "slots" },
    { label: currentLanguage === "BN" ? "মেগাওয়েজ" : "Megaways", icon: <Sparkles size={18} />, value: "megaways" },
    { label: currentLanguage === "BN" ? "কার্ড গেম" : "Card Games", icon: <Spade size={18} />, value: "cards" },
    { label: currentLanguage === "BN" ? "টেবিল" : "Table", icon: <Spade size={18} />, value: "table" },
    { label: currentLanguage === "BN" ? "ফিসিং" : "Fishing", icon: <Anchor size={18} />, value: "fishing" },
    { label: currentLanguage === "BN" ? "ক্র্যাশ" : "Crash", icon: <Zap size={18} />, value: "crash" },
    { label: currentLanguage === "BN" ? "লটারি" : "Lottery", icon: <Dices size={18} />, value: "lottery" },
    { label: currentLanguage === "BN" ? "আর্কেড" : "Arcade", icon: <Crown size={18} />, value: "arcade" },
    { label: currentLanguage === "BN" ? "প্রমোশন" : "Promotions", icon: <Gift size={18} />, value: "promotions" },
    { label: currentLanguage === "BN" ? "ভিআইপি" : "VIP", icon: <Crown size={18} />, value: "vip" },
    { label: currentLanguage === "BN" ? "প্রিয়" : "Favorites", icon: <Star size={18} />, value: "favorites" },
  ];

  const currentLeaderboardList = useMemo(() => {
    if (activeLeaderboardTab === "recent") return liveBets;
    if (activeLeaderboardTab === "high") return highRollers;
    return personalBets;
  }, [activeLeaderboardTab, liveBets, highRollers, personalBets]);

  if (state.isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-inter overflow-hidden">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center shadow-md">
              <Dices size={24} className="text-white animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#3b82f6] leading-none uppercase">PBBET</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Premium iGaming</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setCurrentLanguage("BN")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${currentLanguage === "BN" ? "bg-[#3b82f6] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <span>🇧🇩</span> বাংলা
              </button>
              <button 
                onClick={() => setCurrentLanguage("EN")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${currentLanguage === "EN" ? "bg-[#3b82f6] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <span>🇺🇸</span> EN
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setChatOpen(true)} className="p-2.5 rounded-xl border border-slate-200 text-emerald-600 hover:bg-slate-100 transition-all cursor-pointer"><MessageSquare size={15} /></button>
              <button onClick={() => setFaqModalOpen(true)} className="p-2.5 rounded-xl border border-slate-200 text-blue-600 hover:bg-slate-100 transition-all cursor-pointer"><HelpCircle size={15} /></button>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100">
                    <Wallet size={14} className="text-[#3b82f6]" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">{currentLanguage === "BN" ? "ব্যালেন্স" : "Balance"}</span>
                      <span className="text-xs font-extrabold text-slate-800">${user.balance}</span>
                    </div>
                  </div>
                  <button onClick={() => setDepositModalOpen(true)} className="px-4 py-2.5 rounded-[5px] text-xs font-extrabold text-white blue-gradient-btn uppercase">
                    {currentLanguage === "BN" ? "ডিপোজিট" : "Deposit"}
                  </button>
                  <button onClick={handleLogout} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-[#3b82f6] transition-all cursor-pointer"><LogOut size={16} /></button>
                </div>
              ) : (
                <>
                  <button onClick={() => router.push("/login")} className="px-4 py-2.5 rounded-[5px] text-xs font-extrabold text-white bg-gradient-to-br from-[#1d4ed8] via-[#3b82f6] to-[#1d4ed8] shadow-lg hover:brightness-110 active:scale-95 transition-all">
                    {currentLanguage === "BN" ? "লগইন" : "Login"}
                  </button>
                  <button onClick={() => router.push("/register")} className="px-4 py-2.5 rounded-[5px] text-xs font-extrabold text-black bg-gradient-to-br from-[#f59e0b] via-[#fcd34d] to-[#f59e0b] shadow-lg hover:brightness-110 active:scale-95 transition-all">
                    {currentLanguage === "BN" ? "নিবন্ধন" : "Sign Up"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-row min-w-0 w-full relative h-[calc(100vh-4rem)]">
        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:block shrink-0 bg-slate-50 border-r border-slate-200 sticky top-0 h-full overflow-y-auto transition-all duration-300 w-64 p-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-3">
              <span className="text-lg font-black tracking-widest bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent select-none animate-pulse">PBBET</span>
              <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="p-1.5 rounded-[5px] border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center w-8 h-8 font-extrabold text-sm">❮</button>
            </div>

            <nav className="space-y-1">
              {categoryChips.filter(c => c.value !== "promotions" && c.value !== "vip").map(({ label, icon, value }) => {
                const active = isCategoryActive(value);
                return (
                  <button
                    key={value}
                    onClick={() => {
                      if (value === "favorites") {
                        if (!state.showFavoritesOnly) toggleFavoritesOnly();
                      } else {
                        if (state.showFavoritesOnly) toggleFavoritesOnly();
                        setCategory(value as Category);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${active ? "bg-blue-600/15 text-[#3b82f6] border-l-4 border-[#f59e0b]" : "text-slate-600 border-l-4 border-transparent hover:bg-slate-100 hover:text-slate-800"}`}
                  >
                    <span className={active ? "text-blue-600" : "text-slate-500"}>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Marquee */}
          <section className="px-4 sm:px-6 lg:px-8 py-2.5 bg-slate-50 border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50/20 via-slate-100/50 to-slate-100/20 border border-slate-200 backdrop-blur-md">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3b82f6] text-white text-[10px] font-bold uppercase tracking-widest shrink-0 shadow-md animate-pulse">
                {currentLanguage === "BN" ? "বিজ্ঞপ্তি" : "Notice"}
              </span>
              <div className="marquee-container text-xs text-slate-700 font-semibold overflow-hidden">
                <div className="marquee-content whitespace-nowrap">
                  {currentLanguage === "BN" ? "📲 এক্সক্লুসিভ ৫০০ টাকা পুরস্কার পেতে অ্যাপে আসুন! আজই ডাউনলোড করুন! 💰 \u00A0\u00A0\u00A0\u00A0\u00A0 🚀 নতুন ভিআইপি লেভেল আনলক করা হয়েছে! 🚀" : "📲 Come to the app to get an exclusive 500 BDT reward! Download today! 💰 \u00A0\u00A0\u00A0\u00A0\u00A0 🚀 New VIP levels unlocked! 🚀"}
                </div>
              </div>
            </div>
          </section>

          {/* Banners */}
          <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <Banners />
          </section>

          {/* Promo Tiles */}
          <section className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#9F1239] text-white p-8 lg:p-10 shadow-lg flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:shadow-xl group">
                <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800')] bg-cover bg-center mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                    <Sparkles size={11} className="text-[#F59E0B]" />
                    {currentLanguage === "BN" ? "সক্রিয় ইভেন্ট" : "Active Event Promo"}
                  </span>
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tight mb-3 uppercase">{currentLanguage === "BN" ? "উইকেন্ড ক্র্যাশ রেস" : "WEEKEND CRASH RACE"}</h2>
                  <p className="text-white/80 text-xs sm:text-sm max-w-md leading-relaxed">{currentLanguage === "BN" ? "পুরস্কার জিতুন এবং বাজি বাড়ান। এই লাইভ লবি ইভেন্টে লিডারবোর্ড পয়েন্ট সুরক্ষিত করতে বাজি ধরুন।" : "Earn rewards and boost wagers. Wager to secure leaderboard points on this live lobby event."}</p>
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6">
                  <button onClick={() => setPromotionsModalOpen(true)} className="px-6 py-2.5 rounded-xl font-extrabold text-slate-800 bg-white hover:bg-slate-50 text-xs shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">{currentLanguage === "BN" ? "ইভেন্ট দেখুন" : "Explore Event"}</button>
                  <div className="text-xs text-white/85 font-semibold flex items-center gap-1"><Clock size={12} /> {currentLanguage === "BN" ? "লাইভ ইভেন্ট" : "Live Event"}</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] text-white p-8 lg:p-10 shadow-lg flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:shadow-xl group">
                <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800')] bg-cover bg-center mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                    <Sparkles size={11} className="text-[#F59E0B]" />
                    {currentLanguage === "BN" ? "এক্সক্লুসিভ অফার" : "Exclusive Offer"}
                  </span>
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tight mb-3 uppercase">{currentLanguage === "BN" ? "স্বাগতম বোনাস ২০০%" : "WELCOME BONUS 200%"}</h2>
                  <p className="text-white/80 text-xs sm:text-sm max-w-md leading-relaxed">{currentLanguage === "BN" ? "আপনার প্রথম ডিপোজিটে পান ২০০% বোনাস এবং পিবিবেট-এ আপনার যাত্রা শুরু করুন।" : "Make your first deposit and get an instant 200% boost to start your journey at PBBET."}</p>
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6">
                  <button onClick={() => setDepositModalOpen(true)} className="px-6 py-2.5 rounded-xl font-extrabold text-slate-800 bg-white hover:bg-slate-50 text-xs shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">{currentLanguage === "BN" ? "দ্রুত ডিপোজিট" : "Quick Deposit"}</button>
                  <div className="text-xs text-white/85 font-semibold flex items-center gap-1"><Zap size={12} className="text-gold" /> {currentLanguage === "BN" ? "চলমান" : "Ongoing"}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Category Navigation */}
          <section className="px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryChips.filter(c => ["all", "live", "slots", "table", "fishing", "lottery", "arcade", "crash", "favorites"].includes(c.value)).map(({ label, icon, value }) => {
                const active = isCategoryActive(value);
                return (
                  <button
                    key={value}
                    onClick={() => {
                      if (value === "favorites") {
                        if (!state.showFavoritesOnly) toggleFavoritesOnly();
                      } else {
                        if (state.showFavoritesOnly) toggleFavoritesOnly();
                        setCategory(value as Category);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all duration-300 border cursor-pointer ${active ? "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-600/20 scale-[1.02]" : "bg-slate-100 text-slate-600 border-slate-200 hover:border-blue-500/30 hover:text-slate-800"}`}
                  >
                    <span className={active ? "text-white" : "text-slate-500"}>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Game Grid Container */}
          <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-10 space-y-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={state.searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={currentLanguage === "BN" ? "গেম বা প্রোভাইডার খুঁজুন..." : "Find games or providers..."}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all placeholder-slate-500 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-6 rounded-full bg-[#2563EB]" />
                {state.showFavoritesOnly ? (currentLanguage === "BN" ? "প্রিয় গেম" : "Favorite Games") : (currentLanguage === "BN" ? "গরম খেলা" : "Hot Games")}
              </h3>
              <span className="text-xs bg-slate-100 text-[#3b82f6] border border-slate-200 font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">
                {filteredGames.length} {currentLanguage === "BN" ? "টি গেম উপলব্ধ" : "Games Available"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredGames.slice(0, visibleCount).map((game) => (
                <div 
                  key={game.id} 
                  onClick={() => handlePlay(game.id)}
                  className="glass-panel rounded-xl overflow-hidden border border-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-blue-200/50 group cursor-pointer relative"
                >
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img src={game.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={game.name} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-[#3b82f6] text-white p-3.5 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(game.id); }}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all z-20 ${favorites.includes(game.id) ? "bg-rose-500 text-white" : "bg-black/40 text-white/70 hover:text-white"}`}
                    >
                      <Heart size={14} className={favorites.includes(game.id) ? "fill-white" : ""} />
                    </button>
                  </div>
                  <div className="p-3 bg-slate-50">
                    <div className="text-[11px] font-black truncate uppercase text-slate-800 tracking-wide">{game.name}</div>
                    <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase">{(game as any).vendorCode || "PROVIDER"}</div>
                  </div>
                </div>
              ))}
            </div>

            {filteredGames.length > visibleCount && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-12 py-3.5 bg-slate-100 text-[#3b82f6] rounded-2xl font-black text-xs uppercase border border-slate-200 hover:bg-[#3b82f6] hover:text-white hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 cursor-pointer"
                >
                  {currentLanguage === "BN" ? "আরো গেম দেখুন" : "Show More Games"}
                </button>
              </div>
            )}
          </section>

          {/* Leaderboard */}
          <section className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-100/50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-[#2563EB]" />
                    {currentLanguage === "BN" ? "লাইভ প্ল্যাটফর্ম অ্যাক্টিভিটি" : "Live Platform Activity"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Realtime wagers generated by OroPlay API integrations</p>
                </div>
                <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl">
                  {["recent", "high", "personal"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveLeaderboardTab(tab as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeLeaderboardTab === tab ? "bg-[#2563EB] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      {tab === "recent" ? (currentLanguage === "BN" ? "সাম্প্রতিক" : "Recent") : tab === "high" ? (currentLanguage === "BN" ? "হাই রোলার" : "High Rollers") : (currentLanguage === "BN" ? "আমার লগ" : "My Logs")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-5 px-6 uppercase">Game</th>
                        <th className="py-5 px-6 uppercase">Player Account</th>
                        <th className="py-5 px-6 uppercase">Timestamp</th>
                        <th className="py-5 px-6 text-right uppercase">Wager Amount</th>
                        <th className="py-5 px-6 text-center uppercase">Multiplier</th>
                        <th className="py-5 px-6 text-right uppercase">Payout Cash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 font-semibold">
                      {currentLeaderboardList.map((bet) => (
                        <tr key={bet.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4.5 px-6 font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {bet.game}
                          </td>
                          <td className="py-4.5 px-6 text-slate-500 font-mono">{bet.user.length > 8 ? bet.user.substring(0, 5) + "***" + bet.user.slice(-2) : bet.user}</td>
                          <td className="py-4.5 px-6 text-slate-500 font-normal">{bet.time}</td>
                          <td className="py-4.5 px-6 text-right">${bet.amount.toFixed(2)}</td>
                          <td className="py-4.5 px-6 text-center">
                            {bet.isWin ? (
                               <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">{bet.multiplier}x</span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className={`py-4.5 px-6 text-right font-extrabold ${bet.isWin ? "text-emerald-600" : "text-slate-500"}`}>
                            {bet.isWin ? `+$${bet.payout.toFixed(2)}` : "$0.00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-100 px-6 py-3.5 text-center border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Shield size={12} className="text-emerald-500" />
                    RNG CERTIFIED ORACLE PAYOUTS & FAIR PLAY GUARANTEED
                  </span>
                </div>
              </div>
            </div>
          </section>

          <Footer lang={currentLanguage} onOpenPolicy={(title, key) => setPolicyModal({ isOpen: true, title, contentKey: key })} />
        </main>
      </div>

      <Toast message={toastMessage} isVisible={showToast} onHide={() => setShowToast(false)} duration={TOAST_DURATION} />

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Wallet size={20} className="text-[#2563EB]" /> Deposit Request</h3>
              <button onClick={() => setDepositModalOpen(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={depositAmount}
                  disabled={depositing}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Minimum $10"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button type="submit" disabled={depositing} className="w-full py-3.5 rounded-xl font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all cursor-pointer disabled:opacity-50">
                {depositing ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Help Center</h3>
              <button onClick={() => setFaqModalOpen(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-4 text-sm text-slate-500">
              <p>For any inquiries, please contact our 24/7 support via the message icon in the header.</p>
              <p>All deposits and withdrawals are processed within 5-15 minutes after approval.</p>
            </div>
            <button onClick={() => setFaqModalOpen(false)} className="mt-6 w-full py-3 rounded-xl font-bold bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 transition-all cursor-pointer">Close</button>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-[100] w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Support</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-semibold">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1">{msg.time}</span>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!userChatMessage.trim()) return;
            const msg = userChatMessage;
            setChatMessages(p => [...p, { sender: "user", text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            setUserChatMessage("");
            setTimeout(() => {
              setChatMessages(p => [...p, { sender: "bot", text: "Thank you for your message. An agent will be with you shortly.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }, 1000);
          }} className="p-4 border-t border-slate-200 bg-slate-50">
            <input
              type="text"
              value={userChatMessage}
              onChange={(e) => setUserChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default CasinoGameLobby;
