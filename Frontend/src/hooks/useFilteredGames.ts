import { useMemo } from "react";
import { useGameStore } from "../contexts/GameStoreContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";

export const useFilteredGames = () => {
  const { state } = useGameStore();
  const { favorites } = useFavoritesContext();

  const filteredGames = useMemo(() => {
    const { games, searchTerm, selectedCategory, showFavoritesOnly } = state;

    if (!searchTerm && selectedCategory === "all" && !showFavoritesOnly) {
      return games;
    }

    let filtered = games;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.name.toLowerCase().includes(searchLower) ||
          game.provider.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((game) => game.category === selectedCategory);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((game) => favorites.includes(game.id));
    }

    return filtered;
  }, [state, favorites]);

  return filteredGames;
};
