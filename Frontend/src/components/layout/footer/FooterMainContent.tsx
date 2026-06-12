import React, { useEffect, useState } from "react";
import { TRANSLATIONS } from "@/constants";
import {
  Gamepad2,
  Building2,
  HeadphonesIcon,
  Mail,
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const paymentLogos = [
  { src: "/images/payments/pay34.png", alt: "bKash" },
  { src: "/images/payments/pay22.png", alt: "Nagad" },
  { src: "/images/payments/pay33.png", alt: "Rocket" },
  { src: "/images/payments/pay61.png", alt: "Upay" },
  { src: "/images/payments/pay59.png", alt: "Tether USDT" },
  { src: "/images/payments/pay45.png", alt: "Bank Transfer" },
];

const providerLogos = [
  { src: "/images/providers/provider-awcv2_combo.png", alt: "AWC Combo" },
  { src: "/images/providers/provider-saba.png", alt: "SABA" },
  { src: "/images/providers/provider-jdb.png", alt: "JDB" },
  { src: "/images/providers/provider-cq9.png", alt: "CQ9" },
  { src: "/images/providers/provider-pg.png", alt: "PG Soft" },
  { src: "/images/providers/provider-evo.png", alt: "Evolution" },
  { src: "/images/providers/provider-joker.png", alt: "Joker" },
  { src: "/images/providers/provider-cricket.png", alt: "Cricket" },
  { src: "/images/providers/provider-sbov2.png", alt: "SBO" },
  { src: "/images/providers/provider-bpoker.png", alt: "B-Poker" },
  { src: "/images/providers/provider-ka.png", alt: "KA Gaming" },
  { src: "/images/providers/provider-awcv2_sexybcrt.png", alt: "Sexy Baccarat" },
  { src: "/images/providers/provider-awcv2_rt.png", alt: "RT" },
  { src: "/images/providers/provider-awcv2_spade.png", alt: "Spadegaming" },
  { src: "/images/providers/provider-awcv2_kingmaker.png", alt: "Kingmaker" },
  { src: "/images/providers/provider-awcv2_jili.png", alt: "JILI" },
  { src: "/images/providers/provider-awcv2_play8.png", alt: "Play8" },
  { src: "/images/providers/provider-awcv2_fc.png", alt: "FC" },
  { src: "/images/providers/provider-awcv2_yl.png", alt: "YL" },
  { src: "/images/providers/provider-awcv2_pp.png", alt: "Pragmatic Play" },
  { src: "/images/providers/provider-awcv2_pt.png", alt: "Playtech" },
  { src: "/images/providers/provider-awcv2_horsebook.png", alt: "Horsebook" },
  { src: "/images/providers/provider-netent.png", alt: "NetEnt" },
  { src: "/images/providers/provider-ps.png", alt: "PS" },
  { src: "/images/providers/provider-playngo.png", alt: "Play'n GO" },
  { src: "/images/providers/provider-rich88.png", alt: "Rich88" },
  { src: "/images/providers/provider-worldmatch.png", alt: "WorldMatch" },
  { src: "/images/providers/provider-awcv2_fastspin.png", alt: "Fastspin" },
  { src: "/images/providers/provider-awcv2_yesbingo.png", alt: "YesBingo" },
  { src: "/images/providers/provider-jdbaspribe.png", alt: "JDB Aspribe" },
  { src: "/images/providers/provider-hotroad.png", alt: "Hotroad" },
];

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
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
    className="w-9 h-9 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#3b82f6] hover:border-[#3b82f6]/30 hover:shadow-md cursor-pointer transition-all duration-200"
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
    <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest mb-4">
      <span className="text-[#3b82f6]">{icon}</span>
      {title}
    </h4>
    <ul className="space-y-2.5">
      {links.map(({ label, href, key }) => (
        <li key={label}>
          {key ? (
            <button
              onClick={() => onOpenPolicy(label, key)}
              className="text-sm text-slate-400 hover:text-[#3b82f6] cursor-pointer transition-colors duration-200 font-medium bg-transparent border-none p-0 text-left"
            >
              {label}
            </button>
          ) : (
            <a
              href={href || "#"}
              className="text-sm text-slate-400 hover:text-[#3b82f6] cursor-pointer transition-colors duration-200 font-medium"
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
  lang?: "EN" | "BN";
}

export const FooterMainContent: React.FC<FooterMainContentProps> = ({
  onOpenPolicy,
  lang = "BN",
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

  const t = TRANSLATIONS[lang];

  const gameLinks = lang === "BN" ? [
    { label: "ক্যাসিনো গেমস", href: "/#games" },
    { label: "লাইভ ডিলার", href: "/#games" },
    { label: "স্লট মেশিন", href: "/#games" },
    { label: "টুর্নামেন্ট" },
    { label: "ভিআইপি ক্লাব" },
  ] : [
    { label: "Casino Games", href: "/#games" },
    { label: "Live Dealers", href: "/#games" },
    { label: "Slot Machines", href: "/#games" },
    { label: "Tournaments" },
    { label: "VIP Club" },
  ];

  const companyLinks = lang === "BN" ? [
    { label: "আমাদের সম্পর্কে", key: "about_us" },
    { label: "ব্লগ ও খবর" },
    { label: "ক্যারিয়ার" },
    { label: "অধিভুক্ত প্রোগ্রাম" },
  ] : [
    { label: "About Us", key: "about_us" },
    { label: "Blog & News" },
    { label: "Careers" },
    { label: "Affiliate Program" },
  ];

  const supportLinks = lang === "BN" ? [
    { label: "24/7 লাইভ সাপোর্ট" },
    { label: "দায়িত্বশীল গেম খেলা", key: "responsible_gaming" },
    { label: "নিরাপত্তা কেন্দ্র" },
    { label: "প্রশ্নাবলী (FAQ)" },
  ] : [
    { label: "24/7 Live Support" },
    { label: "Play Responsibly", key: "responsible_gaming" },
    { label: "Security Center" },
    { label: "FAQ Help" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
      {/* Brand column */}
      <div className="lg:col-span-1">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center shadow-md">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#3b82f6]">
            PBBET
          </span>
        </div>

        {/* Tagline */}
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          {settings.about_us || t.PREMIUM_GAMING_EXCELLENCE}
        </p>

        {/* Est badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3b82f6]/8 border border-[#3b82f6]/15 mb-6">
          <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest">
            {t.EST} {estYear}
          </span>
        </div>

        {/* Social links */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            {lang === "BN" ? "আমাদের অনুসরণ করুন" : "Follow Us"}
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
        title={t.GAMES}
        icon={<Gamepad2 size={13} />}
        links={gameLinks}
        onOpenPolicy={onOpenPolicy}
      />
      <FooterLinkColumn
        title={lang === "BN" ? "কোম্পানি" : "Company"}
        icon={<Building2 size={13} />}
        links={companyLinks}
        onOpenPolicy={onOpenPolicy}
      />
      <FooterLinkColumn
        title={lang === "BN" ? "গ্রাহক সেবা" : "Support"}
        icon={<HeadphonesIcon size={13} />}
        links={supportLinks}
        onOpenPolicy={onOpenPolicy}
      />

      {/* Payment Partners & Game Providers Section */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-slate-800 pt-8 mt-4 space-y-6">
        {/* Payment Methods */}
        <div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">
            {lang === "BN" ? "মুল্য পরিশোধ পদ্ধতি" : "Payment Methods"}
          </h5>
          <div className="flex flex-wrap items-center gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            {paymentLogos.map((logo, index) => (
              <div key={index} className="bg-[#0f172a] p-1.5 px-3 rounded-lg border border-slate-800 shadow-sm flex items-center justify-center">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.alt}
                  className="h-[24px] w-auto object-contain select-none"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Game Providers */}
        <div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">
            {lang === "BN" ? "পার্টনার" : "Partners"}
          </h5>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            {providerLogos.map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                title={logo.alt}
                className="h-[22px] md:h-[24px] w-auto object-contain select-none"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
