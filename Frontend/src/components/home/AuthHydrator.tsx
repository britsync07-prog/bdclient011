"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, User, LogOut } from "lucide-react";

interface UserData {
  id: number;
  username: string;
  balance: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export const AuthHydrator: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${BACKEND_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) setUser(data);
      })
      .catch(err => console.error("Auth hydration error", err))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.refresh();
  };

  if (loading) return null;

  if (!user) {
    return (
      <>
        <button 
          onClick={() => router.push("/register")}
          className="auth-container__button auth-container__button--secondary"
          style={{ cursor: "pointer" }}
        >
          সাইন আপ
        </button>
        <button 
          onClick={() => router.push("/login")}
          className="auth-container__button auth-container__button--primary"
          style={{ cursor: "pointer" }}
        >
          লগ ইন
        </button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-[#1f603d] px-3 py-1.5 rounded-lg border border-[#2d985f]">
        <Wallet size={16} className="text-[#f6d304]" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest leading-none">ব্যালেন্স</span>
          <span className="text-sm font-extrabold text-white leading-none">৳ {parseFloat(String(user.balance)).toFixed(2)}</span>
        </div>
      </div>
      
      <button 
        onClick={() => router.push("/profile")}
        className="p-2 text-white hover:text-[#f6d304] transition-colors"
      >
        <User size={20} />
      </button>

      <button 
        onClick={handleLogout}
        className="p-2 text-white/50 hover:text-red-400 transition-colors"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
};
