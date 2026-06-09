import React from "react";
import { HEADER_MESSAGES } from "@/constants";

interface HeaderProps {
  favoritesCount: number;
  totalGames: number;
}

export const Header: React.FC<HeaderProps> = ({
  favoritesCount,
  totalGames,
}) => {
  return (
    <header className="bg-casino-dark border-b border-yellow-400/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="text-5xl animate-pulse-glow">🎰</div>
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient-casino">
                {HEADER_MESSAGES.ROYAL_CASINO}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400/80 text-sm font-medium">
                  ⭐
                </span>
                <p className="text-gradient-purple text-sm font-medium">
                  {HEADER_MESSAGES.PREMIUM_GAMING_DESTINATION}
                </p>
                <span className="text-yellow-400/80 text-sm font-medium">
                  ⭐
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass rounded-2xl px-4 py-3 border-casino-glow">
              <div className="flex items-center space-x-3">
                <div className="text-2xl animate-float">🎮</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-casino">
                    {totalGames}
                  </div>
                  <div className="text-xs text-yellow-400/80 font-medium">
                    {HEADER_MESSAGES.GAMES}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl px-4 py-3 border-casino-glow">
              <div className="flex items-center space-x-3">
                <div className="text-2xl animate-pulse-glow">💎</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-casino">
                    {favoritesCount}
                  </div>
                  <div className="text-xs text-yellow-400/80 font-medium">
                    {HEADER_MESSAGES.FAVORITES}
                  </div>
                </div>
              </div>
            </div>

            <div className="vip-badge">
              <span className="font-black text-xs tracking-wider">
                {HEADER_MESSAGES.VIP_MEMBER}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
      </div>
    </header>
  );
};
