

export interface Game {
  id: string;
  gameCode?: string;
  name: string;
  provider: string;
  category: "slots" | "table" | "live";
  rating: number;
  isNew?: boolean;
  isPopular?: boolean;
  thumbnail?: string;
  vendorCode?: string;
}

export type Category = "all" | "slots" | "table" | "live" | "fishing" | "crash";

export interface FilterState {
  searchTerm: string;
  selectedCategory: Category;
  showFavoritesOnly: boolean;
}

export interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPlay: (id: string) => void;
}

export interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}
