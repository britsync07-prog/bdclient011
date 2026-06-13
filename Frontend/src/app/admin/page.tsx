"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gamepad2,
  Settings,
  LogOut,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  AtSign,
  Globe,
  Camera,
  Mail,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Activity,
  Loader2,
  UserCircle,
  Sliders,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Search,
  Building2,
  X,
} from "lucide-react";

import { logClientAction } from "@/lib/logger";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

interface User {
  id: string;
  username: string;
  balance: string | number;
  kycStatus: string;
  role: string;
  createdAt: string;
  nidFront?: string;
  nidBack?: string;
}

interface FinancialRequest {
  id: string;
  type: string;
  userId: string;
  amount: string | number;
  status: string;
  createdAt: string;
  user?: { username: string };
}

interface DBBanner {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  order: number;
}

interface AdminGame {
  id: string;
  gameCode?: string;
  name: string;
  provider: string;
  category: string;
  rating: number;
  isNew?: boolean;
  isPopular?: boolean;
  thumbnail?: string;
  vendorCode?: string;
}

type Tab = "dashboard" | "users" | "financial" | "games" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "financial", label: "Financial Desk", icon: CreditCard },
  { id: "games", label: "Game Manage", icon: Gamepad2 },
  { id: "settings", label: "Site Settings", icon: Settings },
];

