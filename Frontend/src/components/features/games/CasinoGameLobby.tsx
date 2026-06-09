"use client";

import React, { useCallback, useState, useEffect } from "react";
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
  Menu,
  X,
  Clock,
  Sparkles,
  Flame,
  MessageSquare,
  HelpCircle,
  Shield,
} from "lucide-react";

import { Footer } from "@/components/layout/footer/Footer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Toast } from "@/components/ui/Toast";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useGameStore } from "@/contexts/GameStoreContext";
import { useFilteredGames } from "@/hooks/useFilteredGames";
import { FilterControls } from "../filters/FilterControls";
import { SearchBar } from "../search/SearchBar";
import { GameGrid } from "./GameGrid";
import { Banners } from "../banners/Banners";

import { TOAST_DURATION } from "@/constants";
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

// ─── Floating decoration SVGs ────────────────────────────────────────────────
const FloatingDice = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="4" width="40" height="40" rx="8" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
    <circle cx="14" cy="14" r="3" fill="white" fillOpacity="0.8" />
    <circle cx="24" cy="24" r="3" fill="white" fillOpacity="0.8" />
    <circle cx="34" cy="34" r="3" fill="white" fillOpacity="0.8" />
    <circle cx="34" cy="14" r="3" fill="white" fillOpacity="0.8" />
    <circle cx="14" cy="34" r="3" fill="white" fillOpacity="0.8" />
  </svg>
);

const FloatingCard = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 36 52"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="32" height="48" rx="5" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />
    <text x="8" y="22" fontSize="14" fill="white" fillOpacity="0.7" fontFamily="serif">♠</text>
    <text x="8" y="42" fontSize="14" fill="white" fillOpacity="0.7" fontFamily="serif">A</text>
  </svg>
);

const FloatingChip = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 52 52"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="26" cy="26" r="24" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
    <circle cx="26" cy="26" r="17" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 3" />
    <circle cx="26" cy="26" r="8" fill="white" fillOpacity="0.15" />
  </svg>
);

