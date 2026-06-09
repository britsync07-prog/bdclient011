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
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#FFF1F2] to-[#EFF6FF] flex items-center justify-center relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} aria-hidden="true" />

      <div className="text-center relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-800 text-rose-600 italic tracking-tighter mb-1" aria-label="PBBET">
            PBBET
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-500">
            Premium iGaming
          </p>
        </div>

        {/* Spinner */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" aria-hidden="true" />
          <Loader2 className="absolute w-7 h-7 text-rose-400 animate-spin" aria-hidden="true" />
        </div>

        {/* Message */}
        <p className="text-slate-600 text-base font-500 mb-6">{message}</p>

        {/* Dots */}
        <div className="flex justify-center space-x-2" role="status" aria-label="Loading">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
};
