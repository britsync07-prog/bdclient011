import React from "react";
import { FooterBottomSection } from "./FooterBottomSection";
import { FooterMainContent } from "./FooterMainContent";

interface FooterProps {
  onOpenPolicy: (title: string, contentKey: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="bg-[#0b1329] border-t border-slate-800 relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative">
        <FooterMainContent onOpenPolicy={onOpenPolicy} />
        <FooterBottomSection onOpenPolicy={onOpenPolicy} />
      </div>
    </footer>
  );
};
