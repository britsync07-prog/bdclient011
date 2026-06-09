import React from "react";
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
  const isFavorite = (gameId: string): boolean => {
    return favorites.includes(gameId);
  };

  return (
    <div className="space-y-5">
      {games.length > 0 && (
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4 text-rose-500" aria-hidden="true" />
            <span className="text-slate-600 text-sm font-medium">
              {formatMessage(GAME_GRID_MESSAGES.SHOWING_GAMES, {
                gamesLength: games.length,
                totalGames: totalGames,
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
        {games.length === 0 ? (
          <EmptyState onClearFilters={onClearFilters} />
        ) : (
          games.map((game) => (
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
    </div>
  );
};
