import React from "react";
import { Search, X } from "lucide-react";
import { PLACEHOLDER_MESSAGES } from "@/constants";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = PLACEHOLDER_MESSAGES.SEARCH,
}) => {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative bg-[#0f172a]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all duration-200 backdrop-blur-md">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          <Search className="w-5 h-5 text-blue-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-transparent text-white text-base font-normal placeholder-slate-500 border-none outline-none focus:ring-0 transition-all duration-200"
          style={{ backgroundColor: "transparent" }}
          aria-label="Search games by name or provider"
          autoComplete="off"
          spellCheck="false"
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
