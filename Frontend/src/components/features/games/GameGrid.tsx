import React, { useState, useEffect, useMemo } from "react";
import { Gamepad2 } from "lucide-react";

import { Game } from "@/types/game";
import { GameCard } from "./card/GameCard";
import { EmptyState } from "../../ui/EmptyState";
import { TRANSLATIONS } from "@/constants";

interface GameGridProps {
  games: Game[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onPlay: (id: string) => void;
  onClearFilters: () => void;
  totalGames: number;
  lang?: "EN" | "BN";
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  favorites,
  onToggleFavorite,
  onPlay,
  onClearFilters,
  totalGames,
  lang = "BN",
}) => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setVisibleCount(6);
  }, [games.length]);

  const loadMoreGames = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 12);
      setLoadingMore(false);
    }, 450);
  };

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);
  const visibleGames = games.slice(0, visibleCount);

  const t = TRANSLATIONS[lang];

  // Helper to format showing count or found count
  const gamesFoundText = useMemo(() => {
    return t.GAMES_FOUND.replace("{count}", games.length.toString());
  }, [t.GAMES_FOUND, games.length]);

  return (
    <div className="space-y-4">
      {games.length > 0 && (
        <div className="bg-slate-100 rounded-xl px-4 py-2 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600 text-xs font-bold">
              {gamesFoundText}
            </span>
          </div>
          {games.length !== totalGames && (
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {t.RESET_FILTERS}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
        {visibleGames.length === 0 ? (
          <div className="col-span-full">
            <EmptyState onClearFilters={onClearFilters} />
          </div>
        ) : (
          visibleGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favoritesSet.has(game.id)}
              onToggleFavorite={onToggleFavorite}
              onPlay={onPlay}
              lang={lang}
            />
          ))
        )}
      </div>

      {games.length > visibleCount && (
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={loadMoreGames}
            disabled={loadingMore}
            className="px-12 py-3.5 bg-slate-100 text-[#3b82f6] rounded-2xl font-black text-xs uppercase border border-[#3b82f6]/20 hover:bg-[#3b82f6] hover:text-white transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? t.LOADING : (lang === "BN" ? "আরো গেম দেখুন" : "Show More Games")}
          </button>
        </div>
      )}
    </div>
  );
};
