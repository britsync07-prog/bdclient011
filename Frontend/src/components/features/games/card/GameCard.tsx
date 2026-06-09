import React, { memo, useMemo } from "react";

import { GameCardProps } from "@/types/game";
import {
  getCategoryIcon,
  formatRating,
  createAriaLabel,
} from "@/utils/helpers";
import { ARIA_LABELS } from "@/constants";
import { GameCardHeader } from "./GameCardHeader";
import { GameCardContent } from "./GameCardContent";

export const GameCard = memo<GameCardProps>(
  ({ game, isFavorite, onToggleFavorite, onPlay }) => {
    const categoryIcon = useMemo(
      () => getCategoryIcon(game.category),
      [game.category]
    );
    const formattedRating = useMemo(
      () => formatRating(game.rating),
      [game.rating]
    );

    const playAriaLabel = useMemo(
      () => createAriaLabel(ARIA_LABELS.PLAY_GAME, game.name),
      [game.name]
    );
    const favoriteAriaLabel = useMemo(
      () =>
        isFavorite ? ARIA_LABELS.REMOVE_FAVORITE : ARIA_LABELS.ADD_FAVORITE,
      [isFavorite]
    );

    const starRating = useMemo(() => {
      return Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${
            i < Math.floor(game.rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ));
    }, [game.rating]);

    return (
      <article className="group cursor-pointer relative rounded-2xl overflow-hidden bg-[#0f172a] border border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
        <GameCardHeader
          game={game}
          categoryIcon={categoryIcon}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onPlay={onPlay}
          favoriteAriaLabel={favoriteAriaLabel}
          playAriaLabel={playAriaLabel}
        />

        <GameCardContent
          game={game}
          formattedRating={formattedRating}
          starRating={starRating}
          onPlay={onPlay}
          playAriaLabel={playAriaLabel}
        />
      </article>
    );
  }
);

GameCard.displayName = "GameCard";