const TAB_LABELS: Record<Tab, string> = {
  dashboard: "Dashboard",
  users: "User Management",
  financial: "Financial Desk",
  games: "Game Manage",
  settings: "Site Settings",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [activeKycViewerUser, setActiveKycViewerUser] = useState<User | null>(null);

  interface DashboardStats {
    totalUsers: number;
    pendingKYC: number;
    totalLiquidity: number;
    systemStatus: string;
    todayHighlights: {
      totalPlayers: number;
      refPlayers: number;
      agentPlayers: number;
      agentDepositToday: number;
    };
    financialFlow: { date: string; deposits: number; withdrawals: number }[];
    todayActivity: {
      betsPlacedToday: number;
      activeProviders: number;
    };
  }

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gamesList, setGamesList] = useState<AdminGame[]>([]);
  const [providerSearchQuery, setProviderSearchQuery] = useState("");
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Renaming state
  const [editingProviderName, setEditingProviderName] = useState<string | null>(null);
  const [newProviderNameValue, setNewProviderNameValue] = useState("");
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [newGameNameValue, setNewGameNameValue] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [transactions, setTransactions] = useState<FinancialRequest[]>([]);
  const [banners, setBanners] = useState<DBBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [rtpData, setRtpData] = useState({
    username: "",
    vendorCode: "slot-pragmatic",
    rtp: 90,
  });
  const [settingsData, setSettingsData] = useState({
    about_us: "",
    social_twitter: "",
    social_facebook: "",
    social_instagram: "",
    contact_email: "",
    privacy_policy: "",
    terms_conditions: "",
    responsible_gaming: "",
  });
  const [newBanner, setNewBanner] = useState({
    imageUrl: "",
    linkUrl: "",
    order: 0,
  });
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    order: 0,
  });
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [rtpLoading, setRtpLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const router = useRouter();

  const showToast = (text: string, ok = true) => {
    setToastMsg({ text, ok });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const usersRes = await fetch(`${BACKEND_URL}/admin/users?limit=10000`, { headers });
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      const statsRes = await fetch(`${BACKEND_URL}/admin/dashboard-stats`, { headers });
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setDashboardStats(statsJson.data);
      }

      const transRes = await fetch(`${BACKEND_URL}/admin/financial-requests`, {
        headers,
      });
      const transData = await transRes.json();
      setTransactions(Array.isArray(transData) ? transData : (transData.requests || []));

      const settingsRes = await fetch(`${BACKEND_URL}/admin/settings`, {
        headers,
      });
      const settingsJson = await settingsRes.json();
      if (settingsJson.success) {
        setSettingsData((prev) => ({ ...prev, ...settingsJson.data }));
      }

      const bannersRes = await fetch(`${BACKEND_URL}/admin/banners`, {
        headers,
      });
      const bannersJson = await bannersRes.json();
      if (bannersJson.success) {
        setBanners(bannersJson.data || []);
      }

      const gamesRes = await fetch(`${BACKEND_URL}/admin/games`, { headers });
      const gamesJson = await gamesRes.json();
      if (gamesJson.success) {
        setGamesList(gamesJson.games || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!isAdmin || !user || user.role !== "ADMIN") {
      router.push("/admin/login");
    } else {
      setAdminName(user.username || "Admin");
      fetchData();
    }
  }, [router, fetchData]);

  const handleSetRTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setRtpLoading(true);
    logClientAction("Admin Set RTP Submit", rtpData);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/game/set-rtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rtpData),
      });
      const data = await res.json();
      if (res.ok) {
        logClientAction("Admin Set RTP Success", rtpData);
        showToast(data.message || "RTP updated successfully", true);
      } else {
        logClientAction("Admin Set RTP Fail", { ...rtpData, error: data.message });
        showToast("Failed to update RTP", false);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Admin Set RTP Error", { ...rtpData, error: errMsg });
      showToast("Failed to update RTP", false);
    } finally {
      setRtpLoading(false);
    }
  };

  const handleRenameProvider = async (oldName: string) => {
    if (!newProviderNameValue.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/providers`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldName, newName: newProviderNameValue.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Provider renamed successfully", true);
        setEditingProviderName(null);
        setNewProviderNameValue("");
        setGamesList((prev) =>
          prev.map((g) =>
            g.provider.toLowerCase() === oldName.toLowerCase()
              ? { ...g, provider: newProviderNameValue.trim() }
              : g
          )
        );
        if (selectedProvider?.toLowerCase() === oldName.toLowerCase()) {
          setSelectedProvider(newProviderNameValue.trim());
        }
      } else {
        showToast(data.message || "Failed to rename provider", false);
      }
    } catch (err) {
      showToast("Failed to rename provider", false);
    }
  };

  const handleDeleteProvider = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} and all its games?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/providers/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Provider deleted successfully", true);
        setGamesList((prev) =>
          prev.filter((g) => g.provider.toLowerCase() !== name.toLowerCase())
        );
        if (selectedProvider?.toLowerCase() === name.toLowerCase()) {
          setSelectedProvider(null);
        }
      } else {
        showToast(data.message || "Failed to delete provider", false);
      }
    } catch (err) {
      showToast("Failed to delete provider", false);
    }
  };

  const handleRenameGame = async (gameId: string) => {
    if (!newGameNameValue.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/games/${gameId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGameNameValue.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Game renamed successfully", true);
        setEditingGameId(null);
        setNewGameNameValue("");
        setGamesList((prev) =>
          prev.map((g) =>
            g.id === gameId ? { ...g, name: newGameNameValue.trim() } : g
          )
        );
      } else {
        showToast(data.message || "Failed to rename game", false);
      }
    } catch (err) {
      showToast("Failed to rename game", false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Game deleted successfully", true);
        setGamesList((prev) => prev.filter((g) => g.id !== gameId));
      } else {
        showToast(data.message || "Failed to delete game", false);
      }
    } catch (err) {
      showToast("Failed to delete game", false);
    }
  };

  const handleSyncGames = async () => {
    setSyncLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/games/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Synced from Oroplay successfully", true);
        if (data.games) {
          setGamesList(data.games);
        }
        setSelectedProvider(null);
      } else {
        showToast(data.message || "Failed to sync games from Oroplay", false);
      }
    } catch (err) {
      showToast("Failed to sync games from Oroplay", false);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleUpdateKYC = async (userId: string, status: string) => {
    logClientAction("Admin Update KYC Submit", { userId, status });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/kyc`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kycStatus: status }),
      });
      if (res.ok) {
        logClientAction("Admin Update KYC Success", { userId, status });
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, kycStatus: status } : u))
        );
        fetchData();
        showToast(`KYC ${status.toLowerCase()} successfully`, true);
      } else {
        const data = await res.json();
        logClientAction("Admin Update KYC Fail", { userId, status, error: data.message });
        showToast("Failed to update KYC", false);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Admin Update KYC Error", { userId, status, error: errMsg });
      showToast("Failed to update KYC", false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    logClientAction("Admin Update Settings Submit", settingsData);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (data.success) {
        logClientAction("Admin Update Settings Success", settingsData);
        showToast("Settings updated successfully", true);
      } else {
        logClientAction("Admin Update Settings Fail", { ...settingsData, error: data.message });
        showToast("Failed to update settings", false);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Admin Update Settings Error", { ...settingsData, error: errMsg });
      showToast("Error updating settings", false);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleApproveFinance = async (id: string) => {
    logClientAction("Admin Approve Finance Submit", { id });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACKEND_URL}/admin/financial-requests/${id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        logClientAction("Admin Approve Finance Success", { id });
        fetchData();
        showToast("Request approved successfully", true);
      } else {
        const data = await res.json();
        logClientAction("Admin Approve Finance Fail", { id, error: data.message });
        showToast("Failed to approve request", false);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Admin Approve Finance Error", { id, error: errMsg });
      showToast("Failed to approve request", false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.imageUrl) {
      showToast("Banner image URL is required", false);
      return;
    }
    setBannerLoading(true);
    logClientAction("Admin Add/Update Banner Submit", { editingBannerId, newBanner });
    try {
      const token = localStorage.getItem("token");
      const url = editingBannerId 
        ? `${BACKEND_URL}/admin/banners/${editingBannerId}`
        : `${BACKEND_URL}/admin/banners`;
      const method = editingBannerId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: newBanner.imageUrl,
          linkUrl: newBanner.linkUrl || null,
          title: null,
          order: Number(newBanner.order) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        logClientAction("Admin Add/Update Banner Success", { editingBannerId, newBanner });
        showToast(editingBannerId ? "Banner updated successfully" : "Banner created successfully", true);
        setNewBanner({ imageUrl: "", linkUrl: "", order: 0 });
        setEditingBannerId(null);
        const bannersRes = await fetch(`${BACKEND_URL}/admin/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bannersJson = await bannersRes.json();
        if (bannersJson.success) setBanners(bannersJson.data || []);
      } else {
        logClientAction("Admin Add/Update Banner Fail", { editingBannerId, newBanner, error: data.message });
        showToast(data.message || (editingBannerId ? "Failed to update banner" : "Failed to add banner"), false);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Admin Add/Update Banner Error", { editingBannerId, newBanner, error: errMsg });
      showToast(editingBannerId ? "Error updating banner" : "Error adding banner", false);
    } finally {
      setBannerLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) {
      showToast("Event title is required", false);
      return;
    }
    if (!newEvent.imageUrl) {
      showToast("Event image URL is required", false);
      return;
    }
    setBannerLoading(true);
    logClientAction("Admin Add/Update Event Submit", { editingEventId, newEvent });
    try {
      const token = localStorage.getItem("token");
      const url = editingEventId 
        ? `${BACKEND_URL}/admin/banners/${editingEventId}`
        : `${BACKEND_URL}/admin/banners`;
      const method = editingEventId ? "PUT" : "POST";
      
      const combinedTitle = newEvent.title + (newEvent.description ? `:::${newEvent.description}` : "");

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: newEvent.imageUrl,
          linkUrl: newEvent.linkUrl || null,
          title: combinedTitle,
          order: Number(newEvent.order) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        logClientAction("Admin Add/Update Event Success", { editingEventId, newEvent });
        showToast(editingEventId ? "Event updated successfully" : "Event created successfully", true);
        setNewEvent({ title: "", description: "", imageUrl: "", linkUrl: "", order: 0 });
        setEditingEventId(null);
        const bannersRes = await fetch(`${BACKEND_URL}/admin/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bannersJson = await bannersRes.json();
        if (bannersJson.success) setBanners(bannersJson.data || []);
      } else {
        logClientAction("Admin Add/Update Event Fail", { editingEventId, newEvent, error: data.message });
        showToast(data.message || (editingEventId ? "Failed to update event" : "Failed to add event"), false);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Admin Add/Update Event Error", { editingEventId, newEvent, error: errMsg });
      showToast(editingEventId ? "Error updating event" : "Error adding event", false);
    } finally {
      setBannerLoading(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    logClientAction("Admin Delete Banner Submit", { id });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        logClientAction("Admin Delete Banner Success", { id });
        showToast("Banner deleted successfully", true);
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        logClientAction("Admin Delete Banner Fail", { id });
        showToast("Failed to delete banner", false);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logClientAction("Admin Delete Banner Error", { id, error: errMsg });
      showToast("Error deleting banner", false);
    }
  };

  const handleLogout = () => {
    logClientAction("Admin Logout");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  const totalLiquidity = users
    .reduce((acc, u) => acc + parseFloat(u.balance as string || "0"), 0)
    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pendingKYC = users.filter((u) => u.kycStatus === "PENDING").length;

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 ${
            toastMsg.ok
              ? "bg-white border-emerald-200 text-emerald-700"
              : "bg-white border-red-200 text-red-600"
          }`}
        >
          {toastMsg.ok ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          {toastMsg.text}
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 bg-white border-r border-slate-200 shadow-sm flex flex-col z-50">
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#E11D48] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tight">PB</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-[#0F172A] tracking-tight leading-none">
                PBBET
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Main
          </p>
          {NAV_ITEMS.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-label={`Go to ${label}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === id
                  ? "bg-[#E11D48]/10 text-[#E11D48] border-l-4 border-[#E11D48] pl-3"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A] border-l-4 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}

          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-3 pt-4 border-t border-slate-100">
            Operations
          </p>
          {NAV_ITEMS.slice(2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-label={`Go to ${label}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === id
                  ? "bg-[#E11D48]/10 text-[#E11D48] border-l-4 border-[#E11D48] pl-3"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A] border-l-4 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-[#E11D48]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0F172A] truncate">{adminName}</p>
              <p className="text-[10px] text-slate-400 font-medium">প্রশাসক</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-red-100 hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>PBBET Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#0F172A] font-semibold">
                {TAB_LABELS[activeTab]}
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] mt-0.5 tracking-tight">
              {TAB_LABELS[activeTab]}
            </h2>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            aria-label="Refresh data"
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer shadow-sm shadow-blue-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-10 h-10 text-[#E11D48] animate-spin" />
              <p className="text-slate-500 font-medium">Loading data…</p>
            </div>
          ) : (
            <>
              {/* ── Dashboard Tab ── */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  {/* Main Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Users"
                      value={dashboardStats ? dashboardStats.totalUsers : users.length}
                      icon={Users}
                      accentColor="#E11D48"
                      bgColor="bg-rose-50"
                      textColor="text-[#E11D48]"
                    />
                    <StatCard
                      title="Pending KYC"
                      value={dashboardStats ? dashboardStats.pendingKYC : pendingKYC}
                      icon={AlertCircle}
                      accentColor="#F59E0B"
                      bgColor="bg-amber-50"
                      textColor="text-amber-500"
                    />
                    <StatCard
                      title="Total Liquidity"
                      value={`৳${dashboardStats ? dashboardStats.totalLiquidity.toLocaleString("en-US", { minimumFractionDigits: 2 }) : totalLiquidity}`}
                      icon={DollarSign}
                      accentColor="#2563EB"
                      bgColor="bg-blue-50"
                      textColor="text-blue-600"
                    />
                    <StatCard
                      title="System Status"
                      value={dashboardStats ? dashboardStats.systemStatus : "Live"}
                      icon={Activity}
                      accentColor="#10B981"
                      bgColor="bg-emerald-50"
                      textColor="text-emerald-600"
                    />
                  </div>

                  {/* Today's Highlights & Today's Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Highlights */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                      <h3 className="text-lg font-bold text-[#0F172A]">Today&apos;s Highlights</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-medium">Total Players</span>
                          <span className="text-2xl font-bold text-[#0F172A]">{dashboardStats ? dashboardStats.todayHighlights.totalPlayers : 0}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-medium">Ref Players</span>
                          <span className="text-2xl font-bold text-[#0F172A]">{dashboardStats ? dashboardStats.todayHighlights.refPlayers : 0}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-medium">Agent Players</span>
                          <span className="text-2xl font-bold text-[#0F172A]">{dashboardStats ? dashboardStats.todayHighlights.agentPlayers : 0}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-medium">Agent Deposit of the Day</span>
                          <span className="text-2xl font-bold text-emerald-600">৳{(dashboardStats ? dashboardStats.todayHighlights.agentDepositToday : 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Today's Activity */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                      <h3 className="text-lg font-bold text-[#0F172A]">Today&apos;s Activity</h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex justify-between items-center">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 font-medium">Bets Placed Today</span>
                            <span className="text-xl font-bold text-[#0F172A]">{dashboardStats ? dashboardStats.todayActivity.betsPlacedToday : 0}</span>
                          </div>
                          <Activity className="h-8 w-8 text-blue-500 opacity-60" />
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex justify-between items-center">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 font-medium">Active Providers</span>
                            <span className="text-xl font-bold text-[#0F172A]">{dashboardStats ? dashboardStats.todayActivity.activeProviders : 0}</span>
                          </div>
                          <Users className="h-8 w-8 text-emerald-500 opacity-60" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Flow (Last 7 Days) */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-[#0F172A]">Financial Flow (Last 7 Days)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Deposits</th>
                            <th className="px-6 py-4">Withdrawals</th>
                            <th className="px-6 py-4">Net Flow</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {dashboardStats ? dashboardStats.financialFlow.map((flow, idx) => {
                            const netFlow = flow.deposits - flow.withdrawals;
                            return (
                              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-4 font-semibold text-[#0F172A]">{flow.date}</td>
                                <td className="px-6 py-4 text-emerald-600 font-mono font-semibold">৳{flow.deposits.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                <td className="px-6 py-4 text-rose-600 font-mono font-semibold">৳{flow.withdrawals.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                <td className={`px-6 py-4 font-mono font-bold ${netFlow >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                  {netFlow >= 0 ? "+" : ""}৳{netFlow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          }) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">No financial flow data available.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Users Tab ── */}
              {activeTab === "users" && (() => {
                const filteredUsers = users.filter((u) =>
                  u.username.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-[#0F172A] text-base">All Users</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full">
                          {searchQuery
                            ? `${filteredUsers.length} matched / ${users.length} total`
                            : `${users.length} total`}
                        </span>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search username..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full bg-slate-50/50 hover:bg-slate-50 transition-colors text-black"
                        />
                      </div>
                    </div>
                    {filteredUsers.length === 0 ? (
                      <EmptyState message="No users match your search." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                              <th className="px-6 py-4">খেলোয়াড়</th>
                              <th className="px-6 py-4">ব্যালেন্স</th>
                              <th className="px-6 py-4">Documents</th>
                              <th className="px-6 py-4">KYC Status</th>
                              <th className="px-6 py-4 text-right">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user, i) => {
                              const colors = [
                                "bg-rose-100 text-[#E11D48]",
                                "bg-blue-100 text-blue-600",
                                "bg-emerald-100 text-emerald-600",
                                "bg-amber-100 text-amber-600",
                                "bg-cyan-100 text-cyan-600",
                              ];
                              const avatarColor = colors[i % colors.length];
                              return (
                                <tr
                                  key={user.id}
                                  className="hover:bg-slate-50/70 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm uppercase ${avatarColor}`}
                                      >
                                        {user.username[0]}
                                      </div>
                                      <span className="font-semibold text-[#0F172A]">
                                        {user.username}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono font-semibold text-[#0F172A]">
                                    ৳{parseFloat(user.balance as string || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-6 py-4">
                                    {user.nidFront || user.nidBack ? (
                                      <div className="flex items-center gap-2">
                                        {user.nidFront && (
                                          <div
                                            onClick={() => setActiveKycViewerUser(user)}
                                            className="cursor-pointer group relative w-10 h-7 rounded border border-slate-200 overflow-hidden bg-slate-100 hover:border-indigo-500 transition-all hover:scale-105"
                                            title="Click to view front side"
                                          >
                                            <img
                                              src={user.nidFront.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${user.nidFront}` : user.nidFront}
                                              alt="Front"
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        )}
                                        {user.nidBack && (
                                          <div
                                            onClick={() => setActiveKycViewerUser(user)}
                                            className="cursor-pointer group relative w-10 h-7 rounded border border-slate-200 overflow-hidden bg-slate-100 hover:border-indigo-500 transition-all hover:scale-105"
                                            title="Click to view back side"
                                          >
                                            <img
                                              src={user.nidBack.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${user.nidBack}` : user.nidBack}
                                              alt="Back"
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-xs italic">No Documents</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <KycBadge status={user.kycStatus} />
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    {user.kycStatus === "PENDING" ? (
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() =>
                                            handleUpdateKYC(user.id, "APPROVED")
                                          }
                                          aria-label={`Approve KYC for ${user.username}`}
                                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" />
                                          Approve
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleUpdateKYC(user.id, "REJECTED")
                                          }
                                          aria-label={`Reject KYC for ${user.username}`}
                                          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                          Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-slate-300 text-xs font-medium">—</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Financial Tab ── */}
              {activeTab === "financial" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#0F172A] text-base">
                      Financial Requests
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full">
                      {transactions.length} requests
                    </span>
                  </div>
                  {transactions.length === 0 ? (
                    <EmptyState message="No pending financial requests." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">ধরণ</th>
                            <th className="px-6 py-4">ইউজার</th>
                            <th className="px-6 py-4">পরিমাণ</th>
                            <th className="px-6 py-4">অবস্থা</th>
                            <th className="px-6 py-4 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {transactions.map((tx) => (
                            <tr
                              key={tx.id}
                              className="hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                    tx.type === "DEPOSIT"
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-medium">
                                {tx.user?.username || tx.userId}
                              </td>
                              <td className="px-6 py-4 font-mono font-semibold text-[#0F172A]">
                                ${parseFloat(tx.amount as string || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                    tx.status === "APPROVED"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : tx.status === "REJECTED"
                                      ? "bg-red-50 text-red-500"
                                      : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {tx.status === "PENDING" ? (
                                  <button
                                    onClick={() => handleApproveFinance(tx.id)}
                                    aria-label={`Approve financial request ${tx.id}`}
                                    className="flex items-center gap-1.5 ml-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approve
                                  </button>
                                ) : (
                                  <span className="text-slate-300 text-xs font-medium">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Games / RTP Tab ── */}
              {activeTab === "games" && (() => {
                const uniqueProviders = (() => {
                  const map = new Map();
                  gamesList.forEach((g) => {
                    const prov = g.provider || "Unknown";
                    map.set(prov, (map.get(prov) || 0) + 1);
                  });
                  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
                })();

                const filteredProviders = uniqueProviders.filter((p) =>
                  p.name.toLowerCase().includes(providerSearchQuery.toLowerCase())
                );

                const filteredGamesList = selectedProvider
                  ? gamesList.filter(
                      (g) =>
                        g.provider.toLowerCase() === selectedProvider.toLowerCase() &&
                        g.name.toLowerCase().includes(gameSearchQuery.toLowerCase())
                    )
                  : [];

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
                    {/* Left Pane (1/3 width): RTP Config & Providers */}
                    <div className="lg:col-span-1 space-y-8">
                      {/* RTP Config Card */}
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-[#E11D48]/10 rounded-xl flex items-center justify-center">
                            <Sliders className="w-5 h-5 text-[#E11D48]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#0F172A] text-base">
                              RTP Configuration
                            </h3>
                            <p className="text-xs text-slate-400">
                              Set return-to-player percentage per vendor
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSetRTP} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                              Target Player ID
                            </label>
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-all placeholder:text-slate-300 text-black"
                              placeholder="Enter username"
                              value={rtpData.username}
                              onChange={(e) =>
                                setRtpData({ ...rtpData, username: e.target.value })
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                              Game Vendor
                            </label>
                            <select
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-all cursor-pointer text-black"
                              value={rtpData.vendorCode}
                              onChange={(e) =>
                                setRtpData({ ...rtpData, vendorCode: e.target.value })
                              }
                            >
                              <option value="slot-pragmatic">Pragmatic Play</option>
                              <option value="mini-crash">Mini Crash</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                RTP Level
                              </label>
                              <div className="bg-[#E11D48]/10 text-[#E11D48] font-black text-base px-3 py-0.5 rounded-lg text-center">
                                {rtpData.rtp}%
                              </div>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="99"
                              className="w-full accent-[#E11D48] cursor-pointer h-2"
                              value={rtpData.rtp}
                              onChange={(e) =>
                                setRtpData({
                                  ...rtpData,
                                  rtp: parseInt(e.target.value),
                                })
                              }
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                              <span>30%</span>
                              <span>99%</span>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={rtpLoading}
                            aria-label="Apply RTP settings"
                            className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs shadow-sm shadow-rose-200 mt-2"
                          >
                            {rtpLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                            {rtpLoading ? "Syncing…" : "Sync to Provider"}
                          </button>
                        </form>
                      </div>

                      {/* Providers Card */}
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-[#0F172A] text-base">Providers</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSyncGames}
                              disabled={syncLoading}
                              className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 disabled:opacity-60 font-semibold px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer"
                            >
                              <RefreshCw className={`w-3 h-3 ${syncLoading ? "animate-spin" : ""}`} />
                              Sync Oroplay
                            </button>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                              {uniqueProviders.length}
                            </span>
                          </div>
                        </div>

                        {/* Provider Search Bar */}
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search providers..."
                            value={providerSearchQuery}
                            onChange={(e) => setProviderSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full bg-slate-50/50 hover:bg-slate-50 transition-colors text-black"
                          />
                        </div>

                        {/* Providers List Scrollable */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {filteredProviders.length === 0 ? (
                            <div className="text-center py-8 text-xs text-slate-400 font-medium">No providers found.</div>
                          ) : (
                            filteredProviders.map((provider) => {
                              const isSelected = selectedProvider?.toLowerCase() === provider.name.toLowerCase();
                              const isEditing = editingProviderName === provider.name;

                              return (
                                <div
                                  key={provider.name}
                                  onClick={() => {
                                    if (!isEditing) setSelectedProvider(provider.name);
                                  }}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                    isSelected
                                      ? "bg-rose-50/80 border-rose-200 text-[#E11D48]"
                                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  {isEditing ? (
                                    <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="text"
                                        value={newProviderNameValue}
                                        onChange={(e) => setNewProviderNameValue(e.target.value)}
                                        className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black bg-white w-full"
                                        placeholder="New name..."
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleRenameProvider(provider.name)}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 text-[10px] font-bold"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingProviderName(null);
                                          setNewProviderNameValue("");
                                        }}
                                        className="bg-slate-300 hover:bg-slate-400 text-slate-700 rounded p-1 text-[10px] font-bold"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-xs truncate max-w-[120px]">{provider.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{provider.count} games</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProviderName(provider.name);
                                            setNewProviderNameValue(provider.name);
                                          }}
                                          aria-label={`Rename provider ${provider.name}`}
                                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProvider(provider.name);
                                          }}
                                          aria-label={`Delete provider ${provider.name}`}
                                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Pane (2/3 width): Games Catalog */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[770px]">
                      {selectedProvider ? (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4 flex-wrap">
                            <div className="flex flex-col gap-0.5">
                              <h3 className="font-bold text-[#0F172A] text-base">
                                Games by <span className="text-[#E11D48] font-extrabold">{selectedProvider}</span>
                              </h3>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Showing {filteredGamesList.length} of {gamesList.filter(g => g.provider.toLowerCase() === selectedProvider.toLowerCase()).length} games
                              </span>
                            </div>

                            {/* Game Search Bar */}
                            <div className="relative w-full sm:w-60">
                              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search games..."
                                value={gameSearchQuery}
                                onChange={(e) => setGameSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full bg-slate-50/50 hover:bg-slate-50 transition-colors text-black"
                              />
                            </div>
                          </div>

                          {/* Games Table List */}
                          <div className="flex-1 overflow-y-auto pr-1">
                            {filteredGamesList.length === 0 ? (
                              <div className="text-center py-12 text-xs text-slate-400 font-medium">
                                No games match your search criteria.
                              </div>
                            ) : (
                              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                                      <th className="px-4 py-3">Thumbnail</th>
                                      <th className="px-4 py-3">Game Name</th>
                                      <th className="px-4 py-3">Game Code</th>
                                      <th className="px-4 py-3">Category</th>
                                      <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {filteredGamesList.map((game) => {
                                      const isEditing = editingGameId === game.id;
                                      return (
                                        <tr key={game.id} className="hover:bg-slate-50/30 transition-colors">
                                          <td className="px-4 py-2.5">
                                            {game.thumbnail ? (
                                              <img
                                                src={game.thumbnail}
                                                alt={game.name}
                                                className="w-10 h-7 rounded object-cover border border-slate-100"
                                              />
                                            ) : (
                                              <div className="w-10 h-7 rounded bg-slate-100 border border-slate-100 flex items-center justify-center">
                                                <Gamepad2 className="w-4 h-4 text-slate-400" />
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-4 py-2.5 font-semibold text-slate-700">
                                            {isEditing ? (
                                              <div className="flex items-center gap-1.5 w-full">
                                                <input
                                                  type="text"
                                                  value={newGameNameValue}
                                                  onChange={(e) => setNewGameNameValue(e.target.value)}
                                                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black bg-white w-full"
                                                  placeholder="New game name..."
                                                  autoFocus
                                                />
                                                <button
                                                  onClick={() => handleRenameGame(game.id)}
                                                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 text-[10px] font-bold"
                                                >
                                                  Save
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setEditingGameId(null);
                                                    setNewGameNameValue("");
                                                  }}
                                                  className="bg-slate-300 hover:bg-slate-400 text-slate-700 rounded p-1 text-[10px] font-bold"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <span>{game.name}</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">
                                            {game.gameCode || "—"}
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full uppercase">
                                              {game.category}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5 text-right">
                                            {!isEditing && (
                                              <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                  onClick={() => {
                                                    setEditingGameId(game.id);
                                                    setNewGameNameValue(game.name);
                                                  }}
                                                  aria-label={`Rename game ${game.name}`}
                                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded transition-colors"
                                                >
                                                  <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteGame(game.id)}
                                                  aria-label={`Delete game ${game.name}`}
                                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded transition-colors"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                          <Gamepad2 className="w-12 h-12 text-slate-200" />
                          <div className="text-center">
                            <h4 className="font-semibold text-slate-600 text-sm">Select a Provider</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                              Choose a provider from the directory on the left to review and manage its catalog of games.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── Settings / CMS Tab ── */}
              {activeTab === "settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Form: Settings */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Settings className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0F172A] text-base">
                          Site Settings
                        </h3>
                        <p className="text-xs text-slate-400">
                          Update public-facing configurations and social links
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateSettings} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          About Us Text
                        </label>
                        <textarea
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all resize-none"
                          rows={4}
                          placeholder="Describe your platform…"
                          value={settingsData.about_us}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              about_us: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          <AtSign className="w-3.5 h-3.5 text-sky-400" />
                          Twitter / X Link
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder:text-slate-300"
                          placeholder="https://twitter.com/yourhandle"
                          value={settingsData.social_twitter}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              social_twitter: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          Facebook Link
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder:text-slate-300"
                          placeholder="https://facebook.com/yourpage"
                          value={settingsData.social_facebook}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              social_facebook: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          <Camera className="w-3.5 h-3.5 text-pink-500" />
                          Instagram Link
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder:text-slate-300"
                          placeholder="https://instagram.com/yourhandle"
                          value={settingsData.social_instagram}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              social_instagram: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          Contact Email
                        </label>
                        <input
                          type="email"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder:text-slate-300"
                          placeholder="support@pbbet.com"
                          value={settingsData.contact_email}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              contact_email: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Privacy Policy Text
                        </label>
                        <textarea
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all resize-none"
                          rows={4}
                          placeholder="Enter your platform's privacy policy text..."
                          value={settingsData.privacy_policy}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              privacy_policy: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Terms & Conditions Text
                        </label>
                        <textarea
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all resize-none"
                          rows={4}
                          placeholder="Enter your platform's terms & conditions text..."
                          value={settingsData.terms_conditions}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              terms_conditions: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Responsible Gaming Text
                        </label>
                        <textarea
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all resize-none"
                          rows={4}
                          placeholder="Enter responsible gaming warnings and guidelines..."
                          value={settingsData.responsible_gaming}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              responsible_gaming: e.target.value,
                            })
                          }
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm shadow-sm shadow-blue-200 mt-2"
                      >
                        {settingsLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Settings className="w-4 h-4" />
                        )}
                        {settingsLoading ? "Saving…" : "Save Settings"}
                      </button>
                    </form>
                  </div>

                  {/* Right Panel: Lobby Banner & Events Management */}
                  <div className="space-y-6">
                    {/* 1. Lobby Banners Manager */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-[#E11D48]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0F172A] text-base">
                            Lobby Carousel Banners
                          </h3>
                          <p className="text-xs text-slate-400">
                            Upload clean image banners for the lobby rotation (no text/titles)
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAddBanner} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Banner Image URL
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-all placeholder:text-slate-300"
                            placeholder="https://domain.com/banner.jpg"
                            value={newBanner.imageUrl}
                            onChange={(e) =>
                              setNewBanner({ ...newBanner, imageUrl: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Redirection Link URL
                          </label>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-all placeholder:text-slate-300"
                            placeholder="https://pbbet.com/slots"
                            value={newBanner.linkUrl}
                            onChange={(e) =>
                              setNewBanner({ ...newBanner, linkUrl: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                              Sorting Order
                            </label>
                            <input
                              type="number"
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-all"
                              value={newBanner.order}
                              onChange={(e) =>
                                setNewBanner({ ...newBanner, order: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                          <button
                            type="submit"
                            disabled={bannerLoading}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm shadow-sm shadow-rose-200"
                          >
                            {bannerLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : editingBannerId ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            {bannerLoading ? (editingBannerId ? "Updating…" : "Creating…") : (editingBannerId ? "Update Banner" : "Publish Lobby Banner")}
                          </button>
                          {editingBannerId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBannerId(null);
                                setNewBanner({ imageUrl: "", linkUrl: "", order: 0 });
                              }}
                              className="px-5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 font-bold transition-all text-sm cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Active Banners Catalog list */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-4">
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Active Banners Slider ({banners.filter((b) => !b.title).length})
                      </h4>
                      {banners.filter((b) => !b.title).length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium py-4">
                          No active image-only lobby banners configured.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {banners.filter((b) => !b.title).map((banner) => (
                            <div
                              key={banner.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                            >
                              <div className="w-16 h-10 relative bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                <img
                                  src={banner.imageUrl}
                                  alt="Banner thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#0F172A] truncate">
                                  Order {banner.order} banner
                                </p>
                                <p className="text-[10px] text-slate-400 truncate font-medium">
                                  Redirects to: {banner.linkUrl || "No Redirect"}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingBannerId(banner.id);
                                    setNewBanner({
                                      imageUrl: banner.imageUrl || "",
                                      linkUrl: banner.linkUrl || "",
                                      order: banner.order || 0,
                                    });
                                  }}
                                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#E11D48] hover:border-rose-200 transition-all cursor-pointer"
                                  title="Edit Banner"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBanner(banner.id)}
                                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                                  title="Delete banner"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Promotional Events Manager */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Plus className="w-5 h-5 text-[#2563EB]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0F172A] text-base">
                            Promotional Events
                          </h3>
                          <p className="text-xs text-slate-400">
                            Create dynamic custom events and stakeholder promo tiles with headers
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAddEvent} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Event Title / Promo Header
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-300"
                            placeholder="e.g. STAKE DE DEALER"
                            value={newEvent.title}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, title: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Event Description / Details (Optional)
                          </label>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-300"
                            placeholder="e.g. Earn rewards and boost wagers. Wager to secure leaderboard points."
                            value={newEvent.description}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, description: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Event Image/BG URL
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-300"
                            placeholder="https://domain.com/promo-bg.jpg"
                            value={newEvent.imageUrl}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, imageUrl: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Explore Event Link URL
                          </label>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-300"
                            placeholder="https://pbbet.com/promo-rules"
                            value={newEvent.linkUrl}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, linkUrl: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                              Sorting Order
                            </label>
                            <input
                              type="number"
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                              value={newEvent.order}
                              onChange={(e) =>
                                setNewEvent({ ...newEvent, order: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                          <button
                            type="submit"
                            disabled={bannerLoading}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm shadow-sm shadow-blue-200"
                          >
                            {bannerLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : editingEventId ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            {bannerLoading ? (editingEventId ? "Updating…" : "Creating…") : (editingEventId ? "Update Event" : "Publish Event")}
                          </button>
                          {editingEventId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEventId(null);
                                setNewEvent({ title: "", description: "", imageUrl: "", linkUrl: "", order: 0 });
                              }}
                              className="px-5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 font-bold transition-all text-sm cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Active Events Catalog list */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-4">
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Active Promotional Events ({banners.filter((b) => b.title).length})
                      </h4>
                      {banners.filter((b) => b.title).length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium py-4">
                          No active custom promotional events configured.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {banners.filter((b) => b.title).map((banner) => (
                            <div
                              key={banner.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                            >
                              <div className="w-16 h-10 relative bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                <img
                                  src={banner.imageUrl}
                                  alt="Event thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#0F172A] truncate">
                                  {banner.title ? banner.title.split(":::")[0] : ""} (Order {banner.order})
                                </p>
                                <p className="text-[10px] text-slate-400 truncate font-medium">
                                  Redirects to: {banner.linkUrl || "No Redirect"}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingEventId(banner.id);
                                    const [parsedTitle, parsedDesc] = (banner.title || "").split(":::");
                                    setNewEvent({
                                      title: parsedTitle || "",
                                      description: parsedDesc || "",
                                      imageUrl: banner.imageUrl || "",
                                      linkUrl: banner.linkUrl || "",
                                      order: banner.order || 0,
                                    });
                                  }}
                                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer"
                                  title="Edit Event"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBanner(banner.id)}
                                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* KYC NID Inspection Modal */}
      {activeKycViewerUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-[#0F172A] text-lg">
                  KYC Document Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reviewing documents for player: <span className="font-semibold text-indigo-600">{activeKycViewerUser.username}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveKycViewerUser(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Documents */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    NID Card Front Side
                  </span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-2 min-h-[250px]">
                    {activeKycViewerUser.nidFront ? (
                      <img
                        src={activeKycViewerUser.nidFront.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${activeKycViewerUser.nidFront}` : activeKycViewerUser.nidFront}
                        alt="NID Front"
                        className="max-h-[350px] object-contain rounded-lg w-full"
                      />
                    ) : (
                      <span className="text-slate-400 text-sm italic">Front photo not uploaded</span>
                    )}
                  </div>
                </div>

                {/* Back Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    NID Card Back Side
                  </span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-2 min-h-[250px]">
                    {activeKycViewerUser.nidBack ? (
                      <img
                        src={activeKycViewerUser.nidBack.startsWith('/uploads') ? `${BACKEND_URL.replace('/api', '')}${activeKycViewerUser.nidBack}` : activeKycViewerUser.nidBack}
                        alt="NID Back"
                        className="max-h-[350px] object-contain rounded-lg w-full"
                      />
                    ) : (
                      <span className="text-slate-400 text-sm italic">Back photo not uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Current Status:</span>
                <KycBadge status={activeKycViewerUser.kycStatus} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveKycViewerUser(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleUpdateKYC(activeKycViewerUser.id, "REJECTED");
                    setActiveKycViewerUser(null);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject KYC
                </button>
                <button
                  onClick={async () => {
                    await handleUpdateKYC(activeKycViewerUser.id, "APPROVED");
                    setActiveKycViewerUser(null);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve KYC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({
  title,
  value,
  icon: Icon,
  accentColor,
  bgColor,
  textColor,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accentColor: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: accentColor }}
      />
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-black text-[#0F172A] mt-1 tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function KycBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    REJECTED: "bg-red-50 text-red-600 border border-red-200",
    PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
        styles[status] || "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-slate-400 font-medium text-sm">{message}</p>
    </div>
  );
}
