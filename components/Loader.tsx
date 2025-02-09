// components/Loader.tsx
"use client";

import React from "react";

interface LoaderProps {
  size?: string; // e.g., "w-6 h-6" or "w-12 h-12"
  color?: string; // e.g., "border-white" or "border-red-500"
}

const Loader: React.FC<LoaderProps> = ({ size = "w-8 h-8", color = "border-gray-500" }) => {
  return (
    <div className={`flex justify-center items-center`}>
      <div className={`${size} border-4 border-t-transparent ${color} rounded-full animate-spin`}></div>
    </div>
  );
};

export default Loader;
