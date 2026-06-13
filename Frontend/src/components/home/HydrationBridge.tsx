"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { AuthHydrator } from "./AuthHydrator";
import { BannerHydrator } from "./BannerHydrator";
import { GameHydrator } from "./GameHydrator";
import { useRouter } from "next/navigation";

export const HydrationBridge: React.FC = () => {
  const [mounted, setLoading] = useState(false);
  const [targets, setTargets] = useState<{
    auth: HTMLElement | null;
    banner: HTMLElement | null;
    games: HTMLElement[];
    logo: HTMLElement | null;
  }>({
    auth: null,
    banner: null,
    games: [],
    logo: null,
  });

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    
    const findTargets = () => {
      const auth = document.querySelector(".header-desktop__auth-container") as HTMLElement;
      const banner = document.querySelector("mcd-top-banner") as HTMLElement;
      const games = Array.from(document.querySelectorAll(".games-box")) as HTMLElement[];
      const logo = document.querySelector(".header-desktop__logo") as HTMLElement;
      const sidebarItems = Array.from(document.querySelectorAll(".left-menu-content__item")) as HTMLElement[];
      const chatBtn = document.querySelector("#cxgenie-chat-button") as HTMLElement;
      
      setTargets({ auth, banner, games, logo });
      
      if (chatBtn) {
        chatBtn.onclick = () => {
          // Open chat logic
          console.log("Chat clicked");
        };
      }
      
      // Sidebar Interactivity
      sidebarItems.forEach(item => {
        const category = item.getAttribute("data-category");
        if (category) {
          item.style.cursor = "pointer";
          item.onclick = () => {
             // We can't easily call useGameStore from here directly for all items
             // but we can trigger a custom event or use window object
             (window as any).dispatchCategoryChange?.(category);
          };
        }
      });
    };

    // Small delay to ensure DOM is fully ready from dangerouslySetInnerHTML
    const timer = setTimeout(findTargets, 100);

    return () => clearTimeout(timer);
  }, []);

  // Global Interactivity
  useEffect(() => {
    if (targets.logo) {
      const handleLogoClick = () => router.push("/");
      targets.logo.addEventListener("click", handleLogoClick);
      targets.logo.style.cursor = "pointer";
      return () => targets.logo?.removeEventListener("click", handleLogoClick);
    }
  }, [targets.logo, router]);

  if (!mounted) return null;

  return (
    <>
      {targets.auth && createPortal(<AuthHydrator />, targets.auth)}
      {targets.banner && createPortal(<BannerHydrator />, targets.banner)}
      {targets.games.map((container, idx) => 
        createPortal(<GameHydrator key={idx} category={container.getAttribute("data-category") || "all"} />, container)
      )}
    </>
  );
};
