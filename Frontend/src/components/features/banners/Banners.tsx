"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

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
          // Banners with title configurations are promo events cards, hide them from slider
          const imageOnlyBanners = (data.data || []).filter((b: Banner) => !b.title);
          setBanners(imageOnlyBanners);
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Dynamic banner automatic rotation timer (every 1 second)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [banners]);

  if (loading || banners.length === 0) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl shadow-md border border-slate-100 relative group aspect-[21/9] sm:aspect-[21/7]">
      <div 
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {banners.map((banner) => {
          const content = (
            <div className="w-full h-full relative cursor-pointer">
              <Image 
                src={banner.imageUrl} 
                alt="Casino Campaign Banner" 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-103"
              />
            </div>
          );

          return (
            <div key={banner.id} className="w-full h-full shrink-0 relative aspect-[21/9] sm:aspect-[21/7]">
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

      {/* Navigation Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex ? "bg-[#E11D48] w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
