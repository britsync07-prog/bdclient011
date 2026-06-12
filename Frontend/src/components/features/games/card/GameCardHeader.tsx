import React from "react";
import { Heart, Play } from "lucide-react";

import { Game } from "@/types/game";
import { TRANSLATIONS } from "@/constants";

interface GameCardHeaderProps {
  game: Game;
  categoryIcon: string;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  onPlay: (gameId: string) => void;
  favoriteAriaLabel: string;
  playAriaLabel: string;
  lang?: "EN" | "BN";
}

const CATEGORY_TRANSLATIONS = {
  BN: {
    slots: "স্লট",
    live: "ক্যাসিনো",
    table: "টেবিল",
    fishing: "ফিসিং",
    crash: "ক্র্যাশ",
    arcade: "আর্কেড",
  },
  EN: {
    slots: "Slots",
    live: "Casino",
    table: "Table",
    fishing: "Fishing",
    crash: "Crash",
    arcade: "Arcade",
  }
} as const;

export const GameCardHeader: React.FC<GameCardHeaderProps> = ({
  game,
  categoryIcon,
  isFavorite,
  onToggleFavorite,
  onPlay,
  favoriteAriaLabel,
  playAriaLabel,
  lang = "BN",
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
  const t = TRANSLATIONS[lang];

  // Helper to translate category text
  const categoryText = React.useMemo(() => {
    const cat = game.category.toLowerCase() as keyof typeof CATEGORY_TRANSLATIONS.EN;
    const langTrans = CATEGORY_TRANSLATIONS[lang];
    if (cat in langTrans) {
      return langTrans[cat];
    }
    return game.category.charAt(0).toUpperCase() + game.category.slice(1);
  }, [game.category, lang]);

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-slate-900 border-b border-slate-800">
      {/* Game background */}
      {game.thumbnail && !imageError ? (
        <img
          src={game.thumbnail}
          alt={game.name}
          onError={() => setImageError(true)}
          loading="lazy"
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

      {/* Badges removed per user request */}

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-20 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 ${
          isFavorite
            ? "bg-blue-600 border-blue-500 shadow-lg text-white"
            : "bg-slate-950/80 border-slate-800 hover:bg-blue-950 hover:border-blue-900 text-slate-400 hover:text-blue-500"
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
          className="bg-white text-blue-600 p-4 rounded-full shadow-xl hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={playAriaLabel}
          type="button"
        >
          <Play className="w-6 h-6 fill-current" aria-hidden="true" />
          <span className="sr-only">
            {t.PLAY} {game.name}
          </span>
        </button>
      </div>
    </div>
  );
};
