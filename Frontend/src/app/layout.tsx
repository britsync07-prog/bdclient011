import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/contexts/AppProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PBBET | Premium Crypto Casino",
  description: "Experience the ultimate crypto casino with PBBET — premium slots, live casino, sports betting & more.",
  keywords: "casino, crypto casino, slots, live casino, blackjack, roulette, pbbet, igaming, online gaming, bitcoin casino",
  openGraph: {
    title: "PBBET | Premium Crypto Casino",
    description: "Experience the ultimate crypto casino with PBBET.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b1329",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning={true} className="bg-[#0b1329] text-slate-100 font-sans antialiased">
        <ErrorBoundary>
          <AppProviders>{children}</AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
