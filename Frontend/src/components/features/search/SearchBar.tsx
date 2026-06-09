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
      <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-200">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          <Search className="w-5 h-5 text-rose-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-transparent text-slate-900 text-base font-400 placeholder-slate-400 border-none outline-none focus:ring-0 transition-all duration-200"
          style={{ backgroundColor: "transparent" }}
          aria-label="Search games by name or provider"
          autoComplete="off"
          spellCheck="false"
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all duration-200 cursor-pointer"
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
