import React, { useEffect, useState } from "react";
import { FOOTER_MAIN_MESSAGES } from "@/constants";
import {
  Gamepad2,
  Building2,
  HeadphonesIcon,
  Mail,
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

// Social icon SVGs (Lucide doesn't have Twitter/Instagram/Telegram/Facebook)
const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

interface SocialLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}
const SocialLink: React.FC<SocialLinkProps> = ({ href, label, icon }) => (
  <a
    href={href || "#"}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E11D48] hover:border-[#E11D48]/30 hover:shadow-md cursor-pointer transition-all duration-200"
  >
    {icon}
  </a>
);

interface FooterLinkColumnProps {
  title: string;
  icon: React.ReactNode;
  links: { label: string; href?: string; key?: string }[];
  onOpenPolicy: (title: string, contentKey: string) => void;
}
const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({
  title,
  icon,
  links,
  onOpenPolicy,
}) => (
  <div>
    <h4 className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-widest mb-4">
      <span className="text-[#E11D48]">{icon}</span>
      {title}
    </h4>
    <ul className="space-y-2.5">
      {links.map(({ label, href, key }) => (
        <li key={label}>
          {key ? (
            <button
              onClick={() => onOpenPolicy(label, key)}
              className="text-sm text-slate-500 hover:text-[#E11D48] cursor-pointer transition-colors duration-200 font-medium bg-transparent border-none p-0 text-left"
            >
              {label}
            </button>
          ) : (
            <a
              href={href || "#"}
              className="text-sm text-slate-500 hover:text-[#E11D48] cursor-pointer transition-colors duration-200 font-medium"
            >
              {label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

interface FooterMainContentProps {
  onOpenPolicy: (title: string, contentKey: string) => void;
}

export const FooterMainContent: React.FC<FooterMainContentProps> = ({
  onOpenPolicy,
}) => {
  const [estYear, setEstYear] = useState(2024);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setEstYear(currentYear - 1);

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/user/settings`);
        const data = await res.json();
        if (res.ok && data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);

  const gameLinks = [
    { label: "Casino Games", href: "/#games" },
    { label: "Live Dealers", href: "/#games" },
    { label: "Slot Machines", href: "/#games" },
    { label: "Tournaments" },
    { label: "VIP Club" },
  ];

  const companyLinks = [
    { label: "About PBBET", key: "about_us" },
    { label: "Blog & News" },
    { label: "Careers" },
    { label: "Affiliate Program" },
  ];

  const supportLinks = [
    { label: "24/7 Live Support" },
    { label: "Responsible Gaming", key: "responsible_gaming" },
    { label: "Security Center" },
    { label: "FAQ" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
      {/* Brand column */}
      <div className="lg:col-span-1">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#FB7185] flex items-center justify-center shadow-md">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#E11D48]">
            PBBET
          </span>
        </div>

        {/* Tagline */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          {settings.about_us ||
            FOOTER_MAIN_MESSAGES.PREMIUM_GAMING_EXCELLENCE}
        </p>

        {/* Est badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E11D48]/8 border border-[#E11D48]/15 mb-6">
          <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-widest">
            {FOOTER_MAIN_MESSAGES.EST} {estYear}
          </span>
        </div>

        {/* Social links */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Follow Us
          </p>
          <div className="flex items-center gap-2">
            <SocialLink
              href={settings.social_twitter || "#"}
              label="Follow us on X (Twitter)"
              icon={<TwitterXIcon />}
            />
            <SocialLink
              href={settings.social_facebook || "#"}
              label="Follow us on Facebook"
              icon={<FacebookIcon />}
            />
            <SocialLink
              href={settings.social_instagram || "#"}
              label="Follow us on Instagram"
              icon={<InstagramIcon />}
            />
            <SocialLink
              href={settings.social_telegram || "#"}
              label="Join us on Telegram"
              icon={<TelegramIcon />}
            />
            <SocialLink
              href={settings.contact_email ? `mailto:${settings.contact_email}` : "#"}
              label="Email us"
              icon={<Mail size={14} />}
            />
          </div>
        </div>
      </div>

      {/* Link columns */}
      <FooterLinkColumn
        title="Games"
        icon={<Gamepad2 size={13} />}
        links={gameLinks}
        onOpenPolicy={onOpenPolicy}
      />
      <FooterLinkColumn
        title="Company"
        icon={<Building2 size={13} />}
        links={companyLinks}
        onOpenPolicy={onOpenPolicy}
      />
      <FooterLinkColumn
        title="Support"
        icon={<HeadphonesIcon size={13} />}
        links={supportLinks}
        onOpenPolicy={onOpenPolicy}
      />

      {/* Payment Partners & Game Providers Section (Stake / PBC88 style) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-slate-200/60 pt-8 mt-4 space-y-6">
        {/* Payment Methods */}
        <div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">Accepted Payment Methods</h5>
          <div className="flex flex-wrap items-center gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            {/* bKash */}
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 text-[11px] font-black text-[#E11D48] select-none">
              <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
              bKash
            </div>
            {/* Nagad */}
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 text-[11px] font-black text-[#EA580C] select-none">
              <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
              Nagad
            </div>
            {/* Rocket */}
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 text-[11px] font-black text-[#8B5CF6] select-none">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              Rocket
            </div>
            {/* Astropay */}
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 text-[11px] font-black text-[#0369A1] select-none">
              Astropay
            </div>
            {/* USDT Tether */}
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 text-[11px] font-black text-[#0F766E] select-none">
              USDT (Tether)
            </div>
            {/* Visa/Mastercard */}
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 text-[11px] font-black text-slate-700 select-none">
              Visa / MasterCard
            </div>
          </div>
        </div>

        {/* Game Providers */}
        <div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">Software Game Providers</h5>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider">PRAGMATIC PLAY</span>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider">PG SOFT</span>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider">EVOLUTION</span>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider">JILI GAMES</span>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider">SPRIBE</span>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider">JDB</span>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider">HACKSAW</span>
          </div>
        </div>
      </div>
    </div>
  );
};
