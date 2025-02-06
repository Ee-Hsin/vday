"use client"

import Link from "next/link"
import bg from "../assets/mofu pc transparent bigger.png"
import bgMobile from "../assets/vday landing phone.png"
import happy from "../assets/mofu vday happy.png"
import sad from "../assets/mofu vday sad.png"
import Image from "next/image"
import { useState } from "react"
import { Fredoka, Poppins } from "next/font/google"
import HeartBackground from "@/components/HeartBackground"
import ClickHeartEffect from "@/components/ClickHeartEffect"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

export default function Page() {
  const [isCreateHovered, setIsCreateHovered] = useState(false)
  const [isExampleHovered, setIsExampleHovered] = useState(false)

  const isClient = typeof window !== "undefined"

  return (
    <div className="h-screen relative bg-[#ffeded] overflow-hidden">
      <HeartBackground />
      <ClickHeartEffect />
      <div className="relative z-10 mt-[5vh] md:mt-[80px] px-[5vw] md:px-0 md:ml-[100px] w-full md:w-auto text-center md:text-left">
        <h1
          className={`text-[12vw] md:text-9xl font-bold mb-[0vh] text-[#d98f8f] ${fredoka.className}`}
        >
          Valentine&apos;s Day
        </h1>
        <h2
          className={`text-[10vw] md:text-7xl font-bold mb-[3.5vh] text-[#d98f8f] leading-[0.9] md:leading-normal ${fredoka.className}`}
        >
          Personal Website Generator
        </h2>
        <p
          className={`text-[5vw] md:text-4xl max-w-5xl leading-relaxed text-[#aa9a7d] ${poppins.className}`}
        >
          <span>Your potential valentine deserves more than a DM.</span>
          <span className="inline md:hidden">&nbsp;</span>
          <br className="hidden md:block" />
          <span>Enter details, add pics, and get a link.</span>
          <span className="inline md:hidden">&nbsp;</span>
          <br className="hidden md:block" />
          <span>No coding required.</span>
        </p>
      </div>

      <div className="mt-[7vh] md:static w-full px-[5vw] flex justify-center gap-[4vw] md:block">
        <Link href="/form">
        <div
          className="md:absolute md:bottom-[120px] md:left-[100px] z-20 cursor-pointer group"
          onMouseEnter={() => setIsCreateHovered(true)}
          onMouseLeave={() => setIsCreateHovered(false)}
        >
          <button
            className={`bg-[#d98f8f] text-white font-bold text-[5vw] whitespace-nowrap md:text-4xl py-[2vh] md:py-8 px-[4vw] md:px-[60px] rounded-full relative z-10 transition-shadow duration-200 ease-in-out group-hover:shadow-[0_0_20px_rgba(217,143,143,0.8)] ${fredoka.className}`}
          >
            Create Website
          </button>

          <div className="w-[30vw] h-[15vh] -mt-[16vh] md:w-[288px] md:h-[260px] md:-mt-[275px] relative z-20 left-1/2 -translate-x-1/2">
            <Image
              src={
                isClient && window.innerWidth >= 768
                  ? isCreateHovered
                    ? happy
                    : sad
                  : happy
              }
              alt="Mood"
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>
        </Link>

        <Link href="/example" target="_blank" rel="noopener noreferrer">
          <div
            className="md:absolute md:bottom-[120px] md:left-[550px] z-20 cursor-pointer group"
            onMouseEnter={() => setIsExampleHovered(true)}
            onMouseLeave={() => setIsExampleHovered(false)}
          >
            <button
              className={`bg-[#d98f8f] text-white font-bold text-[5vw] whitespace-nowrap md:text-4xl py-[2vh] md:py-8 px-[4vw] md:px-[60px] rounded-full relative z-10 transition-shadow duration-200 ease-in-out group-hover:shadow-[0_0_20px_rgba(217,143,143,0.8)] ${fredoka.className}`}
            >
              See Example
            </button>
            <div className="w-[30vw] h-[15vh] -mt-[16vh] md:w-[288px] md:h-[260px] md:-mt-[275px] relative z-20 left-1/2 -translate-x-1/2">
              <Image
                src={
                  isClient && window.innerWidth >= 768
                    ? isExampleHovered
                      ? happy
                      : sad
                    : happy
                }
                alt="Mood"
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
        </Link>
      </div>
      <Image
        src={bg}
        alt="Background"
        className="hidden md:block absolute bottom-0 right-0 w-screen h-auto object-contain z-0"
        priority
      />
      <Image
        src={bgMobile}
        alt="Background"
        className="md:hidden absolute bottom-0 right-0 w-full h-auto object-contain z-0"
        priority
      />
    </div>
  )
}
