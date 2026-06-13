import React from "react";
import { FilterButtonProps } from "@/types/game";
import { ANIMATION_DURATION } from "@/constants";

export const FilterButton: React.FC<FilterButtonProps> = ({
  active,
  onClick,
  children,
  count,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative px-4 py-2.5 rounded-xl text-sm font-600 transition-all duration-200 cursor-pointer border flex items-center gap-2 ${
        active
          ? "bg-[#3b82f6] text-white border-[#3b82f6] shadow-lg shadow-blue-500/30"
          : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-850 hover:border-[#3b82f6]/30 hover:shadow-sm hover:bg-slate-200"
      }`}
      style={{ transitionDuration: `${ANIMATION_DURATION.MEDIUM}ms` }}
    >
      <span>{children}</span>

      {count !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-700 ${
            active
              ? "bg-white/20 text-white"
              : "bg-slate-200 text-slate-500 group-hover:bg-slate-300 group-hover:text-[#3b82f6]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
