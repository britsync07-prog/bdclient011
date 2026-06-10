import React, { useState, useEffect, useMemo } from "react";
import { Gamepad2, X } from "lucide-react";

import { Game } from "@/types/game";
import { GameCard } from "./card/GameCard";
import { EmptyState } from "../../ui/EmptyState";
import { formatMessage } from "@/utils/helpers";

interface GameGridProps {
  games: Game[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onPlay: (id: string) => void;
  onClearFilters: () => void;
  totalGames: number;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  favorites,
  onToggleFavorite,
  onPlay,
  onClearFilters,
  totalGames,
}) => {
  const [visibleCount, setVisibleCount] = useState(24);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setVisibleCount(24);
  }, [games.length]);

  const loadMoreGames = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 24);
      setLoadingMore(false);
    }, 450);
  };

  // Performance Optimization: Convert favorites array to a Set for O(1) lookups
  // during the render loop. This avoids O(n^2) complexity where n is the number of visible games.
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const visibleGames = games.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {games.length > 0 && (
        <div className="bg-[#192243]/50 rounded-xl px-4 py-2 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-xs font-bold">
              {games.length} টি গেম পাওয়া গেছে
            </span>
          </div>
          {games.length !== totalGames && (
            <button
              onClick={onClearFilters}
              className="text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
            >
              সব দেখান
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
            />
          ))
        )}
      </div>

      {games.length > visibleCount && (
        <div className="flex justify-center pt-6 pb-2">
          <button
            onClick={loadMoreGames}
            disabled={loadingMore}
            className="px-8 py-2.5 bg-[#263668] hover:bg-[#32457a] text-white font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? "লোড হচ্ছে..." : "আরো দেখুন"}
          </button>
        </div>
      )}
    </div>
  );
};
