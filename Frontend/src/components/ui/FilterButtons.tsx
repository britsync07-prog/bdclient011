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
          ? "bg-[#E11D48] text-white border-[#E11D48] shadow-lg shadow-rose-200"
          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-rose-200 hover:shadow-sm hover:bg-rose-50/50"
      }`}
      style={{ transitionDuration: `${ANIMATION_DURATION.MEDIUM}ms` }}
    >
      <span>{children}</span>

      {count !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-700 ${
            active
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
