import React, { memo, useMemo } from "react";

import { GameCardProps } from "@/types/game";
import { getCategoryIcon } from "@/utils/helpers";
import { GameCardHeader } from "./GameCardHeader";

interface ExtendedGameCardProps extends GameCardProps {
  lang?: "EN" | "BN";
}

export const GameCard = memo<ExtendedGameCardProps>(
  ({ game, isFavorite, onToggleFavorite, onPlay, lang = "BN" }) => {
    const categoryIcon = useMemo(
      () => getCategoryIcon(game.category),
      [game.category]
    );

    const playAriaLabel = useMemo(
      () => `Play ${game.name}`,
      [game.name]
    );
    const favoriteAriaLabel = useMemo(
      () =>
        isFavorite ? "Remove from favorites" : "Add to favorites",
      [isFavorite]
    );

    const handleCardClick = () => {
      onPlay(game.id);
    };

    return (
      <article 
        onClick={handleCardClick}
        className="group cursor-pointer relative rounded-2xl overflow-hidden bg-[#0f172a] border border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
      >
        <GameCardHeader
          game={game}
          categoryIcon={categoryIcon}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onPlay={onPlay}
          favoriteAriaLabel={favoriteAriaLabel}
          playAriaLabel={playAriaLabel}
          lang={lang}
        />
        
        <div className="p-3 bg-[#0f172a] border-t border-slate-800/50 flex flex-col justify-center min-h-[44px]">
          <h3 className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 text-center leading-snug">
            {game.name}
          </h3>
        </div>
      </article>
    );
  }
);

GameCard.displayName = "GameCard";
