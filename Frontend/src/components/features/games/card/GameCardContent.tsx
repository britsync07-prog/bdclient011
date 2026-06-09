import React from "react";
import { Play } from "lucide-react";

import { Game } from "@/types/game";
import { GAME_CARD_CONTEXT } from "@/constants";

interface GameCardContentProps {
  game: Game;
  formattedRating: string;
  starRating: React.ReactNode[];
  onPlay: (gameId: string) => void;
  playAriaLabel: string;
}

export const GameCardContent: React.FC<GameCardContentProps> = ({
  game,
  formattedRating,
  starRating,
  onPlay,
  playAriaLabel,
}) => {
  const handlePlayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPlay(game.id);
  };

  return (
    <div className="p-4 bg-[#0f172a]">
      <header className="mb-3">
        <h3 className="font-700 text-base text-slate-100 mb-0.5 group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">
          {game.name}
        </h3>
        <p className="text-slate-400 text-xs font-medium">
          {GAME_CARD_CONTEXT.BY} <span className="text-slate-300">{game.provider}</span>
        </p>
      </header>

      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center space-x-1.5"
          role="img"
          aria-label={`Rating: ${formattedRating} out of 5 stars`}
        >
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {starRating}
          </div>
          <span className="text-amber-500 text-xs font-700">
            {formattedRating}
          </span>
          <span className="sr-only">{GAME_CARD_CONTEXT.OUT_OF_FIVE_STARS}</span>
        </div>
        <div
          className="text-[10px] text-blue-400 font-700 uppercase tracking-wider bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-900/30"
          aria-hidden="true"
        >
          {GAME_CARD_CONTEXT.PREMIUM}
        </div>
      </div>

      <button
        onClick={handlePlayClick}
        className="w-full py-2.5 px-4 rounded-xl font-600 text-sm transition-all duration-200 cursor-pointer active:scale-95 btn-primary flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        aria-label={playAriaLabel}
        type="button"
      >
        <Play className="w-4 h-4 fill-white" aria-hidden="true" />
        <span>{GAME_CARD_CONTEXT.PLAY_NOW}</span>
      </button>
    </div>
  );
};
