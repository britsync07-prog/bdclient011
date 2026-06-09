export const STORAGE_KEYS = {
  FAVORITES: "casino-favorites",
} as const;

export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
} as const;

export const TOAST_DURATION = 3000;
export const LOADING_DELAY = 1000;

export const FOOTER_BOTTOM_MESSAGES = {
  ROYAL_CASINO_CRAFTED:
    "Royal Casino Crafted with Next.js, TypeScript & Tailwind CSS.",
  PREMIUM_GAMING_EXPERIENCE:
    " Premium gaming experience powered by cutting-edge technology",
  PLAY_RESPONSIBLY: "Play Responsibly",
  PLAY_RESPONSIBLY_DETAILS:
    "Gaming should be entertaining and fun. If you feel you may have a gambling problem, please seek professional help immediately.",
  OVER18_ONLY: "18+ Only",
  LICENSED_REGULATED: "Licensed & Regulated",
  SECURE_GAMING: "Secure Gaming",
} as const;

export const ERROR_BOUNDARY_MESSAGES = {
  SOMETHING_WENT_WRONG: "Oops! Something went wrong",
  SOMETHING_UNEXPECTED_HAPPENED:
    "We're sorry, but something unexpected happened.",
  RELOAD_PAGE: "Reload Page",
} as const;

export const FOOTER_MAIN_MESSAGES = {
  ROYAL_CASINO: "ROYAL CASINO",
  PREMIUM_GAMING_EXCELLENCE: "Premium Gaming Excellence",
  ESTABLISHED: "EST. 2024",
  GAMING_HUB: "Gaming Hub",
  CONNECT: "Connect",
  EST: "EST.",
} as const;

export const FILTER_CONTROLS = {
  FILTER_GAMES: "Filter Games",
  FAVORITES_ONLY: "Favorites Only",
  CLEAR_ALL: "Clear All",
} as const;

export const GAME_CARD_CONTEXT = {
  BY: "By",
  PREMIUM: "PREMIUM",
  PLAY_NOW: "PLAY NOW",
  OUT_OF_FIVE_STARS: "out of 5 stars",
} as const;

export const GAME_CARD_HEADER = {
  NEW: "NEW",
  HOT: "HOT",
  PLAY: "Play",
} as const;

export const GAME_GRID_MESSAGES = {
  SHOWING_GAMES: "Showing {gamesLength} of {totalGames} games",
  SHOW_ALL_GAMES: "Show all games",
} as const;

export const HEADER_MESSAGES = {
  ROYAL_CASINO: "ROYAL CASINO",
  PREMIUM_GAMING_DESTINATION: "Premium Gaming Destination",
  GAMES: "GAMES",
  FAVORITES: "FAVORITES",
  VIP_MEMBER: "VIP MEMBER",
} as const;

export const SPINNER_MESSAGES = {
  ROYAL_CASINO: "ROYAL CASINO",
  PREPARING_VIP: "Preparing your VIP gaming experience",
} as const;

export const PLACEHOLDER_MESSAGES = {
  SEARCH: "Search games by name or provider...",
  NO_GAMES:
    "We couldn't find any games matching your current filters. Try adjusting your search terms or clearing the filters.",
  LOADING: "Loading casino games...",
  PLAY_SUCCESS: "🎮 Starting {gameName}! Good luck!",
  FAVORITE_ADDED: "{gameName} added to favorites!",
  FAVORITE_REMOVED: "{gameName} removed from favorites!",
  PREMIUM_CASINO_GAMES: "Premium Casino Games",
  NO_GAMES_FOUND: "No Games Found",
  RESET_FILTERS: "RESET FILTERS",
} as const;

export const UI_CONFIG = {
  MAX_TOAST_DURATION: 5000,
  MIN_SEARCH_LENGTH: 0,
  DEBOUNCE_DELAY: 300,
  MIN_TOUCH_TARGET: 44,
} as const;

export const ARIA_LABELS = {
  SEARCH_INPUT: "Search games by name or provider",
  CLEAR_SEARCH: "Clear search",
  PLAY_GAME: "Play {gameName}",
  ADD_FAVORITE: "Add to favorites",
  REMOVE_FAVORITE: "Remove from favorites",
  CLEAR_FILTERS: "Clear all filters",
  GAME_GRID: "Games grid",
  FILTER_CONTROLS: "Game filter controls",
} as const;
