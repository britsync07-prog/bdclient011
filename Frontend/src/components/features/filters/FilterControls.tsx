import React from "react";
import { Heart, RotateCcw, SlidersHorizontal } from "lucide-react";

import { FilterButton } from "@/components/ui/FilterButtons";
import { getCategoryLabel } from "@/utils/helpers";
import { Category, Game } from "@/types/game";
import { FILTER_CONTROLS } from "@/constants";

interface FilterControlsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  games: Game[];
  favoritesCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedCategory,
  onCategoryChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  onClearFilters,
  hasActiveFilters,
  games,
  favoritesCount,
}) => {
  const categories: Category[] = ["all", "slots", "table", "live"];

  const getCount = (category: Category): number =>
    category === "all"
      ? games.length
      : games.filter((g) => g.category === category).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-rose-500" aria-hidden="true" />
        <span className="text-slate-700 font-600 text-sm">
          {FILTER_CONTROLS.FILTER_GAMES}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <FilterButton
            key={category}
            active={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
            count={getCount(category)}
          >
            <span>{getCategoryLabel(category)}</span>
          </FilterButton>
        ))}

        <FilterButton
          active={showFavoritesOnly}
          onClick={onToggleFavoritesOnly}
          count={favoritesCount}
        >
          <Heart
            className={`w-4 h-4 ${showFavoritesOnly ? "fill-white" : ""}`}
            aria-hidden="true"
          />
          <span>{FILTER_CONTROLS.FAVORITES_ONLY}</span>
        </FilterButton>

        {hasActiveFilters && (
          <FilterButton active={false} onClick={onClearFilters}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{FILTER_CONTROLS.CLEAR_ALL}</span>
          </FilterButton>
        )}
      </div>
    </div>
  );
};
