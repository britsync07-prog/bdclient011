import React, { useState, useEffect } from "react";
import { Gamepad2, X } from "lucide-react";

import { Game } from "@/types/game";
import { GameCard } from "./card/GameCard";
import { GAME_GRID_MESSAGES } from "@/constants";
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

  // Reset visible count back to initial page size when search query or filter changes the count
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

  const isFavorite = (gameId: string): boolean => {
    return favorites.includes(gameId);
  };

  const visibleGames = games.slice(0, visibleCount);

  return (
    <div className="space-y-5">
      {games.length > 0 && (
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4 text-rose-500" aria-hidden="true" />
            <span className="text-slate-600 text-sm font-medium">
              {formatMessage(GAME_GRID_MESSAGES.SHOWING_GAMES, {
                gamesLength: visibleGames.length,
                totalGames: games.length,
              })}
            </span>
          </div>
          {games.length !== totalGames && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 text-rose-500 hover:text-rose-700 text-sm font-600 transition-colors duration-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              {GAME_GRID_MESSAGES.SHOW_ALL_GAMES}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visibleGames.length === 0 ? (
          <EmptyState onClearFilters={onClearFilters} />
        ) : (
          visibleGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={isFavorite(game.id)}
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
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl border border-slate-800 transition-all shadow-md shadow-black/15 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 select-none min-w-[160px]"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : (
              "Show More"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