// ─── Category quick-link chip ─────────────────────────────────────────────────
interface CategoryChipProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}
const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  icon,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 select-none ${
      active
        ? "bg-[#E11D48] text-white shadow-lg shadow-[#E11D48]/25"
        : "bg-white text-slate-600 border border-slate-200 hover:border-[#E11D48]/40 hover:text-[#E11D48]"
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────
const CasinoGameLobby: React.FC = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    balance: number | string;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [dynamicEvents, setDynamicEvents] = useState<{ id: number; title: string; imageUrl: string; linkUrl: string | null }[]>([]);
  const router = useRouter();

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

  // Fetch dynamic banner promo events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/user/banners`);
        const data = await res.json();
        if (res.ok && data.success) {
          // Banners WITH title config are custom events
          const customEvents = (data.data || []).filter((b: { title: string | null }) => b.title);
          setDynamicEvents(customEvents);
        }
      } catch (err) {
        console.error("Failed to load events list", err);
      }
    };
    fetchEvents();
  }, []);

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

    // Initialize list
    const initialBets = Array.from({ length: 6 }, () => generateRandomBet());
    const initialHigh = Array.from({ length: 6 }, () => generateRandomBet(true));
    setLiveBets(initialBets);
    setHighRollers(initialHigh);

    // Set interval to update bets dynamically (every 4 seconds)
    const interval = setInterval(() => {
      setLiveBets((prev) => {
        const nextBet = generateRandomBet();
        return [nextBet, ...prev.slice(0, 7)];
      });

      // High Roller occasionally
      if (Math.random() > 0.6) {
        setHighRollers((prev) => {
          const nextHigh = generateRandomBet(true);
          return [nextHigh, ...prev.slice(0, 7)];
        });
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

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      showToastMessage("Please enter a valid deposit amount.");
      return;
    }

    setDepositing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/user/deposit-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) {
        showToastMessage("Deposit request submitted successfully! Pending admin approval.");
        setDepositModalOpen(false);
        setDepositAmount("");
        refreshBalance();
      } else {
        showToastMessage(`Error: ${data.message || "Failed to submit deposit"}`);
      }
    } catch {
      showToastMessage("Error submitting deposit request");
    } finally {
      setDepositing(false);
    }
  };

  const { favorites, favoritesCount, toggleFavorite } = useFavoritesContext();
  const filteredGames = useFilteredGames();

  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handlePlay = useCallback(
    async (gameId: string) => {
      const game = state.games.find((g) => g.id === gameId);
      if (game) {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        showToastMessage(`Launching ${game.name}...`);
        try {
          const res = await fetch(`${BACKEND_URL}/user/launch`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              vendorCode:
                (game as Game & { vendorCode: string }).vendorCode || "",
              gameCode: game.id,
            }),
          });
          const data = await res.json();
          if (res.ok && data.launchUrl) {
            // Track in personal bets history mock
            const betAmt = Math.floor(Math.random() * 40) + 10;
            const mult = parseFloat((Math.random() * 3.5 + 0.2).toFixed(2));
            const isWin = Math.random() > 0.5;
            const pay = isWin ? parseFloat((betAmt * mult).toFixed(2)) : 0;
            const newPersonal: BetLog = {
              id: Math.random().toString(36).substring(2, 9),
              game: game.name,
              user: user?.username || "You",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              amount: betAmt,
              multiplier: isWin ? mult : 0,
              payout: pay,
              isWin,
            };
            setPersonalBets((prev) => [newPersonal, ...prev]);

            window.open(data.launchUrl, "_blank");
          } else {
            showToastMessage(
              `Error: ${data.message || "Failed to launch game"}`
            );
          }
        } catch {
          showToastMessage("Error launching game");
        }
      }
    },
    [showToastMessage, state.games, router, user]
  );

  const handleToggleFavorite = useCallback(
    (gameId: string) => {
      const game = state.games.find((g) => g.id === gameId);
      const wasFavorite = favorites.includes(gameId);
      toggleFavorite(gameId);
      if (game) {
        showToastMessage(createFavoriteMessage(game.name, !wasFavorite));
      }
    },
    [toggleFavorite, favorites, showToastMessage, state.games]
  );

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  const navItems = [
    { name: "Lobby Dashboard", icon: <LayoutDashboard size={18} />, view: "dashboard" },
    { name: "Live Casino", icon: <Gamepad2 size={18} />, view: "live" },
    { name: "Slots", icon: <Cherry size={18} />, view: "slots" },
    { name: "Sports Betting", icon: <Trophy size={18} />, view: "sports" },
    { name: "Promotions & Offers", icon: <Gift size={18} />, view: "promotions" },
    { name: "VIP Club Rewards", icon: <Crown size={18} />, view: "vip" },
    { name: "My Profile Account", icon: <UserIcon size={18} />, view: "account" },
  ];

  const handleNavItemClick = (item: typeof navItems[0]) => {
    if (item.view === "dashboard") {
      setCategory("all");
      if (state.showFavoritesOnly) toggleFavoritesOnly();
    } else if (item.view === "live") {
      setCategory("live");
      if (state.showFavoritesOnly) toggleFavoritesOnly();
    } else if (item.view === "slots") {
      setCategory("slots");
      if (state.showFavoritesOnly) toggleFavoritesOnly();
    } else if (item.view === "sports") {
      showToastMessage("Sports Betting integration is coming soon!");
    } else if (item.view === "promotions") {
      showToastMessage("Dynamic promotions and signup bonuses will be announced shortly!");
    } else if (item.view === "vip") {
      showToastMessage("VIP Rewards club is under construction. Keep playing to earn loyalty points!");
    } else if (item.view === "account") {
      if (user) {
        showToastMessage(`Logged in as: ${user.username} | Status: Active | KYC Approved`);
      } else {
        router.push("/login");
      }
    }
  };

  const isItemActive = (view: string) => {
    if (state.showFavoritesOnly) return false;
    if (view === "dashboard" && state.selectedCategory === "all") return true;
    if (view === "live" && state.selectedCategory === "live") return true;
    if (view === "slots" && state.selectedCategory === "slots") return true;
    return false;
  };

  const categoryChips: {
    label: string;
    icon: React.ReactNode;
    value: Category | "favorites";
  }[] = [
    { label: "All Games", icon: <Dices size={14} />, value: "all" },
    { label: "Live Casino", icon: <Gamepad2 size={14} />, value: "live" },
    { label: "Slots", icon: <Cherry size={14} />, value: "slots" },
    { label: "Table Games", icon: <Spade size={14} />, value: "table" },
    {
      label: `Favorites (${favoritesCount})`,
      icon: <Star size={14} />,
      value: "favorites",
    },
  ];

  const activeChip = state.showFavoritesOnly
    ? "favorites"
    : state.selectedCategory;

  const currentLeaderboardList =
    activeLeaderboardTab === "recent"
      ? liveBets
      : activeLeaderboardTab === "high"
      ? highRollers
      : personalBets;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#FFF5F5] text-[#0F172A]">
      {/* ── SLEEK SIDEBAR NAVIGATION (STAKE STYLE) ───────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-slate-100 shadow-sm sticky top-0 h-screen z-20 transition-all duration-300">
        {/* Logo */}
        <div className="px-6 pt-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#FB7185] flex items-center justify-center shadow-md">
              <Dices size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-[#E11D48] leading-none">
                PBBET
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Next-Gen Casino
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links Grouped */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Main Games Categories */}
          <div>
            <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Casino Navigation
            </span>
            <div className="space-y-1">
              {navItems.slice(0, 3).map((item) => {
                const active = isItemActive(item.view);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavItemClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-[#E11D48]/10 text-[#E11D48] border-l-4 border-[#E11D48]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                    }`}
                  >
                    <span className={active ? "text-[#E11D48]" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Socials & VIP */}
          <div>
            <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Rewards & Sports
            </span>
            <div className="space-y-1">
              {navItems.slice(3).map((item) => {
                const active = isItemActive(item.view);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavItemClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-[#E11D48]/10 text-[#E11D48] border-l-4 border-[#E11D48]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                    }`}
                  >
                    <span className={active ? "text-[#E11D48]" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Support shortcut */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => showToastMessage("24/7 Live Agent Chat is currently online. Contacting operator...")}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
            >
              <MessageSquare size={16} className="text-emerald-500" />
              Live Casino Support
            </button>
            <button
              onClick={() => showToastMessage("Opening help center guides...")}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer"
            >
              <HelpCircle size={16} className="text-[#2563EB]" />
              Help & FAQ Info
            </button>
          </div>
        </div>

        {/* User profile card or login container at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {user ? (
            <div className="space-y-3">
              {/* Wallet Info */}
              <div className="rounded-2xl bg-gradient-to-br from-[#F59E0B]/10 via-amber-50 to-[#F59E0B]/5 border border-amber-100 p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <CircleDollarSign size={15} className="text-[#F59E0B]" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Wallet Gold Card
                    </span>
                  </div>
                  <span className="text-[9px] bg-[#F59E0B]/20 text-[#D97706] font-bold px-1.5 py-0.5 rounded-full">
                    VIP GOLD
                  </span>
                </div>
                <div className="text-lg font-extrabold text-[#0F172A] flex items-baseline gap-1">
                  ${user.balance}
                  <span className="text-[10px] font-normal text-slate-400">USD</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-100/50">
                  <button
                    onClick={refreshBalance}
                    className="flex items-center gap-1 text-[11px] text-[#F59E0B] hover:text-[#E11D48] font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw size={11} className="animate-[spin_10s_linear_infinite]" />
                    Sync balance
                  </button>
                </div>
              </div>
              
              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-[#E11D48] border border-slate-100 hover:border-rose-100 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                Disconnect Session
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#E11D48] text-white hover:bg-[#BE123C] transition-colors shadow-md shadow-[#E11D48]/10 cursor-pointer"
              >
                <UserIcon size={15} />
                Access Dashboard
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* ── GLASSMORPHIC TOP HEADER ────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
            
            {/* Left: Mobile Menu Trigger + Categories Tab Bar */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="lg:hidden flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E11D48] to-[#FB7185] flex items-center justify-center shadow-md">
                  <Dices size={16} className="text-white" />
                </div>
                <span className="text-xl font-extrabold text-[#E11D48] tracking-tight">
                  PBBET
                </span>
              </div>

              {/* Horizontal Tabs */}
              <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl" aria-label="Category tabs">
                {[
                  { label: "Live Lobby", cat: "live" as Category },
                  { label: "Slots Engine", cat: "slots" as Category },
                  { label: "Promotions & Offers", cat: null },
                  { label: "VIP Club", cat: null },
                ].map(({ label, cat }) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (cat) {
                        setCategory(cat);
                        if (state.showFavoritesOnly) toggleFavoritesOnly();
                      } else {
                        showToastMessage(`${label} integration details will appear shortly!`);
                      }
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
                      cat && state.selectedCategory === cat && !state.showFavoritesOnly
                        ? "bg-white text-[#E11D48] shadow-sm"
                        : "text-slate-600 hover:text-[#0F172A]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right: Wallet Details & Deposit Trigger */}
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <Wallet size={14} className="text-[#E11D48]" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">
                        Cash Balance
                      </span>
                      <span className="text-xs font-extrabold text-[#0F172A]">
                        ${user.balance}
                      </span>
                    </div>
                    <button
                      onClick={refreshBalance}
                      className="text-slate-400 hover:text-[#E11D48] cursor-pointer transition-colors"
                      title="Sync wallet"
                    >
                      <RefreshCw size={12} className="hover:rotate-180 transition-transform duration-300" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setDepositModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors shadow-md shadow-[#2563EB]/15 cursor-pointer flex items-center gap-1"
                  >
                    <CircleDollarSign size={14} />
                    Deposit Funds
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-[#E11D48] transition-all cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors shadow-md shadow-[#2563EB]/25 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {/* Mobile hamburger menu */}
              <button
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Drawer for mobile view */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-inner">
              {navItems.map((item) => {
                const active = isItemActive(item.view);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      handleNavItemClick(item);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                      active
                        ? "bg-[#E11D48]/10 text-[#E11D48]"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* ── BANNERS SLIDER (IMAGE ONLY BANNERS AT THE VERY TOP) ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-2" aria-label="Campaign Banners">
          <Banners />
        </section>

        {/* ── HERO BANNER: STAKE-STYLE SIDE-BY-SIDE PROMOTIONAL TILES (UNDER BANNERS) ─────── */}
        {dynamicEvents.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-4" aria-label="Featured Promotions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dynamicEvents.map((evt, idx) => {
                const colors = [
                  "from-[#E11D48] via-[#BE123C] to-[#9F1239]", // Red Rose
                  "from-[#2563EB] via-[#1D4ED8] to-[#1E40AF]", // Royal Blue
                  "from-[#F59E0B] via-[#D97706] to-[#B45309]", // Amber Gold
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div
                    key={evt.id}
                    className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${grad} text-white p-8 lg:p-10 shadow-lg flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:shadow-xl`}
                  >
                    {/* Overlay background configuration */}
                    <div 
                      className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay"
                      style={{ backgroundImage: `url(${evt.imageUrl})` }}
                    />
                    
                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                        <Sparkles size={11} className="text-[#F59E0B]" />
                        Active Event Promo
                      </span>
                      {(() => {
                        const [eventTitle, eventDesc] = (evt.title || "").split(":::");
                        return (
                          <>
                            <h2 className="text-3xl font-extrabold leading-tight tracking-tight mb-3 uppercase">
                              {eventTitle}
                            </h2>
                            <p className="text-white/80 text-xs sm:text-sm max-w-md leading-relaxed">
                              {eventDesc || "Earn rewards and boost wagers. Wager to secure leaderboard points on this live lobby event."}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6">
                      {evt.linkUrl ? (
                        <a
                          href={evt.linkUrl}
                          className="px-6 py-2.5 rounded-xl font-extrabold text-slate-800 bg-white hover:bg-slate-55 text-xs shadow-md transition-all hover:-translate-y-0.5 block"
                        >
                          Explore Event
                        </a>
                      ) : (
                        <button
                          onClick={() => setDepositModalOpen(true)}
                          className="px-6 py-2.5 rounded-xl font-extrabold text-slate-800 bg-white hover:bg-slate-55 text-xs shadow-md transition-all hover:-translate-y-0.5"
                        >
                          Quick Deposit
                        </button>
                      )}
                      <div className="text-xs text-white/85 font-semibold flex items-center gap-1">
                        <Clock size={12} /> Live Event
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── QUICK CHIPS NAVIGATION ───────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-2" aria-label="Game lobby tabs">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {categoryChips.map(({ label, icon, value }) => (
              <CategoryChip
                key={value}
                label={label}
                icon={icon}
                active={activeChip === value}
                onClick={() => {
                  if (value === "favorites") {
                    if (!state.showFavoritesOnly) toggleFavoritesOnly();
                  } else {
                    if (state.showFavoritesOnly) toggleFavoritesOnly();
                    setCategory(value as Category);
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* ── GAME GRID CONTAINER SECTION ───────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-10 space-y-6" aria-label="Main game catalog">

          {/* Search controls */}
          <div className="space-y-4">
            <SearchBar
              searchTerm={state.searchTerm}
              onSearchChange={setSearchTerm}
            />
            <FilterControls
              selectedCategory={state.selectedCategory}
              onCategoryChange={setCategory}
              showFavoritesOnly={state.showFavoritesOnly}
              onToggleFavoritesOnly={toggleFavoritesOnly}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              games={state.games}
              favoritesCount={favoritesCount}
            />
          </div>

          {/* Section title & count */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-[#E11D48]" />
              {state.selectedCategory !== "all"
                ? state.selectedCategory === "live"
                  ? "Live Casino Games"
                  : state.selectedCategory === "slots"
                  ? "Vibrant Slots Engine"
                  : state.selectedCategory.toUpperCase()
                : "Standard Platform Grid"}
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full">
              {filteredGames.length} Available
            </span>
          </div>

          {/* Game catalog grid */}
          <GameGrid
            games={filteredGames}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onPlay={handlePlay}
            onClearFilters={clearFilters}
            totalGames={state.games.length}
          />
        </section>

        {/* ── STAKE.COM LIVE LEADERBOARD / BET HISTORY FEED ─────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 bg-[#F8FAFC] border-t border-b border-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Headers and Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-[#F59E0B]" />
                  Live Platform Activity
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Realtime wagers generated by OroPlay API integrations
                </p>
              </div>

              {/* Toggle switch */}
              <div className="flex p-1 bg-slate-200/60 rounded-xl max-w-sm self-start">
                {[
                  { id: "recent", name: "Recent Bets" },
                  { id: "high", name: "High Rollers" },
                  { id: "personal", name: "My Bet Logs" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLeaderboardTab(tab.id as "recent" | "high" | "personal")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeLeaderboardTab === tab.id
                        ? "bg-white text-[#E11D48] shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Table Feed */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4.5 px-5">Game</th>
                      <th className="py-4.5 px-5">Player Account</th>
                      <th className="py-4.5 px-5">Timestamp</th>
                      <th className="py-4.5 px-5 text-right">Wager Amount</th>
                      <th className="py-4.5 px-5 text-center">Multiplier</th>
                      <th className="py-4.5 px-5 text-right">Payout Cash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {currentLeaderboardList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                          No recent activities logged in this view. Launches will appear here!
                        </td>
                      </tr>
                    ) : (
                      currentLeaderboardList.map((bet) => (
                        <tr key={bet.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                            {bet.game}
                          </td>
                          <td className="py-4.5 px-5 text-slate-500">{bet.user}</td>
                          <td className="py-4.5 px-5 text-slate-400 flex items-center gap-1 font-normal">
                            <Clock size={11} />
                            {bet.time}
                          </td>
                          <td className="py-4.5 px-5 text-right text-slate-900">
                            ${bet.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4.5 px-5 text-center">
                            {bet.isWin ? (
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                {bet.multiplier}x
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>
                          <td className={`py-4.5 px-5 text-right font-extrabold ${bet.isWin ? "text-emerald-600" : "text-slate-400 font-normal"}`}>
                            {bet.isWin ? (
                              `+$${bet.payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            ) : (
                              "$0.00"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 px-5 py-3 text-center border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Shield size={11} className="text-emerald-500" />
                  RNG CERTIFIED ORACLE PAYOUTS & FAIR PLAY GUARANTEED
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <Footer />
      </main>

      {/* Toast popup */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onHide={hideToast}
        duration={TOAST_DURATION}
      />

      {/* Deposit Request Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-[#2563EB]" />
                <h3 className="text-lg font-bold text-slate-900">Request Deposit Credit</h3>
              </div>
              <button
                onClick={() => setDepositModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Amount to Credited (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-extrabold">$</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="10"
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Minimum amount $10"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E11D48] focus:border-transparent font-bold text-slate-800"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Deposit requires approval by an admin from PBBET Admin Control.
                </span>
              </div>
              
              <button
                type="submit"
                disabled={depositing}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563EB]/20 cursor-pointer disabled:opacity-50"
              >
                {depositing ? "Submitting Request..." : "Request Deposit Balance"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoGameLobby;
