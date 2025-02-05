"use client"

import Link from "next/link";
import bg from "../assets/mofu pc transparent bigger.png";
import happy from "../assets/mofu vday happy.png";
import sad from "../assets/mofu vday sad.png";
import Image from "next/image";
import { useState } from "react";
import { Fredoka, Poppins } from "next/font/google";
import HeartBackground from "@/components/HeartBackground";
import ClickHeartEffect from "@/components/ClickHeartEffect";

const fredoka = Fredoka({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400']
});

export default function Page() {
  const [isCreateHovered, setIsCreateHovered] = useState(false);
  const [isExampleHovered, setIsExampleHovered] = useState(false);

  return (
    <div className="h-screen relative bg-[#ffeded] overflow-hidden">
      <HeartBackground />
      <ClickHeartEffect />
      <div className="relative z-10 mt-[80px] ml-[100px]">
        <h1 className={`text-9xl font-bold mb-2 text-[#d98f8f] ${fredoka.className}`}>
          Valentine's Day
        </h1>
        <h2 className={`text-7xl font-bold mb-6 text-[#d98f8f] ${fredoka.className}`}>
          Personal Website Generator
        </h2>
        <p className={`text-4xl max-w-5xl leading-relaxed text-[#aa9a7d] ${poppins.className}`}>
          Your potential valentine deserves more than a DM.<br/>
          Enter details, add pics, and get a link.<br/>
          Zero coding required.
        </p>
      </div>

      <div 
        className="absolute bottom-[120px] left-[100px] z-20 cursor-pointer group"        
        onMouseEnter={() => setIsCreateHovered(true)}
        onMouseLeave={() => setIsCreateHovered(false)}
      >
        <button className="bg-[#d98f8f] text-white font-bold text-3xl py-8 px-[80px] rounded-full relative z-10 transition-shadow duration-200 ease-in-out group-hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]">
          Create Website
        </button>

        <div className="w-[288px] h-[260px] -mt-[275px] relative z-20 left-1/2 -translate-x-1/2">
          <Image
            src={isCreateHovered ? happy : sad}
            alt="Mood"
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      <div 
        className="absolute bottom-[120px] left-[550px] z-20 cursor-pointer group"        
        onMouseEnter={() => setIsExampleHovered(true)}
        onMouseLeave={() => setIsExampleHovered(false)}
        onClick={() => window.open('/example', '_blank')}
      >
        <button className="bg-[#d98f8f] text-white font-bold text-3xl py-8 px-[80px] rounded-full relative z-10 transition-shadow duration-200 ease-in-out group-hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]">
          See Example
        </button>

        <div className="w-[288px] h-[260px] -mt-[275px] relative z-20 left-1/2 -translate-x-1/2">
          <Image
            src={isExampleHovered ? happy : sad}
            alt="Mood"
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      <Image
        src={bg}
        alt="Background"
        className="absolute bottom-0 w-full object-contain"
        priority
      />
    </div>
  );
}