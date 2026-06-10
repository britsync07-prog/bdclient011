import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";

import { AppProviders } from "@/contexts/AppProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "PBBET | Premium iGaming Platform",
  description: "Experience the future of live casino and premium slots with PBBET — the next-generation iGaming platform.",
  keywords: "casino, games, slots, live casino, blackjack, roulette, pbbet, igaming, online gaming, live dealers",
  openGraph: {
    title: "PBBET | Premium iGaming Platform",
    description: "Experience the future of live casino and premium slots with PBBET.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={dmSans.variable}>
      <body suppressHydrationWarning={true} className="bg-[#020617] text-slate-100 font-sans">
        <ErrorBoundary>
          <AppProviders>{children}</AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
