import React from "react";
import { Heart, Play } from "lucide-react";

import { Game } from "@/types/game";
import { GAME_CARD_HEADER } from "@/constants";

interface GameCardHeaderProps {
  game: Game;
  categoryIcon: string;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  onPlay: (gameId: string) => void;
  favoriteAriaLabel: string;
  playAriaLabel: string;
}

export const GameCardHeader: React.FC<GameCardHeaderProps> = ({
  game,
  categoryIcon,
  isFavorite,
  onToggleFavorite,
  onPlay,
  favoriteAriaLabel,
  playAriaLabel,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleFavorite(game.id);
  };

  const handlePlayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPlay(game.id);
  };

  const bgGradient =
    game.category === "slots"
      ? "from-amber-400 via-orange-400 to-rose-400"
      : game.category === "table"
      ? "from-teal-400 via-emerald-400 to-cyan-500"
      : "from-rose-400 via-pink-500 to-orange-400";

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="relative h-48 overflow-hidden bg-slate-100">
      {/* Game background */}
      {game.thumbnail && !imageError ? (
        <img
          src={game.thumbnail}
          alt={game.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br ${bgGradient} transition-transform duration-700 group-hover:scale-110`}
          role="img"
          aria-label={`${game.name} ${game.category} game icon`}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20"
            aria-hidden="true"
          />
          <div className="relative z-10 drop-shadow-2xl" aria-hidden="true">
            {categoryIcon}
          </div>
        </div>
      )}

      {/* Overlay gradient for text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-700 uppercase tracking-wider bg-white/90 text-slate-700 border border-white/50 shadow-sm"
          role="img"
          aria-label={`Category: ${game.category}`}
        >
          {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
        </span>

        {game.isNew && (
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-900 border border-amber-300 shadow-sm flex items-center gap-1"
            role="img"
            aria-label="New game"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {GAME_CARD_HEADER.NEW}
          </span>
        )}

        {game.isPopular && (
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white border border-rose-400 shadow-sm flex items-center gap-1"
            role="img"
            aria-label="Popular game"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
            {GAME_CARD_HEADER.HOT}
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-20 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1 ${
          isFavorite
            ? "bg-rose-500 border-rose-400 shadow-lg text-white"
            : "bg-white/90 border-white/60 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-500"
        }`}
        aria-label={favoriteAriaLabel}
        aria-pressed={isFavorite}
        type="button"
      >
        <Heart
          className={`w-4 h-4 transition-all duration-200 ${isFavorite ? "fill-white" : ""}`}
          aria-hidden="true"
        />
        <span className="sr-only">
          {isFavorite
            ? `Remove ${game.name} from favorites`
            : `Add ${game.name} to favorites`}
        </span>
      </button>

      {/* Play button on hover */}
      <div className="absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hidden md:flex">
        <button
          onClick={handlePlayClick}
          className="bg-white text-rose-600 p-4 rounded-full shadow-xl hover:bg-rose-600 hover:text-white transition-all duration-200 cursor-pointer transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={playAriaLabel}
          type="button"
        >
          <Play className="w-6 h-6 fill-current" aria-hidden="true" />
          <span className="sr-only">
            {GAME_CARD_HEADER.PLAY} {game.name}
          </span>
        </button>
      </div>
    </div>
  );
};
