import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { PLACEHOLDER_MESSAGES, ANIMATION_DURATION } from "@/constants";

interface EmptyStateProps {
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-rose-50 border-2 border-rose-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Search className="w-10 h-10 text-rose-400" aria-hidden="true" />
          </div>
          <div
            className="absolute inset-0 bg-rose-200/30 rounded-full blur-xl opacity-60"
            aria-hidden="true"
          />
        </div>

        <h3 className="text-2xl font-700 text-slate-800 mb-3">
          {PLACEHOLDER_MESSAGES.NO_GAMES_FOUND}
        </h3>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-slate-500 text-center leading-relaxed text-sm">
            {PLACEHOLDER_MESSAGES.NO_GAMES}
          </p>
        </div>

        <button
          onClick={onClearFilters}
          className="btn-primary px-8 py-3.5 rounded-2xl font-600 text-base transition-all flex items-center gap-2.5 mx-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          style={{ transitionDuration: `${ANIMATION_DURATION.MEDIUM}ms` }}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>{PLACEHOLDER_MESSAGES.RESET_FILTERS}</span>
        </button>
      </div>
    </div>
  );
};
