import React from "react";
import { Loader2 } from "lucide-react";
import { PLACEHOLDER_MESSAGES } from "@/constants";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = PLACEHOLDER_MESSAGES.LOADING,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1329] to-[#020617] flex items-center justify-center relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} aria-hidden="true" />

      <div className="text-center relative z-10 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl shadow-2xl">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-[#3b82f6] tracking-tighter mb-1" aria-label="PBBET">
            PBBET
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
            Premium iGaming
          </p>
        </div>

        {/* Spinner */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full border-4 border-blue-900/30 border-t-blue-500 animate-spin" aria-hidden="true" />
          <Loader2 className="absolute w-7 h-7 text-blue-400 animate-spin" aria-hidden="true" />
        </div>

        {/* Message */}
        <p className="text-slate-300 text-sm font-medium mb-6">{message}</p>

        {/* Dots */}
        <div className="flex justify-center space-x-2" role="status" aria-label="Loading">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
};
