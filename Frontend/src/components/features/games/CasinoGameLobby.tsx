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

// ─── Floating decoration SVGs ────────────────────────────────────────────────
// Unused decorative components removed to prevent compile warnings

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

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "bot"; text: string; time: string }[]>([
    { sender: "bot", text: "Welcome to PBBET 24/7 Live Support! How can I assist you today? (e.g. ask about deposits, withdrawals, KYC status, or RTP updates)", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [userChatMessage, setUserChatMessage] = useState("");
  const [botTyping, setBotTyping] = useState(false);

  // Load player transaction history when profile is opened
  useEffect(() => {
    if (!profileModalOpen) return;

    const fetchUserTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/user/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUserTransactions(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load user transactions", err);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchUserTransactions();
  }, [profileModalOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatMessage.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = userChatMessage;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg, time: timeStr }]);
    setUserChatMessage("");
    setBotTyping(true);

    setTimeout(() => {
      setBotTyping(false);
      let reply = "I'm sorry, I didn't quite catch that. You can contact support at support@pbbet.com for urgent issues!";
      const lower = userMsg.toLowerCase();
      if (lower.includes("deposit") || lower.includes("credit") || lower.includes("payment")) {
        reply = "Depositing is simple: click 'Deposit Funds' at the top right, enter your amount, and submit. An administrator will review and credit your wallet within a few minutes.";
      } else if (lower.includes("withdraw") || lower.includes("cashout") || lower.includes("payout")) {
        reply = "Withdrawals are processed securely after KYC approval. You can request a withdrawal via your Account Dashboard or check progress in the Admin Panel.";
      } else if (lower.includes("game") || lower.includes("launch") || lower.includes("play")) {
        reply = "If a game fails to load, ensure you are logged in and have a positive cash balance. Click on any game card in the lobby to obtain a launch link.";
      } else if (lower.includes("kyc") || lower.includes("verify") || lower.includes("status")) {
        reply = "Your KYC verification status starts as PENDING. The administrator can instantly update your profile status to APPROVED from the User Management desk.";
      } else if (lower.includes("rtp") || lower.includes("win") || lower.includes("odds")) {
        reply = "Our games utilize certified RNG payout engines. Administrators can update RTP parameters between 30% and 99% for selected vendors.";
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        reply = "Hello! I am your PBBET Assistant. Ask me about deposits, withdrawals, KYC status, or game options!";
      }

      const botTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [...prev, { sender: "bot", text: reply, time: botTimeStr }]);
    }, 1500);
  };

  // Fetch dynamic policy modal content on open
  useEffect(() => {
    if (!policyModal || !policyModal.isOpen) return;

    const fetchPolicyContent = async () => {
      setPolicyLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/user/settings`);
        const data = await res.json();
        if (res.ok && data.success) {
          const content = data.data[policyModal.contentKey];
          if (content) {
            setPolicyContent(content);
          } else {
            // Fallback default messages (no dummy text)
            if (policyModal.contentKey === "privacy_policy") {
              setPolicyContent("Privacy Policy Information: We protect your data and transactions with advanced SSL technology. We do not share player logs or history records with external entities. Play in absolute safety on PBBET.");
            } else if (policyModal.contentKey === "terms_conditions") {
              setPolicyContent("Terms & Conditions: By creating an account on PBBET, you agree to comply with our fair-use and fair-play guidelines. Wagers are processed instantly via OroPlay integration. Withdrawals require KYC verification.");
            } else if (policyModal.contentKey === "responsible_gaming") {
              setPolicyContent("Responsible Gaming: Betting should be fun and entertainment-oriented. If you feel wager amounts exceed your budget limits, configure session cooldown limits or contact our live chat to suspend your profile.");
            } else if (policyModal.contentKey === "about_us") {
              setPolicyContent("About PBBET: Welcome to PBBET, the premier destination for live casino and slots. We host 50+ global game providers including slots, live casino tables, roulette, baccarat, and mini-games. Experience next-gen iGaming with secure payments.");
            } else {
              setPolicyContent("No content has been configured for this section by the site administrator yet.");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load policy content", err);
        setPolicyContent("Error loading details from server. Please try again.");
      } finally {
        setPolicyLoading(false);
      }
    };

    fetchPolicyContent();
  }, [policyModal]);
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
              gameCode: (game as Game).gameCode || game.id,
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
      setSportsModalOpen(true);
    } else if (item.view === "promotions") {
      setPromotionsModalOpen(true);
    } else if (item.view === "vip") {
      setVipModalOpen(true);
    } else if (item.view === "account") {
      if (user) {
        setProfileModalOpen(true);
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
              onClick={() => setChatOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
            >
              <MessageSquare size={16} className="text-emerald-500" />
              Live Casino Support
            </button>
            <button
              onClick={() => setFaqModalOpen(true)}
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
                        if (label.includes("VIP")) {
                          setVipModalOpen(true);
                        } else {
                          setPromotionsModalOpen(true);
                        }
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
        <Footer onOpenPolicy={(title, key) => setPolicyModal({ isOpen: true, title, contentKey: key })} />
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

      {/* Policy View Modal */}
      {policyModal && policyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Shield size={20} className="text-[#E11D48]" />
                {policyModal.title}
              </h3>
              <button
                onClick={() => setPolicyModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 text-slate-600 text-sm leading-relaxed whitespace-pre-line space-y-4">
              {policyLoading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <p>{policyContent}</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPolicyModal(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] text-xs shadow-md transition-all cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserIcon size={20} className="text-[#E11D48]" />
                Player Profile Account
              </h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Account Overview Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-150 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</span>
                  <span className="text-sm font-extrabold text-slate-800">{user?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">KYC Status</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">APPROVED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet Balance</span>
                  <span className="text-sm font-extrabold text-[#F59E0B]">${user?.balance} USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VIP Level</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#D97706]">GOLD VIP</span>
                </div>
              </div>

              {/* Transactions History Feed */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Transaction Logs</h4>
                {loadingTransactions ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <RefreshCw size={12} className="animate-spin" /> Loading transactions...
                  </div>
                ) : userTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium py-6 text-center">No transaction records found.</p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {userTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-block w-fit px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${tx.type === 'DEPOSIT' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                            {tx.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`font-extrabold ${tx.type === 'DEPOSIT' || tx.type === 'WIN' ? 'text-emerald-600' : 'text-slate-705'}`}>
                            {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-mono">{tx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] text-xs shadow-md transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium VIP Club Modal */}
      {vipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-[#F59E0B]" />
                <h3 className="text-lg font-bold text-slate-900">PBBET VIP Club</h3>
              </div>
              <button
                onClick={() => setVipModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Rank Detail Card */}
              <div className="bg-gradient-to-br from-[#F59E0B]/20 via-amber-50 to-[#F59E0B]/10 rounded-2xl p-5 border border-amber-200 flex flex-col items-center text-center">
                <span className="text-[9px] bg-[#F59E0B]/20 text-[#D97706] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest mb-2">
                  Current Rank
                </span>
                <span className="text-2xl font-black text-amber-900 tracking-tight">GOLD VIP MEMBER</span>
                <p className="text-xs text-amber-700/80 mt-1 max-w-xs leading-relaxed">
                  Congratulations! You are on our premier VIP Gold rank. Enjoy exclusive rebate wagers and higher withdrawal limits.
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-500">
                  <span>Progress to PLATINUM VIP</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] h-full" style={{ width: "75%" }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Accumulate $2,500 more in wagers to level up!</span>
              </div>

              {/* VIP Benefits List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Exclusive Gold Benefits</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[#F59E0B] font-bold">1.2% Rebate</div>
                    <div className="text-[10px] text-slate-400 font-medium">On every slot wager</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[#F59E0B] font-bold">Priority Support</div>
                    <div className="text-[10px] text-slate-400 font-medium">Direct live chat assistance</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[#F59E0B] font-bold">Weekly Bonus</div>
                    <div className="text-[10px] text-slate-400 font-medium">Free $100 loyalty chip</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[#F59E0B] font-bold">Fast Cashouts</div>
                    <div className="text-[10px] text-slate-400 font-medium">Reviewed under 10 minutes</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setVipModalOpen(false)}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#F59E0B] hover:bg-[#D97706] shadow-md transition-all cursor-pointer"
              >
                Close VIP Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Promotions Modal */}
      {promotionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Gift size={20} className="text-[#E11D48]" />
                Active Promotions & Events
              </h3>
              <button
                onClick={() => setPromotionsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {dynamicEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  No active custom promotions configured at this moment.
                </div>
              ) : (
                dynamicEvents.map((evt) => {
                  const [title, desc] = (evt.title || "").split(":::");
                  return (
                    <div key={evt.id} className="relative overflow-hidden rounded-2xl border border-slate-150 p-5 bg-gradient-to-r from-slate-50 to-rose-50/20 hover:border-rose-200 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Active Event</span>
                          <h4 className="text-sm font-bold text-slate-800 uppercase leading-snug">{title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">{desc || "Participate and secure leaderboard points on this live lobby event."}</p>
                        </div>
                        {evt.imageUrl && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            <img src={evt.imageUrl} alt={title} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-150 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1"><Clock size={11} /> Limited Time</span>
                        {evt.linkUrl ? (
                          <a href={evt.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-600 hover:text-rose-800 font-bold">Explore rules &rarr;</a>
                        ) : (
                          <button onClick={() => { setPromotionsModalOpen(false); setDepositModalOpen(true); }} className="text-xs text-[#2563EB] hover:underline font-bold">Deposit to participate</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPromotionsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] text-xs shadow-md transition-all cursor-pointer"
              >
                Close Promotions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ & Help Center Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle size={20} className="text-[#2563EB]" />
                Help Center & FAQs
              </h3>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs font-semibold text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[#0F172A] font-bold">How do I credit my balance?</div>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Click on the &quot;Deposit Funds&quot; button in the top header, input the amount you want to request (minimum $10), and submit. Once submitted, our administrators will approve your pending credit transaction from the admin financial desk.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[#0F172A] font-bold">How do I launch a game?</div>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Make sure you have registered and are logged in. Browse the games catalog, filter by vendor or search for name, and click &apos;PLAY NOW&apos;. The secure game window will launch inside a new tab utilizing our OroPlay v2 client integration.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[#0F172A] font-bold">Are the transactions secure?</div>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Yes. All wagers, wagers callbacks, bets, wins, and batch updates from the OroPlay engine to the PBBET server are protected by end-to-end Basic Authentication and database level idempotency logs.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[#0F172A] font-bold">What is KYC status verification?</div>
                <p className="text-slate-500 font-medium leading-relaxed">
                  All new signups start with PENDING KYC. In order to initiate withdrawals, administrators review profile verification and approve KYC status. You can view your current KYC status inside the profile modal.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setFaqModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-blue-700 text-xs shadow-md transition-all cursor-pointer"
              >
                Close FAQ Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sports Book Betting Modal */}
      {sportsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full mx-4 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Trophy size={20} className="text-[#E11D48]" />
                Sportsbook Lobby
              </h3>
              <button
                onClick={() => { setSportsModalOpen(false); setSelectedMatch(null); setSportsWager(""); }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-5">
              {/* Match Card Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live & Upcoming Match Odds</h4>
                {[
                  { id: 1, home: "Real Madrid", away: "Barcelona", league: "La Liga (Spain)", oddsHome: 1.85, oddsDraw: 3.40, oddsAway: 4.10, date: "Live Now - 2nd Half" },
                  { id: 2, home: "Manchester City", away: "Liverpool", league: "Premier League (England)", oddsHome: 2.10, oddsDraw: 3.25, oddsAway: 3.10, date: "Today 22:45" },
                  { id: 3, home: "Golden State Warriors", away: "Los Angeles Lakers", league: "NBA Basketball", oddsHome: 1.70, oddsDraw: 9.00, oddsAway: 2.30, date: "Tomorrow 06:00" },
                ].map((match) => (
                  <div key={match.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="uppercase">{match.league}</span>
                      <span className="text-rose-500 flex items-center gap-1 font-extrabold">{match.date}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-sm text-slate-800">
                      <span>{match.home} vs {match.away}</span>
                    </div>
                    {/* Odds Selector buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedMatch({ match, choice: "Home", team: match.home, odds: match.oddsHome })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === match.id && selectedMatch?.choice === "Home" ? "bg-[#E11D48] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-[#E11D48] hover:text-[#E11D48]"}`}
                      >
                        1 ({match.oddsHome})
                      </button>
                      <button
                        onClick={() => setSelectedMatch({ match, choice: "Draw", team: "Draw Match", odds: match.oddsDraw })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === match.id && selectedMatch?.choice === "Draw" ? "bg-[#E11D48] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-[#E11D48] hover:text-[#E11D48]"}`}
                      >
                        X ({match.oddsDraw})
                      </button>
                      <button
                        onClick={() => setSelectedMatch({ match, choice: "Away", team: match.away, odds: match.oddsAway })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === match.id && selectedMatch?.choice === "Away" ? "bg-[#E11D48] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-[#E11D48] hover:text-[#E11D48]"}`}
                      >
                        2 ({match.oddsAway})
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Betslip details */}
              {selectedMatch && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
                    <span>Selected Betslip</span>
                    <button onClick={() => setSelectedMatch(null)} className="text-slate-400 hover:text-slate-600">Remove</button>
                  </div>
                  <div className="text-xs font-semibold space-y-1">
                    <div className="text-slate-800 font-extrabold">{selectedMatch.match.home} vs {selectedMatch.match.away}</div>
                    <div className="text-slate-400">Choice: <span className="text-slate-700 font-bold">{selectedMatch.team}</span> @ <span className="text-[#E11D48] font-black">{selectedMatch.odds}</span></div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Wager Amount (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-extrabold">$</div>
                      <input
                        type="number"
                        min="1"
                        value={sportsWager}
                        onChange={(e) => setSportsWager(e.target.value)}
                        placeholder="Enter wager amount"
                        className="w-full pl-7 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-bold text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  {sportsWager && !isNaN(parseFloat(sportsWager)) && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>Est. Return payout:</span>
                      <span className="text-emerald-600 font-extrabold">${(parseFloat(sportsWager) * selectedMatch.odds).toFixed(2)} USD</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const amount = parseFloat(sportsWager);
                      if (isNaN(amount) || amount <= 0) {
                        showToastMessage("Please enter a valid wager amount.");
                        return;
                      }
                      if (user && parseFloat(String(user.balance)) < amount) {
                        showToastMessage("Insufficient balance to place this wager.");
                        return;
                      }
                      showToastMessage(`Wager placed successfully! $${amount} bet registered on ${selectedMatch.team}.`);
                      setSelectedMatch(null);
                      setSportsWager("");
                      setSportsModalOpen(false);
                    }}
                    className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] shadow-md transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Confirm Bet Slip
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setSportsModalOpen(false); setSelectedMatch(null); setSportsWager(""); }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 text-xs cursor-pointer border border-slate-200"
              >
                Close Sportsbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Support Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-[60] w-80 sm:w-96 h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]">
          {/* Header */}
          <div className="bg-[#E11D48] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">CS</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#E11D48]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">24/7 Agent Chat</span>
                <span className="text-[10px] text-rose-200 mt-1 font-semibold">Online & ready</span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg text-rose-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages screen */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-semibold ${msg.sender === "user" ? "bg-[#E11D48] text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-200"}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">{msg.time}</span>
              </div>
            ))}
            {botTyping && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 w-fit rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-150 bg-white flex items-center gap-2">
            <input
              type="text"
              value={userChatMessage}
              onChange={(e) => setUserChatMessage(e.target.value)}
              placeholder="Ask about deposits, KYC, games..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl font-bold bg-[#E11D48] text-white hover:bg-[#BE123C] text-xs transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CasinoGameLobby;
