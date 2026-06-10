"use client";

import React, { useEffect, useState } from "react";
import { Home, Gift, Wallet, User, MessageCircle } from "lucide-react";
import { BANGLA_TEXT } from "@/constants";
import Link from "next/link";

interface UserData {
  id: number;
  username: string;
  balance: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export const MobileNav: React.FC = () => {
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
      .catch(err => console.error("Mobile profile fetch error", err));
    }
  }, []);

  const navItems = [
    { icon: <Home size={20} />, label: BANGLA_TEXT.HOME, href: "/" },
    { icon: <Gift size={20} />, label: BANGLA_TEXT.PROMOTIONS, href: "/#promotions" },
    { icon: <Wallet size={20} />, label: "ডিপোজিট", highlight: true, href: user ? "/deposit" : "/login" },
    { icon: <MessageCircle size={20} />, label: "সাপোর্ট", href: "/#support" },
    { icon: <User size={20} />, label: user ? "প্রোফাইল" : BANGLA_TEXT.LOGIN, href: user ? "/profile" : "/login" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#192243] border-t border-slate-700/50 flex items-center justify-around px-2 py-2 lg:hidden z-[50] shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      {navItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`flex flex-col items-center justify-center gap-1 min-w-[64px] ${
            item.highlight ? "text-blue-400" : "text-slate-400 active:text-white"
          }`}
        >
          <div className={`p-1.5 ${item.highlight ? "bg-blue-500/10 rounded-xl" : ""}`}>
            {item.icon}
          </div>
          <span className="text-[10px] font-bold">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};
