"use client";

import React from "react";
import { Home, Gift, Award, Crown, UserPlus, Download, MessageSquare, Send, X, Monitor } from "lucide-react";
import { BANGLA_TEXT } from "@/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: <Home size={20} />, label: BANGLA_TEXT.HOME, active: true },
    { icon: <Gift size={20} />, label: BANGLA_TEXT.PROMOTIONS },
    { icon: <Award size={20} />, label: BANGLA_TEXT.WINNERS },
    { icon: <Crown size={20} />, label: BANGLA_TEXT.VIP },
    { icon: <UserPlus size={20} />, label: BANGLA_TEXT.REFERRAL },
    { icon: <Download size={20} />, label: BANGLA_TEXT.DOWNLOAD },
    { icon: <MessageSquare size={20} />, label: BANGLA_TEXT.CONTACT },
  ];

  const socialIcons = [
    { icon: <Send size={20} />, label: "Telegram" },
    { icon: <Monitor size={20} />, label: "Social" },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 h-full bg-[#192243] text-white transition-all duration-300 z-[70] ${
          isOpen ? "w-64" : "w-16"
        } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-slate-700/50 min-h-[64px]">
            {isOpen ? (
              <>
                <span className="font-bold text-xl tracking-tight text-blue-400 italic">PBBET</span>
                <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                   <X size={24} />
                </button>
              </>
            ) : (
              <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center mx-auto">
                 <span className="text-blue-400 font-bold">P</span>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
            <ul className="space-y-1 px-2">
              {menuItems.map((item, idx) => (
                <li key={idx}>
                  <button
                    className={`w-full flex items-center px-3 py-2.5 gap-4 rounded-[5px] transition-all duration-200 hover:bg-[#263668]/30 hover:text-white ${
                      item.active
                        ? "bg-blue-600/15 text-[#3b82f6] border-l-4 border-[#f59e0b]"
                        : "text-slate-400 border-l-4 border-transparent"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {isOpen && <span className="text-sm font-bold truncate">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 px-4">
               {isOpen && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">{BANGLA_TEXT.SOCIAL_MEDIA}</p>}
               <div className={`flex ${isOpen ? "flex-col space-y-1" : "flex-col items-center space-y-4"}`}>
                  {socialIcons.map((social, idx) => (
                    <button key={idx} className="flex items-center gap-4 px-2 py-2 text-slate-400 hover:text-white transition-colors">
                      {social.icon}
                      {isOpen && <span className="text-sm font-medium">{social.label}</span>}
                    </button>
                  ))}
               </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};
