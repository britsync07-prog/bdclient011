"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
const IMAGE_BASE = BACKEND_URL.replace("/api", "");

interface Banner {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
}

export const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/user/banners`);
        const data = await res.json();
        if (res.ok && data.success) {
          // In this view, we show all banners in the carousel
          setBanners(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (loading || banners.length === 0) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl shadow-2xl border border-slate-700/50 relative group aspect-[21/9] sm:aspect-[21/7]">
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {banners.map((banner) => {
          const fullImageUrl = banner.imageUrl.startsWith("http")
            ? banner.imageUrl
            : `${IMAGE_BASE}${banner.imageUrl}`;

          const content = (
            <div className="w-full h-full relative cursor-pointer">
              <img
                src={fullImageUrl}
                alt="PBBET Banner"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          );

          return (
            <div key={banner.id} className="w-full h-full shrink-0 relative">
              {banner.linkUrl ? (
                <a href={banner.linkUrl} className="block w-full h-full">
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex ? "bg-blue-500 w-6" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
