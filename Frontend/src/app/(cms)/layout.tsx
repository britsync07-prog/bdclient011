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
  description: "Experience the ultimate crypto casino with PBBET.",
};

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning={true} className="bg-[#0b1329] text-slate-100 font-sans antialiased">      
        {children}
      </body>
    </html>
  );
}
