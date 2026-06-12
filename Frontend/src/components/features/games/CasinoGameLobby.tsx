"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
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
import { logClientAction } from "@/lib/logger";

import { escapeHtml } from "@/utils/security";
import { TOAST_DURATION } from "@/constants";
import { Game, Category } from "@/types/game";
import { createFavoriteMessage, renderGameErrorToWindow } from "@/utils/helpers";

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
    className={`flex flex-col items-center justify-center gap-2 w-28 h-20 shrink-0 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider select-none cursor-pointer transition-all duration-300 border ${
      active
        ? "bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white border-transparent shadow-lg shadow-[#2563EB]/25 scale-[1.02]"
        : "bg-[#0f172a]/80 text-slate-300 border-slate-800 shadow-sm hover:border-[#3b82f6]/30 hover:text-[#3b82f6] hover:-translate-y-0.5"
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? "scale-110 text-white" : "text-slate-400 group-hover:text-[#3b82f6]"}`}>
      {icon}
    </span>
    <span className="text-center">{label}</span>
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
    logClientAction("User Logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logClientAction("Submit Deposit Request", { amount: depositAmount });
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
        logClientAction("Deposit Request Success", { amount });
        showToastMessage("Deposit request submitted successfully! Pending admin approval.");
        setDepositModalOpen(false);
        setDepositAmount("");
        refreshBalance();
      } else {
        logClientAction("Deposit Request Fail", { amount, error: data.message });
        showToastMessage(`Error: ${data.message || "Failed to submit deposit"}`);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Deposit Request Error", { amount, error: errMsg });
      showToastMessage("Error submitting deposit request");
    } finally {
      setDepositing(false);
    }
  };

  const { favorites, favoritesCount, toggleFavorite } = useFavoritesContext();
  const userRef = useRef(user);
  const gamesRef = useRef(state.games);
  useEffect(() => { gamesRef.current = state.games; }, [state.games]);
  useEffect(() => { userRef.current = user; }, [user]);
  const favoritesRef = useRef(favorites);
  useEffect(() => { favoritesRef.current = favorites; }, [favorites]);
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
      const game = gamesRef.current.find((g) => g.id === gameId);
      if (game) {
        const token = localStorage.getItem("token");
        if (!token) {
          logClientAction("Play Game Redirect to Login", { gameId, gameName: game.name });
          router.push("/login");
          return;
        }

        const vendorCode = (game as Game & { vendorCode: string }).vendorCode || "";
        const gameCode = (game as Game).gameCode || game.id;

        showToastMessage(`Launching ${game.name}...`);
        logClientAction("Click Play Game", { gameId, gameName: game.name, vendorCode, gameCode });

        // Open a blank tab immediately to avoid popup blockers and make launching feel instant
        const gameWin = window.open("about:blank", "_blank");
        if (gameWin) {
          gameWin.document.title = `Loading ${game.name}...`;
          gameWin.document.body.style.backgroundColor = "#0b1329";
          gameWin.document.body.style.color = "#f8fafc";
          gameWin.document.body.style.display = "flex";
          gameWin.document.body.style.flexDirection = "column";
          gameWin.document.body.style.justifyContent = "center";
          gameWin.document.body.style.alignItems = "center";
          gameWin.document.body.style.height = "100vh";
          gameWin.document.body.style.margin = "0";
          gameWin.document.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

          const style = gameWin.document.createElement("style");
          style.textContent = `
            .spinner {
              border: 4px solid rgba(59, 130, 246, 0.1);
              width: 48px;
              height: 48px;
              border-radius: 50%;
              border-left-color: #3b82f6;
              animation: spin 1s linear infinite;
              margin-bottom: 24px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          gameWin.document.head.appendChild(style);

          const spinner = gameWin.document.createElement("div");
          spinner.className = "spinner";

          const title = gameWin.document.createElement("div");
          title.style.fontSize = "18px";
          title.style.fontWeight = "800";
          title.style.textTransform = "uppercase";
          title.style.letterSpacing = "0.05em";
          title.style.color = "#3b82f6";
          title.textContent = `Launching ${game.name}...`;

          const subtitle = gameWin.document.createElement("div");
          subtitle.style.color = "#94a3b8";
          subtitle.style.fontSize = "12px";
          subtitle.style.marginTop = "8px";
          subtitle.style.fontWeight = "500";
          subtitle.textContent = "Securing game session connection. Please wait...";

          gameWin.document.body.appendChild(spinner);
          gameWin.document.body.appendChild(title);
          gameWin.document.body.appendChild(subtitle);
        }

        try {
          const res = await fetch(`${BACKEND_URL}/user/launch`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              vendorCode,
              gameCode,
            }),
          });
          const data = await res.json();
          if (res.ok && data.launchUrl) {
            logClientAction("Game Launch Success", { gameId, gameName: game.name, launchUrl: data.launchUrl });
            
            // Track in personal bets history mock
            const betAmt = Math.floor(Math.random() * 40) + 10;
            const mult = parseFloat((Math.random() * 3.5 + 0.2).toFixed(2));
            const isWin = Math.random() > 0.5;
            const pay = isWin ? parseFloat((betAmt * mult).toFixed(2)) : 0;
            const newPersonal: BetLog = {
              id: Math.random().toString(36).substring(2, 9),
              game: game.name,
              user: userRef.current?.username || "You",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              amount: betAmt,
              multiplier: isWin ? mult : 0,
              payout: pay,
              isWin,
            };
            setPersonalBets((prev) => [newPersonal, ...prev]);

            // Redirect the already-open window to the launch URL
            if (gameWin) {
              gameWin.location.href = data.launchUrl;
            }
          } else {
            logClientAction("Game Launch Fail", { gameId, gameName: game.name, error: data.message || "Failed to launch game" });
            showToastMessage(`Error: ${data.message || "Failed to launch game"}`);
            
            // Show error in the open window
            if (gameWin) {
              gameWin.document.body.innerHTML = "";
              gameWin.document.body.style.backgroundColor = "#0b1329";
              gameWin.document.body.style.color = "#f8fafc";
              gameWin.document.body.style.display = "flex";
              gameWin.document.body.style.flexDirection = "column";
              gameWin.document.body.style.justifyContent = "center";
              gameWin.document.body.style.alignItems = "center";
              gameWin.document.body.style.height = "100vh";
              gameWin.document.body.style.margin = "0";
              gameWin.document.body.style.fontFamily = "system-ui, sans-serif";
              gameWin.document.body.style.textAlign = "center";
              gameWin.document.body.style.padding = "24px";

              const title = gameWin.document.createElement("div");
              title.style.color = "#ef4444";
              title.style.fontSize = "20px";
              title.style.fontWeight = "800";
              title.style.textTransform = "uppercase";
              title.textContent = "Launch Failed";

              const message = gameWin.document.createElement("div");
              message.style.color = "#cbd5e1";
              message.style.fontSize = "14px";
              message.style.marginTop = "12px";
              message.style.maxWidth = "400px";
              message.style.lineHeight = "1.5";
              message.textContent = data.message || "Failed to launch game session. Please check your account status or balance.";

              const closeBtn = gameWin.document.createElement("button");
              closeBtn.style.marginTop = "24px";
              closeBtn.style.padding = "10px 20px";
              closeBtn.style.backgroundColor = "#3b82f6";
              closeBtn.style.color = "white";
              closeBtn.style.border = "none";
              closeBtn.style.borderRadius = "8px";
              closeBtn.style.fontWeight = "bold";
              closeBtn.style.cursor = "pointer";
              closeBtn.textContent = "Close Window";
              closeBtn.onclick = () => gameWin.close();

              gameWin.document.body.appendChild(title);
              gameWin.document.body.appendChild(message);
              gameWin.document.body.appendChild(closeBtn);
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          logClientAction("Game Launch Error", { gameId, gameName: game.name, error: errMsg });
          showToastMessage("Error launching game");
          
          if (gameWin) {
            gameWin.document.body.innerHTML = "";
            gameWin.document.body.style.backgroundColor = "#0b1329";
            gameWin.document.body.style.color = "#f8fafc";
            gameWin.document.body.style.display = "flex";
            gameWin.document.body.style.flexDirection = "column";
            gameWin.document.body.style.justifyContent = "center";
            gameWin.document.body.style.alignItems = "center";
            gameWin.document.body.style.height = "100vh";
            gameWin.document.body.style.margin = "0";
            gameWin.document.body.style.fontFamily = "system-ui, sans-serif";
            gameWin.document.body.style.textAlign = "center";
            gameWin.document.body.style.padding = "24px";

            const title = gameWin.document.createElement("div");
            title.style.color = "#ef4444";
            title.style.fontSize = "20px";
            title.style.fontWeight = "800";
            title.style.textTransform = "uppercase";
            title.textContent = "Connection Error";

            const message = gameWin.document.createElement("div");
            message.style.color = "#cbd5e1";
            message.style.fontSize = "14px";
            message.style.marginTop = "12px";
            message.textContent = "Failed to connect to the operator server.";

            const closeBtn = gameWin.document.createElement("button");
            closeBtn.style.marginTop = "24px";
            closeBtn.style.padding = "10px 20px";
            closeBtn.style.backgroundColor = "#3b82f6";
            closeBtn.style.color = "white";
            closeBtn.style.border = "none";
            closeBtn.style.borderRadius = "8px";
            closeBtn.style.fontWeight = "bold";
            closeBtn.style.cursor = "pointer";
            closeBtn.textContent = "Close Window";
            closeBtn.onclick = () => gameWin.close();

            gameWin.document.body.appendChild(title);
            gameWin.document.body.appendChild(message);
            gameWin.document.body.appendChild(closeBtn);
          }
        }
      }
    },
    [showToastMessage, router]
  );

  const handleToggleFavorite = useCallback(
    (gameId: string) => {
      const game = gamesRef.current.find((g) => g.id === gameId);
      const wasFavorite = favoritesRef.current.includes(gameId);
      logClientAction("Toggle Favorite Game", { gameId, gameName: game?.name || "unknown", action: wasFavorite ? "remove" : "add" });
      toggleFavorite(gameId);
      if (game) {
        showToastMessage(createFavoriteMessage(game.name, !wasFavorite));
      }
    },
    [toggleFavorite, showToastMessage]
  );

  const activeChip = state.showFavoritesOnly
    ? "favorites"
    : state.selectedCategory;
  const isCategoryActive = useCallback((value: string) => {
    if (value === "favorites") return activeChip === "favorites";
    if (value === "sports") return sportsModalOpen;
    if (value === "promotions") return promotionsModalOpen;
    if (value === "vip") return vipModalOpen;
    return activeChip === value;
  }, [activeChip, sportsModalOpen, promotionsModalOpen, vipModalOpen]);

  const handleCategoryClick = useCallback((value: string) => {
    logClientAction("Click Category Chip", { category: value });

    switch (value) {
      case "favorites":
        if (!state.showFavoritesOnly) toggleFavoritesOnly();
        break;
      case "sports":
        setSportsModalOpen(true);
        break;
      case "promotions":
        setPromotionsModalOpen(true);
        break;
      case "vip":
        setVipModalOpen(true);
        break;
      default:
        if (state.showFavoritesOnly) toggleFavoritesOnly();
        setCategory(value as Category);
        break;
    }
  }, [
    state.showFavoritesOnly,
    toggleFavoritesOnly,
    setCategory,
    setSportsModalOpen,
    setPromotionsModalOpen,
    setVipModalOpen,
  ]);

  if (state.isLoading) {
    return <LoadingSpinner />;
  }



  const categoryChips: {
    label: string;
    icon: React.ReactNode;
    value: Category | "favorites" | "promotions" | "vip";
  }[] = [
    { label: currentLanguage === "BN" ? "গরম খেলা" : "Hot Games", icon: <LayoutDashboard size={18} />, value: "all" },
    { label: currentLanguage === "BN" ? "স্পোর্টস" : "Sports", icon: <Trophy size={18} />, value: "sports" },
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


  const currentLeaderboardList =
    activeLeaderboardTab === "recent"
      ? liveBets
      : activeLeaderboardTab === "high"
      ? highRollers
      : personalBets;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1329] to-[#020617] text-[#f8fafc] flex flex-col">
      {/* ── REDESIGNED TOP HEADER (PBC88 STYLE - TWO ROWS) ──────────────── */}
      <header className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-sm transition-all">
        {/* Row 1: Logo, Language Select & User Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center shadow-md">
              <Dices size={22} className="text-white animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-[#3b82f6] leading-none">
                PBBET
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Premium iGaming
              </span>
            </div>
          </div>

          {/* Center/Right: Language Selector & Auth/Wallet */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Language Dropdown Select */}
            <div className="flex items-center gap-1 bg-[#0b1329] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCurrentLanguage("BN")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                  currentLanguage === "BN"
                    ? "bg-[#3b82f6] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🇧🇩</span> বাংলা
              </button>
              <button
                onClick={() => setCurrentLanguage("EN")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                  currentLanguage === "EN"
                    ? "bg-[#3b82f6] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🇺🇸</span> EN
              </button>
            </div>

            {/* User Wallet Info and Modals or Auth Actions */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Wallet Balance Card */}
                 <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0f172a] shadow-sm">
                   <Wallet size={14} className="text-[#3b82f6]" />
                   <div className="flex flex-col leading-tight">
                     <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">
                       {currentLanguage === "BN" ? "ক্যাশ ব্যালেন্স" : "Cash Balance"}
                     </span>
                     <span className="text-xs font-extrabold text-white">
                       ${user.balance}
                     </span>
                   </div>
                   <button
                     onClick={refreshBalance}
                     className="text-slate-400 hover:text-[#3b82f6] cursor-pointer transition-colors"
                     title="Sync wallet"
                   >
                     <RefreshCw size={12} className="hover:rotate-180 transition-transform duration-300" />
                   </button>
                 </div>

                 {/* Deposit button */}
                 <button
                   onClick={() => setDepositModalOpen(true)}
                   className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white hover:from-[#3B82F6] hover:to-[#2563EB] transition-colors shadow-md shadow-[#2563EB]/15 cursor-pointer flex items-center gap-1"
                 >
                   <CircleDollarSign size={14} />
                   {currentLanguage === "BN" ? "ডিপোজিট" : "Deposit"}
                 </button>

                 {/* User Profile Action */}
                 <button
                   onClick={() => setProfileModalOpen(true)}
                   className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                   title="My Profile Account"
                 >
                   <UserIcon size={16} />
                 </button>

                 {/* Support Chat Action */}
                 <button
                   onClick={() => setChatOpen(true)}
                   className="p-2.5 rounded-xl border border-slate-800 text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
                   title="Live Support Support"
                 >
                   <MessageSquare size={16} />
                 </button>

                 {/* FAQ Help Action */}
                 <button
                   onClick={() => setFaqModalOpen(true)}
                   className="p-2.5 rounded-xl border border-slate-800 text-[#3b82f6] hover:bg-slate-800 transition-all cursor-pointer"
                   title="Help & FAQ Info"
                 >
                   <HelpCircle size={16} />
                 </button>

                 {/* Disconnect logout */}
                 <button
                   onClick={handleLogout}
                   className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-[#3b82f6] transition-all cursor-pointer"
                   title="Disconnect Session"
                 >
                   <LogOut size={16} />
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 {/* Live Support and FAQ even when logged out */}
                 <button
                   onClick={() => setChatOpen(true)}
                   className="p-2.5 rounded-xl border border-slate-800 text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
                   title="Live Support Support"
                 >
                   <MessageSquare size={15} />
                 </button>
                 <button
                   onClick={() => setFaqModalOpen(true)}
                   className="p-2.5 rounded-xl border border-slate-800 text-[#3b82f6] hover:bg-slate-800 transition-all cursor-pointer"
                   title="Help & FAQ Info"
                 >
                   <HelpCircle size={15} />
                 </button>

                 <button
                   onClick={() => router.push("/login")}
                   className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                 >
                   {currentLanguage === "BN" ? "লগইন" : "Login"}
                 </button>
                 <button
                   onClick={() => router.push("/register")}
                   className="px-4 py-2 rounded-xl text-xs font-bold bg-[#3b82f6] text-white hover:bg-[#1d4ed8] transition-colors shadow-md shadow-[#3b82f6]/25 cursor-pointer"
                 >
                   {currentLanguage === "BN" ? "নিবন্ধন" : "Sign Up"}
                 </button>
               </div>
             )}
           </div>
         </div>
       </header>

        {/* Flex layout container for Sidebar + Main Content */}
        <div className="flex-1 flex flex-row min-w-0 w-full relative">
          {/* Left Sidebar (visible on larger screens) */}
          <aside className={`hidden lg:block shrink-0 bg-[#0f172a]/40 border-r border-slate-800/80 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ${sidebarExpanded ? "w-64 p-4" : "w-12 p-2"}`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between px-3">
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer mx-auto flex items-center justify-center w-8 h-8 font-extrabold text-sm"
                  title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  {sidebarExpanded ? "❮" : "❯"}
                </button>
              </div>

              {sidebarExpanded && (
                <div>
                  <nav className="space-y-1">
                    {categoryChips.map(({ label, icon, value }) => {
                      const active = isCategoryActive(value);
                      return (
                        <button
                          key={value}
                          onClick={() => handleCategoryClick(value)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            active
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/10"
                              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                          }`}
                        >
                          <span className={`${active ? "text-white" : "text-slate-500 group-hover:text-white"}`}>
                            {icon}
                          </span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>
          </aside>

          {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
          <main className="flex-1 flex flex-col min-w-0">
         {/* ── ANNOUNCEMENT MARQUEE TICKER ────────────────────────────────── */}
          <section className="px-4 sm:px-6 lg:px-8 py-2.5 bg-[#0b1329] border-b border-slate-800 shadow-sm" aria-label="Announcement banner">
            <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-950/20 via-slate-900/50 to-slate-900/20 border border-slate-800 backdrop-blur-md">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3b82f6] text-white text-[10px] font-bold uppercase tracking-widest shrink-0 shadow-md shadow-[#3b82f6]/15 animate-pulse">
               {currentLanguage === "BN" ? "বিজ্ঞপ্তি" : "Notice"}
             </span>
             <div className="marquee-container text-xs text-slate-300 font-semibold overflow-hidden">
               <div className="marquee-content whitespace-nowrap">
                  {currentLanguage === "BN"
                    ? "📲 এক্সক্লুসিভ ৫০০ টাকা পুরস্কার পেতে অ্যাপে আসুন! আজই ডাউনলোড করুন! 💰"
                    : "📲 Come to the app to get an exclusive 500 BDT reward! Download today! 💰"}
                </div>
              </div>
           </div>
         </section>

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
        <section className="px-4 sm:px-6 lg:hidden pt-4 pb-2" aria-label="Game lobby tabs">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {categoryChips.map(({ label, icon, value }) => (
              <CategoryChip
                key={value}
                label={label}
                icon={icon}
                active={isCategoryActive(value)}
                onClick={() => handleCategoryClick(value)}
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
              placeholder={currentLanguage === "BN" ? "গেম বা প্রোভাইডার খুঁজুন..." : "Find games or providers..."}
            />
          </div>

          {/* Section title & count */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-[#2563EB]" />
              {state.showFavoritesOnly
                ? (currentLanguage === "BN" ? "পছন্দসই গেম তালিকা" : "My Favorites List")
                : state.selectedCategory !== "all"
                ? state.selectedCategory === "live"
                  ? (currentLanguage === "BN" ? "লাইভ ক্যাসিনো গেমস" : "Live Casino Games")
                  : state.selectedCategory === "slots"
                  ? (currentLanguage === "BN" ? "ভাইব্রেন্ট স্লট ইঞ্জিন" : "Vibrant Slots Engine")
                  : state.selectedCategory === "megaways"
                  ? (currentLanguage === "BN" ? "মেগাওয়েজ স্লটস" : "Megaways Slots")
                  : state.selectedCategory === "cards"
                  ? (currentLanguage === "BN" ? "কার্ড গেমস" : "Card Games")
                  : state.selectedCategory === "fishing"
                  ? (currentLanguage === "BN" ? "ফিশিং হান্টার" : "Fishing Hunter")
                  : state.selectedCategory === "crash"
                  ? (currentLanguage === "BN" ? "ক্র্যাশ ও মাইন্স গেমস" : "Crash & Mines Games")
                  : state.selectedCategory === "sports"
                  ? (currentLanguage === "BN" ? "স্পোর্টস গেমস লবি" : "Sports Games Lobby")
                  : state.selectedCategory === "lottery"
                  ? (currentLanguage === "BN" ? "লটারি ও স্ক্র্যাচকার্ড" : "Lottery & Scratchcards")
                  : state.selectedCategory === "arcade"
                  ? (currentLanguage === "BN" ? "আর্কেড ক্যাজুয়ালস" : "Arcade Casuals")
                  : state.selectedCategory.toUpperCase()
                : (currentLanguage === "BN" ? "স্ট্যান্ডার্ড প্ল্যাটফর্ম গ্রিড" : "Standard Platform Grid")}
            </h3>
            <span className="text-xs bg-[#0f172a]/80 text-[#3b82f6] border border-[#3b82f6]/30 font-bold px-2.5 py-1 rounded-full">
              {filteredGames.length} {currentLanguage === "BN" ? "টি গেম উপলব্ধ" : "Available"}
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
            lang={currentLanguage}
          />
        </section>

        {/* ── STAKE.COM LIVE LEADERBOARD / BET HISTORY FEED ─────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 bg-[#0f172a]/20 border-t border-b border-slate-800">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Headers and Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-[#2563EB]" />
                  Live Platform Activity
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Realtime wagers generated by OroPlay API integrations
                </p>
              </div>

              {/* Toggle switch */}
              <div className="flex p-1 bg-[#0b1329] border border-slate-800 rounded-xl max-w-sm self-start">
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
                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Table Feed */}
            <div className="bg-[#0f172a]/40 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b1329] text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-4.5 px-5">Game</th>
                      <th className="py-4.5 px-5">Player Account</th>
                      <th className="py-4.5 px-5">Timestamp</th>
                      <th className="py-4.5 px-5 text-right">Wager Amount</th>
                      <th className="py-4.5 px-5 text-center">Multiplier</th>
                      <th className="py-4.5 px-5 text-right">Payout Cash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-semibold text-slate-300">
                    {currentLeaderboardList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                          No recent activities logged in this view. Launches will appear here!
                        </td>
                      </tr>
                    ) : (
                      currentLeaderboardList.map((bet) => (
                        <tr key={bet.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4.5 px-5 font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {bet.game}
                          </td>
                          <td className="py-4.5 px-5 text-slate-400">{bet.user}</td>
                          <td className="py-4.5 px-5 text-slate-500 flex items-center gap-1 font-normal">
                            <Clock size={11} />
                            {bet.time}
                          </td>
                          <td className="py-4.5 px-5 text-right text-slate-200">
                            ${bet.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4.5 px-5 text-center">
                            {bet.isWin ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                {bet.multiplier}x
                              </span>
                            ) : (
                              <span className="text-slate-500 font-normal">-</span>
                            )}
                          </td>
                          <td className={`py-4.5 px-5 text-right font-extrabold ${bet.isWin ? "text-emerald-400" : "text-slate-500 font-normal"}`}>
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
              <div className="bg-[#0b1329] px-5 py-3 text-center border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Shield size={11} className="text-emerald-500" />
                  RNG CERTIFIED ORACLE PAYOUTS & FAIR PLAY GUARANTEED
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <Footer lang={currentLanguage} onOpenPolicy={(title, key) => setPolicyModal({ isOpen: true, title, contentKey: key })} />
        </main>
      </div>

      {/* Toast popup */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onHide={hideToast}
        duration={TOAST_DURATION}
      />

      {/* Deposit Request Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0f172a] rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-[#2563EB]" />
                <h3 className="text-lg font-bold text-white">Request Deposit Credit</h3>
              </div>
              <button
                onClick={() => setDepositModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
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
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-800 bg-[#0b1329] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-bold text-white placeholder-slate-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0f172a] rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-slate-800 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-[#2563EB]" />
                {policyModal.title}
              </h3>
              <button
                onClick={() => setPolicyModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 text-slate-350 text-sm leading-relaxed whitespace-pre-line space-y-4">
              {policyLoading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <p>{policyContent}</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPolicyModal(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] text-xs shadow-md transition-all cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0f172a] rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-slate-800 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon size={20} className="text-[#2563EB]" />
                Player Profile Account
              </h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Account Overview Card */}
              <div className="bg-gradient-to-br from-[#0f172a] to-[#0b1329] rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</span>
                  <span className="text-sm font-extrabold text-white">{user?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">KYC Status</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APPROVED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet Balance</span>
                  <span className="text-sm font-extrabold text-[#F59E0B]">${user?.balance} USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VIP Level</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">GOLD VIP</span>
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
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0b1329] border border-slate-800 rounded-xl text-xs font-semibold">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-block w-fit px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${tx.type === 'DEPOSIT' ? 'bg-blue-500/10 text-blue-450 border border-blue-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'}`}>
                            {tx.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`font-extrabold ${tx.type === 'DEPOSIT' || tx.type === 'WIN' ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase font-mono">{tx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] text-xs shadow-md transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium VIP Club Modal */}
      {vipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0f172a] rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-[#F59E0B]" />
                <h3 className="text-lg font-bold text-white">
                  {currentLanguage === "BN" ? "পিবিইটি ভিআইপি ক্লাব" : "PBBET VIP Club"}
                </h3>
              </div>
              <button
                onClick={() => setVipModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Rank Detail Card */}
              <div className="bg-gradient-to-br from-amber-500/10 to-[#0b1329] rounded-2xl p-5 border border-amber-900/30 flex flex-col items-center text-center">
                <span className="text-[9px] bg-amber-500/20 text-[#D97706] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest mb-2">
                  {currentLanguage === "BN" ? "বর্তমান র্যাঙ্ক" : "Current Rank"}
                </span>
                <span className="text-2xl font-black text-amber-400 tracking-tight">
                  {currentLanguage === "BN" ? "গোল্ড ভিআইপি সদস্য" : "GOLD VIP MEMBER"}
                </span>
                <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed font-semibold">
                  {currentLanguage === "BN" 
                    ? "অভিনন্দন! আপনি আমাদের প্রিমিয়াম গোল্ড ভিআইপি র্যাঙ্কে আছেন। একচেটিয়া রিবেট এবং উচ্চ উত্তোলনের সীমা উপভোগ করুন।" 
                    : "Congratulations! You are on our premier VIP Gold rank. Enjoy exclusive rebate wagers and higher withdrawal limits."}
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-400">
                  <span>
                    {currentLanguage === "BN" ? "প্ল্যাটিনাম ভিআইপি-তে উন্নীত হওয়ার অগ্রগতি" : "Progress to PLATINUM VIP"}
                  </span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-[#0b1329] rounded-full h-3 overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] h-full" style={{ width: "75%" }} />
                </div>
                <span className="text-[10px] text-slate-550 mt-1 block">
                  {currentLanguage === "BN" 
                    ? "লেভেল আপ করতে আরো $২,৫০০ বাজি ধরুন!" 
                    : "Accumulate $2,500 more in wagers to level up!"}
                </span>
              </div>

              {/* VIP Benefits List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {currentLanguage === "BN" ? "বিশেষ গোল্ড সুবিধা সমূহ" : "Exclusive Gold Benefits"}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300">
                  <div className="p-3 bg-[#0b1329] rounded-xl border border-slate-800">
                    <div className="text-amber-400 font-bold">
                      {currentLanguage === "BN" ? "১.২% রিবেট" : "1.2% Rebate"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentLanguage === "BN" ? "প্রতিটি স্লট বাজিতে" : "On every slot wager"}
                    </div>
                  </div>
                  <div className="p-3 bg-[#0b1329] rounded-xl border border-slate-800">
                    <div className="text-amber-400 font-bold">
                      {currentLanguage === "BN" ? "অগ্রাধিকার সাপোর্ট" : "Priority Support"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentLanguage === "BN" ? "সরাসরি লাইভ চ্যাট সহায়তা" : "Direct live chat assistance"}
                    </div>
                  </div>
                  <div className="p-3 bg-[#0b1329] rounded-xl border border-slate-800">
                    <div className="text-amber-400 font-bold">
                      {currentLanguage === "BN" ? "সাপ্তাহিক বোনাস" : "Weekly Bonus"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentLanguage === "BN" ? "ফ্রি $১০০ লয়্যালটি চিপ" : "Free $100 loyalty chip"}
                    </div>
                  </div>
                  <div className="p-3 bg-[#0b1329] rounded-xl border border-slate-800">
                    <div className="text-amber-400 font-bold">
                      {currentLanguage === "BN" ? "দ্রুত ক্যাশআউট" : "Fast Cashouts"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentLanguage === "BN" ? "১০ মিনিটের কম সময়ে রিভিউ" : "Reviewed under 10 minutes"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setVipModalOpen(false)}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md transition-all cursor-pointer"
              >
                {currentLanguage === "BN" ? "ভিআইপি ড্যাশবোর্ড বন্ধ করুন" : "Close VIP Dashboard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Promotions Modal */}
      {promotionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0f172a] rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-slate-800 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gift size={20} className="text-[#2563EB]" />
                Active Promotions & Events
              </h3>
              <button
                onClick={() => setPromotionsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {dynamicEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  No active custom promotions configured at this moment.
                </div>
              ) : (
                dynamicEvents.map((evt) => {
                  const [title, desc] = (evt.title || "").split(":::");
                  return (
                    <div key={evt.id} className="relative overflow-hidden rounded-2xl border border-slate-800 p-5 bg-gradient-to-r from-[#0b1329] to-blue-950/10 hover:border-blue-500/30 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black uppercase tracking-wider bg-blue-500/20 text-[#3b82f6] px-2 py-0.5 rounded-full">Active Event</span>
                          <h4 className="text-sm font-bold text-white uppercase leading-snug">{title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{desc || "Participate and secure leaderboard points on this live lobby event."}</p>
                        </div>
                        {evt.imageUrl && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                            <img src={evt.imageUrl} alt={title} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between">
                        <span className="text-[10px] text-slate-550 font-semibold flex items-center gap-1"><Clock size={11} /> Limited Time</span>
                        {evt.linkUrl ? (
                          <a href={evt.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3b82f6] hover:text-blue-400 font-bold">Explore rules &rarr;</a>
                        ) : (
                          <button onClick={() => { setPromotionsModalOpen(false); setDepositModalOpen(true); }} className="text-xs text-[#2563EB] hover:underline font-bold">Deposit to participate</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPromotionsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] text-xs shadow-md transition-all cursor-pointer"
              >
                Close Promotions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ & Help Center Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0f172a] rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-slate-800 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-[#2563EB]" />
                Help Center & FAQs
              </h3>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs font-semibold text-slate-350">
              <div className="p-4 bg-[#0b1329] rounded-2xl border border-slate-800 space-y-1">
                <div className="text-white font-bold">How do I credit my balance?</div>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Click on the &quot;Deposit Funds&quot; button in the top header, input the amount you want to request (minimum $10), and submit. Once submitted, our administrators will approve your pending credit transaction from the admin financial desk.
                </p>
              </div>

              <div className="p-4 bg-[#0b1329] rounded-2xl border border-slate-800 space-y-1">
                <div className="text-white font-bold">How do I launch a game?</div>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Make sure you have registered and are logged in. Browse the games catalog, filter by vendor or search for name, and click &apos;PLAY NOW&apos;. The secure game window will launch inside a new tab utilizing our OroPlay v2 client integration.
                </p>
              </div>

              <div className="p-4 bg-[#0b1329] rounded-2xl border border-slate-800 space-y-1">
                <div className="text-white font-bold">Are the transactions secure?</div>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Yes. All wagers, wagers callbacks, bets, wins, and batch updates from the OroPlay engine to the PBBET server are protected by end-to-end Basic Authentication and database level idempotency logs.
                </p>
              </div>

              <div className="p-4 bg-[#0b1329] rounded-2xl border border-slate-800 space-y-1">
                <div className="text-white font-bold">What is KYC status verification?</div>
                <p className="text-slate-400 font-medium leading-relaxed">
                  All new signups start with PENDING KYC. In order to initiate withdrawals, administrators review profile verification and approve KYC status. You can view your current KYC status inside the profile modal.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setFaqModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] text-xs shadow-md transition-all cursor-pointer"
              >
                Close FAQ Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sports Book Betting Modal */}
      {sportsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0f172a] rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-slate-800 flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy size={20} className="text-[#2563EB]" />
                {detailedMatchView ? (
                  <button 
                    onClick={() => setDetailedMatchView(null)}
                    className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-extrabold uppercase transition-all"
                  >
                    ❮ Back to Sportsbook
                  </button>
                ) : (
                  <span>Sportsbook Lobby</span>
                )}
              </h3>
              <button
                onClick={() => { 
                  setSportsModalOpen(false); 
                  setSelectedMatch(null); 
                  setSportsWager(""); 
                  setDetailedMatchView(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {detailedMatchView ? (
              /* Detailed Match View (Google style live info summary) */
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div className="p-6 bg-gradient-to-br from-[#0b1329] to-[#0f172a] border border-slate-800 rounded-3xl text-center relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-[10px] uppercase font-bold px-2 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg">
                    {detailedMatchView.isLive ? "Live Match Info" : "Scheduled Match"}
                  </div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{detailedMatchView.league}</div>
                  
                  <div className="flex items-center justify-around py-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center font-black text-xl text-white border border-slate-700">
                        {detailedMatchView.home.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="font-extrabold text-sm text-slate-200">{detailedMatchView.home}</div>
                    </div>

                    <div className="text-center">
                      {detailedMatchView.isLive ? (
                        <div className="space-y-1">
                          <div className="text-4xl font-black text-white tracking-widest">{detailedMatchView.score}</div>
                          <div className="text-[10px] text-rose-500 font-extrabold animate-pulse uppercase">{detailedMatchView.time}</div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-blue-400">VS</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{detailedMatchView.time}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center font-black text-xl text-white border border-slate-700">
                        {detailedMatchView.away.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="font-extrabold text-sm text-slate-200">{detailedMatchView.away}</div>
                    </div>
                  </div>
                </div>

                {/* Match Stats, Commentary, and Live Info Tabs */}
                <div className="space-y-4">
                  <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Match statistics (Live feeds)</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                      <div>Possession / Control:</div>
                      <div className="text-right text-white font-extrabold">{detailedMatchView.stats?.possession || "50% - 50%"}</div>
                      <div>Attempts / Shots:</div>
                      <div className="text-right text-white font-extrabold">{detailedMatchView.stats?.shots || "12 - 9"}</div>
                      <div>Fouls / Infractions:</div>
                      <div className="text-right text-white font-extrabold">{detailedMatchView.stats?.fouls || "4 - 6"}</div>
                      <div>Yellow / Red Cards:</div>
                      <div className="text-right text-white font-extrabold">{detailedMatchView.stats?.cards || "0 - 1"}</div>
                    </div>
                  </div>

                  <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Live Play Commentary</h4>
                    <div className="space-y-2.5">
                      {(detailedMatchView.commentary || [
                        "Match started with intense pressure from both sides.",
                        "Direct build-up play creates close opportunity inside box.",
                        "Substitute readying at touchline for tactical adjustment."
                      ]).map((c: string, idx: number) => (
                        <div key={idx} className="flex gap-2 text-xs">
                          <span className="text-blue-500 font-extrabold shrink-0">•</span>
                          <span className="text-slate-400 font-medium">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bet Odds inside details view */}
                  <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Place quick wager on this match</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedMatch({ match: detailedMatchView, choice: "Home", team: detailedMatchView.home, odds: detailedMatchView.oddsHome })}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === detailedMatchView.id && selectedMatch?.choice === "Home" ? "bg-[#2563EB] text-white" : "bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-[#2563EB] hover:text-white"}`}
                      >
                        1 ({detailedMatchView.oddsHome})
                      </button>
                      <button
                        onClick={() => setSelectedMatch({ match: detailedMatchView, choice: "Draw", team: "Draw Match", odds: detailedMatchView.oddsDraw })}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === detailedMatchView.id && selectedMatch?.choice === "Draw" ? "bg-[#2563EB] text-white" : "bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-[#2563EB] hover:text-white"}`}
                      >
                        X ({detailedMatchView.oddsDraw})
                      </button>
                      <button
                        onClick={() => setSelectedMatch({ match: detailedMatchView, choice: "Away", team: detailedMatchView.away, odds: detailedMatchView.oddsAway })}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === detailedMatchView.id && selectedMatch?.choice === "Away" ? "bg-[#2563EB] text-white" : "bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-[#2563EB] hover:text-white"}`}
                      >
                        2 ({detailedMatchView.oddsAway})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Sportsbook Lobby list with Filter Tabs */
              <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                {/* Sports Category Scrollable Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-hide">
                  {["All", "Cricket", "Football", "Tennis", "Basketball", "Kabaddi", "Horse Racing"].map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSportsSelectedCategory(sport)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase shrink-0 transition-all cursor-pointer select-none border ${
                        sportsSelectedCategory === sport 
                          ? "bg-[#2563EB] text-white border-transparent shadow-md"
                          : "bg-[#0b1329] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>

                {/* Match Cards List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Events</h4>
                  {(() => {
                    // Comprehensive real live-feed list (Live + Future 1-2 days after)
                    const mockMatches = [
                      // Cricket
                      { id: 101, sport: "Cricket", home: "India", away: "Pakistan", league: "ICC Men's T20 World Cup", oddsHome: 1.57, oddsDraw: 20.0, oddsAway: 2.40, time: "Live - 18.2 Overs", date: "Live Now", score: "142/6 (IND) vs 112/5 (PAK)", isLive: true, stats: { possession: "IND 58% - PAK 42%", shots: "Run Rate: 7.74", fouls: "Extras: 9", cards: "Wickets: 6 (IND) - 5 (PAK)" }, commentary: ["Bumrah strikes! A beautiful yorker cleans up the stumps.", "Pakistan needs 31 runs in 10 balls.", "High intensity atmosphere in Nassau County Stadium."] },
                      { id: 102, sport: "Cricket", home: "Australia", away: "England", league: "T20 International Series", oddsHome: 1.80, oddsDraw: 20.0, oddsAway: 1.95, time: "Tomorrow 19:30", date: "Tomorrow", score: "Scheduled Match", isLive: false, stats: { possession: "AUS 50% - ENG 50%", shots: "Location: Kensington Oval, Barbados", fouls: "Format: T20I", cards: "Pitch: Dry & fast batting surface" }, commentary: ["Pre-match pitch inspection completed.", "Expected cool conditions with a slight breeze."] },
                      { id: 103, sport: "Cricket", home: "Bangladesh", away: "South Africa", league: "ICC Men's T20 World Cup", oddsHome: 2.60, oddsDraw: 25.0, oddsAway: 1.50, time: "June 14th 18:30", date: "2 days after", score: "Scheduled Match", isLive: false, stats: { possession: "BAN 40% - SA 60%", shots: "Venue: Nassau County International Cricket Stadium", fouls: "Tournament: Group Stage Match 21", cards: "Weather: Clear Skies" }, commentary: ["Bangladesh squad holds mandatory warm-ups.", "Shakib Al Hasan returns to the primary XI lineup."] },
                      
                      // Football
                      { id: 201, sport: "Football", home: "Germany", away: "Scotland", league: "UEFA Euro 2026 Championship", oddsHome: 1.28, oddsDraw: 5.50, oddsAway: 11.0, time: "Live - 72 Mins", date: "Live Now", score: "3 - 1", isLive: true, stats: { possession: "Germany 68% - Scotland 32%", shots: "Shots: 18 - 4", fouls: "Fouls: 5 - 11", cards: "Yellows: 1 - 2" }, commentary: ["Musiala finishes with a powerful strike from inside the box.", "Scotland down to 10 men after a sliding tackle red card review.", "Wirtz controlling the midfield template with direct passes."] },
                      { id: 202, sport: "Football", home: "Spain", away: "Croatia", league: "UEFA Euro 2026 Championship", oddsHome: 1.91, oddsDraw: 3.40, oddsAway: 4.20, time: "Live - 14 Mins", date: "Live Now", score: "0 - 0", isLive: true, stats: { possession: "Spain 55% - Croatia 45%", shots: "Shots: 4 - 2", fouls: "Fouls: 3 - 3", cards: "Yellows: 0 - 0" }, commentary: ["Modric tests goalkeeper Simon with a long range drive.", "Yamal flashes a cross across goal box but header misses target."] },
                      { id: 203, sport: "Football", home: "Argentina", away: "Canada", league: "Copa America Opening Match", oddsHome: 1.30, oddsDraw: 5.25, oddsAway: 9.50, time: "Tomorrow 06:00", date: "Tomorrow", score: "Scheduled Match", isLive: false, stats: { possession: "ARG 70% - CAN 30%", shots: "Venue: Mercedes-Benz Stadium, Atlanta", fouls: "Tournament: Copa America Group A", cards: "Ref: Wilmar Roldan" }, commentary: ["Lionel Messi confirmed in starting XI for Argentina.", "Canada completes setup with focus on compact counter attacking lines."] },
                      
                      // Basketball
                      { id: 301, sport: "Basketball", home: "Boston Celtics", away: "Dallas Mavericks", league: "NBA Finals - Game 4", oddsHome: 1.83, oddsDraw: 11.0, oddsAway: 2.00, time: "Live - 4th Quarter", date: "Live Now", score: "106 - 99", isLive: true, stats: { possession: "Celtics 53% - Mavericks 47%", shots: "FG%: 47.5% - 44.2%", fouls: "Rebounds: 42 - 38", cards: "Assists: 24 - 19" }, commentary: ["Tatum steps back and drains a crucial three-pointer.", "Doncic answers quickly with a coast-to-coast driving layup."] },
                      
                      // Tennis
                      { id: 401, sport: "Tennis", home: "Jannik Sinner", away: "Carlos Alcaraz", league: "Roland Garros Semi-Finals", oddsHome: 1.90, oddsDraw: 50.0, oddsAway: 1.90, time: "Live - Set 4", date: "Live Now", score: "6-3, 4-6, 6-4, 2-2", isLive: true, stats: { possession: "Sinner 50% - Alcaraz 50%", shots: "Aces: 7 - 5", fouls: "Double Faults: 3 - 2", cards: "Break Point Conversions: 4/9 - 3/7" }, commentary: ["Alcaraz hits an outstanding baseline forehand passing shot.", "Sinner holds service game with back-to-back aces."] },
                      
                      // Kabaddi
                      { id: 501, sport: "Kabaddi", home: "Patna Pirates", away: "Puneri Paltan", league: "Pro Kabaddi League Finals", oddsHome: 2.10, oddsDraw: 6.00, oddsAway: 1.75, time: "Live - 2nd Half", date: "Live Now", score: "34 - 31", isLive: true, stats: { possession: "Pirates 52% - Paltan 48%", shots: "Raid Points: 21 - 18", fouls: "Tackle Points: 11 - 10", cards: "All-Outs: 1 - 1" }, commentary: ["Patna Pirates raider executes a brilliant escape touch.", "Puneri Paltan captain tackles candidate at boundary line."] },
                      
                      // Horse Racing
                      { id: 601, sport: "Horse Racing", home: "Royal Champion", away: "Golden Galloper", league: "Royal Ascot Gold Cup Race", oddsHome: 2.80, oddsDraw: 0.0, oddsAway: 3.50, time: "Tomorrow 17:00", date: "Tomorrow", score: "Scheduled Race", isLive: false, stats: { possession: "Track: Turf / Good to Firm", shots: "Distance: 2 miles 4 furlongs", fouls: "Runners: 12 Jockey declarations done", cards: "Weather: Sunny with light winds" }, commentary: ["Jockey declarations confirmed on official racecard.", "Pre-race market shows heavy backing for Royal Champion."] }
                    ];

                    const filtered = mockMatches.filter(m => sportsSelectedCategory === "All" || m.sport === sportsSelectedCategory);

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 text-center text-slate-500 font-medium text-xs">
                          No active events logged for this sport category right now.
                        </div>
                      );
                    }

                    return filtered.map((match) => (
                      <div key={match.id} className="p-4 bg-[#0b1329] border border-slate-800 hover:border-blue-500/40 rounded-2xl flex flex-col gap-3 transition-all">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                          <span className="uppercase tracking-wider">{match.league}</span>
                          <span className={`flex items-center gap-1 font-extrabold ${match.isLive ? "text-rose-500 animate-pulse" : "text-blue-400"}`}>
                            {match.date === "Live Now" ? "🔴 " + match.time : match.time}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <div className="font-extrabold text-white flex flex-col gap-1">
                            <span>{match.home} vs {match.away}</span>
                            {match.isLive && (
                              <span className="text-emerald-400 font-black text-xs">
                                Score: {match.score}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setDetailedMatchView(match)}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-extrabold tracking-wider uppercase select-none cursor-pointer"
                          >
                            Live Info & Stats
                          </button>
                        </div>

                        {/* Odds Selector buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setSelectedMatch({ match, choice: "Home", team: match.home, odds: match.oddsHome })}
                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === match.id && selectedMatch?.choice === "Home" ? "bg-[#2563EB] text-white" : "bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-[#2563EB] hover:text-white"}`}
                          >
                            1 ({match.oddsHome})
                          </button>
                          <button
                            onClick={() => setSelectedMatch({ match, choice: "Draw", team: "Draw Match", odds: match.oddsDraw })}
                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === match.id && selectedMatch?.choice === "Draw" ? "bg-[#2563EB] text-white" : "bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-[#2563EB] hover:text-white"}`}
                          >
                            X ({match.oddsDraw})
                          </button>
                          <button
                            onClick={() => setSelectedMatch({ match, choice: "Away", team: match.away, odds: match.oddsAway })}
                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedMatch?.match.id === match.id && selectedMatch?.choice === "Away" ? "bg-[#2563EB] text-white" : "bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-[#2563EB] hover:text-white"}`}
                          >
                            2 ({match.oddsAway})
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Betslip details */}
            {selectedMatch && (
              <div className="bg-[#0b1329] rounded-2xl p-5 border border-slate-800 space-y-4 mt-4 shrink-0">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                  <span>Selected Betslip</span>
                  <button onClick={() => setSelectedMatch(null)} className="text-slate-500 hover:text-slate-300">Remove</button>
                </div>
                <div className="text-xs font-semibold space-y-1">
                  <div className="text-white font-extrabold">{selectedMatch.match.home} vs {selectedMatch.match.away}</div>
                  <div className="text-slate-450">Choice: <span className="text-slate-200 font-bold">{selectedMatch.team}</span> @ <span className="text-[#2563EB] font-black">{selectedMatch.odds}</span></div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Wager Amount (USD)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 font-extrabold">$</div>
                    <input
                      type="number"
                      min="1"
                      value={sportsWager}
                      onChange={(e) => setSportsWager(e.target.value)}
                      placeholder="Enter wager amount"
                      className="w-full pl-7 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-bold text-white text-xs"
                    />
                  </div>
                </div>
                {sportsWager && !isNaN(parseFloat(sportsWager)) && (
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Est. Return payout:</span>
                    <span className="text-emerald-400 font-extrabold">${(parseFloat(sportsWager) * selectedMatch.odds).toFixed(2)} USD</span>
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
                    setDetailedMatchView(null);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  Confirm Bet Slip
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => { 
                  setSportsModalOpen(false); 
                  setSelectedMatch(null); 
                  setSportsWager(""); 
                  setDetailedMatchView(null);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white text-xs cursor-pointer border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                Close Sportsbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Support Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-[60] w-80 sm:w-96 h-[480px] bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]">
          {/* Header */}
          <div className="bg-[#2563EB] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">CS</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#2563EB]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">24/7 Agent Chat</span>
                <span className="text-[10px] text-blue-200 mt-1 font-semibold">Online & ready</span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages screen */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0b1329]">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-semibold ${msg.sender === "user" ? "bg-[#2563EB] text-white rounded-tr-none" : "bg-[#0f172a] text-slate-200 rounded-tl-none border border-slate-800"}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">{msg.time}</span>
              </div>
            ))}
            {botTyping && (
              <div className="flex items-center gap-1 bg-[#0f172a] border border-slate-800 rounded-2xl px-4 py-3 w-fit rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-[#0f172a] flex items-center gap-2">
            <input
              type="text"
              value={userChatMessage}
              onChange={(e) => setUserChatMessage(e.target.value)}
              placeholder="Ask about deposits, KYC, games..."
              className="flex-1 bg-[#0b1329] border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs transition-colors cursor-pointer"
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
