import { Category } from "@/types/game";
import { PLACEHOLDER_MESSAGES } from "@/constants";

const CATEGORY_CONFIG = {
  slots: {
    icon: "🎰",
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    label: "Slots",
  },
  table: {
    icon: "🃏",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    label: "Table Games",
  },
  live: {
    icon: "🎥",
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    label: "Live Games",
  },
  all: {
    icon: "🎮",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    label: "All Games",
  },
  fishing: {
    icon: "⚓",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    label: "Fishing",
  },
  crash: {
    icon: "⚡",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    label: "Crash Games",
  },
} as const;

const DEFAULT_CONFIG = {
  icon: "🎮",
  color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export const getCategoryIcon = (category: string): string => {
  return (
    CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.icon ||
    DEFAULT_CONFIG.icon
  );
};

export const getCategoryColor = (category: string): string => {
  return (
    CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.color ||
    DEFAULT_CONFIG.color
  );
};

export const getCategoryLabel = (category: Category): string => {
  return CATEGORY_CONFIG[category]?.label || "Unknown";
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const normalizeSearchTerm = (term: string): string => {
  return term.toLowerCase().trim();
};

export const matchesSearchTerm = (
  searchTerm: string,
  name: string,
  provider: string
): boolean => {
  if (!searchTerm) return true;
  const normalizedTerm = normalizeSearchTerm(searchTerm);
  return (
    normalizeSearchTerm(name).includes(normalizedTerm) ||
    normalizeSearchTerm(provider).includes(normalizedTerm)
  );
};

export const createPlayMessage = (gameName: string): string => {
  return PLACEHOLDER_MESSAGES.PLAY_SUCCESS.replace("{gameName}", gameName);
};

export const createFavoriteMessage = (
  gameName: string,
  isAdded: boolean
): string => {
  const template = isAdded
    ? PLACEHOLDER_MESSAGES.FAVORITE_ADDED
    : PLACEHOLDER_MESSAGES.FAVORITE_REMOVED;
  return template.replace("{gameName}", gameName);
};

export const createAriaLabel = (
  template: string,
  gameName?: string
): string => {
  if (gameName && template.includes("{gameName}")) {
    return template.replace("{gameName}", gameName);
  }
  return template;
};

export const formatMessage = (
  template: string,
  variables: Record<string, string | number>
): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
};
