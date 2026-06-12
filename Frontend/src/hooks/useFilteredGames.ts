import { useMemo } from "react";
import { useGameStore } from "../contexts/GameStoreContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";

export const useFilteredGames = () => {
  const { state } = useGameStore();
  const { favorites } = useFavoritesContext();

  const filteredGames = useMemo(() => {
    const { games, searchTerm, selectedCategory, showFavoritesOnly } = state;

    let filtered = games;

    if (selectedCategory === "all") {
      // Hot Games category: show only popular games
      filtered = filtered.filter((game) => game.isPopular);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.name.toLowerCase().includes(searchLower) ||
          game.provider.toLowerCase().includes(searchLower)
      );
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((game) => favorites.includes(game.id));
    } else if (selectedCategory !== "home" && selectedCategory !== "all") {
      if (selectedCategory === "fishing") {
        filtered = filtered.filter(
          (game) =>
            (game.vendorCode && game.vendorCode.toLowerCase().startsWith("fishing-")) ||
            game.name.toLowerCase().includes("fish")
        );
      } else if (selectedCategory === "crash") {
        filtered = filtered.filter(
          (game) =>
            (game.vendorCode && game.vendorCode.toLowerCase().startsWith("mini-")) ||
            ["crash", "plinko", "aviator", "dice", "mines", "limbo"].some(
              (kw) => game.name.toLowerCase().includes(kw)
            )
        );
      } else {
        filtered = filtered.filter((game) => (game.category as string) === selectedCategory);
      }
    }

    return filtered;
  }, [state, favorites]);

  return filteredGames;
};
