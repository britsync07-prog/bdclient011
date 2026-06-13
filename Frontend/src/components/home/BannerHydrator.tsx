"use client";

import React from "react";
import { Banners } from "../features/banners/Banners";

export const BannerHydrator: React.FC = () => {
  return (
    <div className="w-full">
      <Banners />
    </div>
  );
};
