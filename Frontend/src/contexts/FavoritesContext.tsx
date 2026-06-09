"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { STORAGE_KEYS } from "@/constants";

interface FavoritesContextType {
  favorites: string[];
  favoritesCount: number;
  isFavorite: (gameId: string) => boolean;
  toggleFavorite: (gameId: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: ReactNode;
}

const isValidFavoritesArray = (obj: unknown): obj is string[] => {
  return Array.isArray(obj) && obj.every((item) => typeof item === "string");
};

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const isHydrated = useRef(false);

  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;

      try {
        const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites);
          if (isValidFavoritesArray(parsed)) {
            setFavorites(parsed);
          } else {
            console.warn("Invalid favorites data found, clearing storage");
            localStorage.removeItem(STORAGE_KEYS.FAVORITES);
          }
        }
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error);
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      }
    }
  }, []);

  useEffect(() => {
    if (isHydrated.current) {
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error);
        if (error instanceof DOMException && error.code === 22) {
          console.error("localStorage quota exceeded");
        }
      }
    }
  }, [favorites]);

  const toggleFavorite = useCallback((gameId: string) => {
    setFavorites((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  }, []);

  const isFavorite = useCallback(
    (gameId: string): boolean => {
      return favorites.includes(gameId);
    },
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const value: FavoritesContextType = {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error(
      "useFavoritesContext must be used within a FavoritesProvider"
    );
  }
  return context;
};
