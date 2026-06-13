"use client";

import React, { useEffect } from "react";
import { useGameStore } from "@/contexts/GameStoreContext";
import { GameCard } from "../features/games/card/GameCard";
import { useRouter } from "next/navigation";

interface GameHydratorProps {
  category: string;
}

export const GameHydrator: React.FC<GameHydratorProps> = ({ category: initialCategory }) => {
  const { state, setCategory } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    (window as any).dispatchCategoryChange = (newCat: string) => {
      setCategory(newCat as any);
    };
  }, [setCategory]);
  
  const handlePlay = (gameId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    // Launch game logic
    router.push(`/play/${gameId}`);
  };

  if (state.isLoading) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4 w-full">
      {state.games.slice(0, 12).map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onPlay={handlePlay}
        />
      ))}
    </div>
  );
};
