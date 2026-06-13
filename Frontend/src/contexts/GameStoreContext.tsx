"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Game, Category } from "../types/game";

interface GameState {
  games: Game[];
  searchTerm: string;
  selectedCategory: Category;
  showFavoritesOnly: boolean;
  isLoading: boolean;
}

type GameAction =
  | { type: "SET_GAMES"; payload: Game[] }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_CATEGORY"; payload: Category }
  | { type: "TOGGLE_FAVORITES_ONLY" }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_LOADING"; payload: boolean };

interface GameStoreContextType {
  state: GameState;
  hasActiveFilters: boolean;
  dispatch: React.Dispatch<GameAction>;
  setSearchTerm: (term: string) => void;
  setCategory: (category: Category) => void;
  toggleFavoritesOnly: () => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
}

const initialState: GameState = {
  games: [],
  searchTerm: "",
  selectedCategory: "all",
  showFavoritesOnly: false,
  isLoading: true,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_GAMES":
      return { ...state, games: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_CATEGORY":
      return { ...state, selectedCategory: action.payload };
    case "TOGGLE_FAVORITES_ONLY":
      return { ...state, showFavoritesOnly: !state.showFavoritesOnly };
    case "CLEAR_FILTERS":
      return {
        ...state,
        searchTerm: "",
        selectedCategory: "home",
        showFavoritesOnly: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const GameStoreContext = createContext<GameStoreContextType | undefined>(
  undefined
);

interface GameStoreProviderProps {
  children: ReactNode;
}

export const GameStoreProvider: React.FC<GameStoreProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    async function fetchGames() {
      try {
        const token = localStorage.getItem("token");
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        // Initial fast fetch: limited games for immediate page render
        const res = await fetch(`${BACKEND_URL}/user/games?category=home&limit=6`, { headers });
        const data = await res.json();
        
        if (data.games) {
          const mappedGames = data.games.map((g: any) => ({
            id: `${g.vendorCode}_${g.gameCode}`,
            gameCode: g.gameCode,
            name: g.name || g.gameName || "",
            provider: g.provider,
            category: g.category || "slots",
            isPopular: g.isPopular === true,
            rating: g.rating || 4.5,
            thumbnail: g.thumbnail,
            vendorCode: g.vendorCode,
          }));
          dispatch({ type: "SET_GAMES", payload: mappedGames });
        }
        dispatch({ type: "SET_LOADING", payload: false });

        // Delay the background fetch to ensure the main thread is completely free for the initial render
        setTimeout(() => {
          fetch(`${BACKEND_URL}/user/games`, { headers })
            .then(fullRes => fullRes.json())
            .then(fullData => {
              if (fullData.games) {
                const fullMappedGames = fullData.games.map((g: any) => ({
                  id: `${g.vendorCode}_${g.gameCode}`,
                  gameCode: g.gameCode,
                  name: g.name || g.gameName || "",
                  provider: g.provider,
                  category: g.category || "slots",
                  isPopular: g.isPopular === true,
                  rating: g.rating || 4.5,
                  thumbnail: g.thumbnail,
                  vendorCode: g.vendorCode,
                }));
                dispatch({ type: "SET_GAMES", payload: fullMappedGames });
              }
            })
            .catch(err => console.error("Background games fetch failed:", err));
        }, 1500); // 1.5 second delay

      } catch (err) {
        console.error("Initial games fetch failed:", err);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
    fetchGames();
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const setCategory = useCallback((category: Category) => {
    dispatch({ type: "SET_CATEGORY", payload: category });
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    dispatch({ type: "TOGGLE_FAVORITES_ONLY" });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      state.searchTerm !== "" ||
      state.selectedCategory !== "home" ||
      state.showFavoritesOnly
    );
  }, [state.searchTerm, state.selectedCategory, state.showFavoritesOnly]);

  const value = useMemo<GameStoreContextType>(
    () => ({
      state,
      hasActiveFilters,
      dispatch,
      setSearchTerm,
      setCategory,
      toggleFavoritesOnly,
      clearFilters,
      setLoading,
    }),
    [
      state,
      hasActiveFilters,
      setSearchTerm,
      setCategory,
      toggleFavoritesOnly,
      clearFilters,
      setLoading,
    ]
  );

  return (
    <GameStoreContext.Provider value={value}>
      {children}
    </GameStoreContext.Provider>
  );
};

export const useGameStore = () => {
  const context = useContext(GameStoreContext);
  if (context === undefined) {
    throw new Error("useGameStore must be used within a GameStoreProvider");
  }
  return context;
};
