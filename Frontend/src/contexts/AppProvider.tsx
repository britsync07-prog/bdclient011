"use client";

import React, { ReactNode } from "react";
import { FavoritesProvider } from "./FavoritesContext";
import { GameStoreProvider } from "./GameStoreContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <FavoritesProvider>
      <GameStoreProvider>{children}</GameStoreProvider>
    </FavoritesProvider>
  );
};
