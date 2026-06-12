"use client";

import React, { useEffect, useState } from "react";
import { User, Wallet, Bell, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { BANGLA_TEXT } from "@/constants";

interface UserData {
  id: number;
  username: string;
  balance: number;
}

interface HeaderProps {
  favoritesCount: number;
  totalGames: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export const Header: React.FC<HeaderProps> = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      fetch(`${BACKEND_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) setUser(data);
      })
      .catch(err => console.error("Header profile fetch error", err));
    }
  }, []);

  return (
    <header className="bg-[#192243] border-b border-slate-700/50 sticky top-0 z-30 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[#263668] px-3 py-1.5 rounded-lg border border-slate-700/50">
             <Wallet size={18} className="text-yellow-500" />
             <span className="text-sm font-bold text-white">
               {user ? parseFloat(String(user.balance)).toFixed(2) : "0.00"} ৳
             </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {!user ? (
             <>
               <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-[5px] bg-gradient-to-br from-[#1d4ed8] via-[#3b82f6] to-[#1d4ed8] shadow-[0_5px_10px_rgba(0,0,0,0.15),inset_0_0_5px_rgba(255,255,255,0.6)] border-none text-white text-xs font-extrabold transition-all duration-200 hover:brightness-110 active:scale-95">
                  <LogIn size={14} />
                  {BANGLA_TEXT.LOGIN}
               </Link>
               <Link href="/register" className="flex items-center gap-2 px-4 py-2 rounded-[5px] bg-gradient-to-br from-[#f59e0b] via-[#fcd34d] to-[#f59e0b] shadow-[0_5px_10px_rgba(0,0,0,0.15),inset_0_0_5px_rgba(255,255,255,0.6)] border-none text-black text-xs font-extrabold transition-all duration-200 hover:brightness-110 active:scale-95">
                  <UserPlus size={14} />
                  {BANGLA_TEXT.SIGNUP}
               </Link>
             </>
           ) : (
             <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-300">{user.username}</span>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                   <User size={20} />
                </button>
             </div>
           )}

           <div className="h-8 w-px bg-slate-700/50 mx-2"></div>

           <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#192243]"></span>
           </button>
        </div>
      </div>
    </header>
  );
};
