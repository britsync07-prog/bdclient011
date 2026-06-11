import React, { useState, useEffect } from "react";
import { FOOTER_BOTTOM_MESSAGES } from "@/constants";
import { AlertTriangle, ShieldCheck, BadgeCheck } from "lucide-react";

interface FooterBottomSectionProps {
  onOpenPolicy: (title: string, contentKey: string) => void;
}

export const FooterBottomSection: React.FC<FooterBottomSectionProps> = ({
  onOpenPolicy,
}) => {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const legalLinks = [
    { label: "গোপনীয়তা নীতি", key: "privacy_policy" },
    { label: "শর্তাবলী", key: "terms_conditions" },
    { label: "দায়িত্বশীল গেম্বলিং", key: "responsible_gaming" },
  ];

  return (
    <>
      {/* Divider */}
      <div className="border-t border-slate-800 pt-8 space-y-6">
        {/* Responsible Gaming Notice */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
              <AlertTriangle size={16} className="text-[#3b82f6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white mb-1">
                {FOOTER_BOTTOM_MESSAGES.PLAY_RESPONSIBLY}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {FOOTER_BOTTOM_MESSAGES.PLAY_RESPONSIBLY_DETAILS}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck size={13} className="text-[#3b82f6] shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-300">
                    {FOOTER_BOTTOM_MESSAGES.OVER18_ONLY}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#3b82f6] shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-300">
                    {FOOTER_BOTTOM_MESSAGES.LICENSED_REGULATED}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#3b82f6] shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-300">
                    {FOOTER_BOTTOM_MESSAGES.SECURE_GAMING}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: copyright + legal links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400 font-medium">
              © <span id="copyright-year">{currentYear}</span>{" "}
              <span className="font-bold text-[#3b82f6]">PBBET</span>
              {" "}— {FOOTER_BOTTOM_MESSAGES.ROYAL_CASINO_CRAFTED}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {FOOTER_BOTTOM_MESSAGES.PREMIUM_GAMING_EXPERIENCE}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {legalLinks.map((legal) => (
              <button
                key={legal.label}
                onClick={() => onOpenPolicy(legal.label, legal.key)}
                className="text-xs text-slate-400 hover:text-[#3b82f6] cursor-pointer transition-colors duration-200 font-medium hover:underline underline-offset-2 bg-transparent border-none p-0"
              >
                {legal.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
