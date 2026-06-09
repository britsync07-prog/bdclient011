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
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

interface User {
  id: string;
  username: string;
  balance: string | number;
  kycStatus: string;
  role: string;
  createdAt: string;
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

      const usersRes = await fetch(`${BACKEND_URL}/admin/users`, { headers });
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

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
      showToast(data.message || "RTP updated successfully", true);
    } catch {
      showToast("Failed to update RTP", false);
    } finally {
      setRtpLoading(false);
    }
  };

  const handleUpdateKYC = async (userId: string, status: string) => {
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
        fetchData();
        showToast(`KYC ${status.toLowerCase()} successfully`, true);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update KYC", false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
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
        showToast("Settings updated successfully", true);
      } else {
        showToast("Failed to update settings", false);
      }
    } catch {
      showToast("Error updating settings", false);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleApproveFinance = async (id: string) => {
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
        fetchData();
        showToast("Request approved successfully", true);
      }
    } catch (err) {
      console.error(err);
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
        showToast(editingBannerId ? "Banner updated successfully" : "Banner created successfully", true);
        setNewBanner({ imageUrl: "", linkUrl: "", order: 0 });
        setEditingBannerId(null);
        // Refresh banners list
        const bannersRes = await fetch(`${BACKEND_URL}/admin/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bannersJson = await bannersRes.json();
        if (bannersJson.success) setBanners(bannersJson.data || []);
      } else {
        showToast(data.message || (editingBannerId ? "Failed to update banner" : "Failed to add banner"), false);
      }
    } catch {
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
        showToast(editingEventId ? "Event updated successfully" : "Event created successfully", true);
        setNewEvent({ title: "", description: "", imageUrl: "", linkUrl: "", order: 0 });
        setEditingEventId(null);
        // Refresh banners list
        const bannersRes = await fetch(`${BACKEND_URL}/admin/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bannersJson = await bannersRes.json();
        if (bannersJson.success) setBanners(bannersJson.data || []);
      } else {
        showToast(data.message || (editingEventId ? "Failed to update event" : "Failed to add event"), false);
      }
    } catch {
      showToast(editingEventId ? "Error updating event" : "Error adding event", false);
    } finally {
      setBannerLoading(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Banner deleted successfully", true);
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        showToast("Failed to delete banner", false);
      }
    } catch {
      showToast("Error deleting banner", false);
    }
  };

  const handleLogout = () => {
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
              <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Users"
                    value={users.length}
                    icon={Users}
                    accentColor="#E11D48"
                    bgColor="bg-rose-50"
                    textColor="text-[#E11D48]"
                  />
                  <StatCard
                    title="Pending KYC"
                    value={pendingKYC}
                    icon={AlertCircle}
                    accentColor="#F59E0B"
                    bgColor="bg-amber-50"
                    textColor="text-amber-500"
                  />
                  <StatCard
                    title="Total Liquidity"
                    value={`$${totalLiquidity}`}
                    icon={DollarSign}
                    accentColor="#2563EB"
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                  />
                  <StatCard
                    title="System Status"
                    value="Live"
                    icon={Activity}
                    accentColor="#10B981"
                    bgColor="bg-emerald-50"
                    textColor="text-emerald-600"
                  />
                </div>
              )}

              {/* ── Users Tab ── */}
              {activeTab === "users" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#0F172A] text-base">All Users</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full">
                      {users.length} total
                    </span>
                  </div>
                  {users.length === 0 ? (
                    <EmptyState message="No users found." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Player</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">KYC Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {users.map((user, i) => {
                            const colors = [
                              "bg-rose-100 text-[#E11D48]",
                              "bg-blue-100 text-blue-600",
                              "bg-emerald-100 text-emerald-600",
                              "bg-amber-100 text-amber-600",
                              "bg-violet-100 text-violet-600",
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
                                  ${parseFloat(user.balance as string || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
              )}

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
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
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
              {activeTab === "games" && (
                <div className="max-w-xl">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
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

                    <form onSubmit={handleSetRTP} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Target Player ID
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-all placeholder:text-slate-300"
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
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-all cursor-pointer"
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
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            RTP Level
                          </label>
                          <div className="bg-[#E11D48]/10 text-[#E11D48] font-black text-lg px-4 py-1 rounded-xl min-w-[72px] text-center">
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
                        <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
                          <span>30%</span>
                          <span>99%</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={rtpLoading}
                        aria-label="Apply RTP settings"
                        className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm shadow-sm shadow-rose-200 mt-2"
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
                </div>
              )}

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
