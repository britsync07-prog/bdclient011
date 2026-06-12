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
  return CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.label || "Unknown";
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const normalizeSearchTerm = (term: string | null | undefined): string => {
  return (term ?? "").toLowerCase().trim();
};

export const matchesSearchTerm = (
  searchTerm: string | null | undefined,
  name: string | null | undefined,
  provider: string | null | undefined
): boolean => {
  const normalizedTerm = normalizeSearchTerm(searchTerm);
  if (!normalizedTerm) return true;

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

export const renderGameErrorToWindow = (
  win: Window,
  title: string,
  message: string
): void => {
  const doc = win.document;

  // Clear existing content safely
  while (doc.body.firstChild) {
    doc.body.removeChild(doc.body.firstChild);
  }

  doc.body.style.backgroundColor = "#0b1329";
  doc.body.style.color = "#f8fafc";
  doc.body.style.margin = "0";
  doc.body.style.fontFamily = "system-ui, sans-serif";

  const container = doc.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.height = "100vh";
  container.style.textAlign = "center";
  container.style.padding = "24px";

  const titleEl = doc.createElement("div");
  titleEl.style.color = "#ef4444";
  titleEl.style.fontSize = "20px";
  titleEl.style.fontWeight = "800";
  titleEl.style.textTransform = "uppercase";
  titleEl.textContent = title;

  const messageEl = doc.createElement("div");
  messageEl.style.color = "#cbd5e1";
  messageEl.style.fontSize = "14px";
  messageEl.style.marginTop = "12px";
  messageEl.style.maxWidth = "400px";
  messageEl.style.lineHeight = "1.5";
  messageEl.textContent = message;

  const closeBtn = doc.createElement("button");
  closeBtn.style.marginTop = "24px";
  closeBtn.style.padding = "10px 20px";
  closeBtn.style.backgroundColor = "#3b82f6";
  closeBtn.style.color = "white";
  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "8px";
  closeBtn.style.fontWeight = "bold";
  closeBtn.style.cursor = "pointer";
  closeBtn.textContent = "Close Window";
  closeBtn.addEventListener("click", () => {
    win.close();
  });

  container.appendChild(titleEl);
  container.appendChild(messageEl);
  container.appendChild(closeBtn);

  doc.body.appendChild(container);
};
