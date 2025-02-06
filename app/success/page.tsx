"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react"; // Import Suspense
import Image from "next/image"
import { Fredoka, Poppins } from "next/font/google"
import HeartBackground from "@/components/HeartBackground"
import ClickHeartEffect from "@/components/ClickHeartEffect"
import pcBg from "@/assets/mofu yay pc.png"
import mobileBg from "@/assets/mofu yay mobile.png"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

function SuccessPage() {
  return (
    <div className="h-screen relative bg-[#ffeded] overflow-hidden">
      <HeartBackground />
      <ClickHeartEffect />
      
      {/* Content */}
      <div className="relative z-10 mt-[5vh] md:mt-[80px] md:ml-[5vw] text-center md:text-left md:w-[800px]">
        <h1 className={`text-[14vw] leading-[1] md:text-9xl py-1 font-bold text-[#d98f8f] mb-[4vh] md:mb-[4vh] ${fredoka.className}`}>
          Your Website<br />
          is Live!
        </h1>
        <Suspense fallback={<p className={poppins.className}>Loading...</p>}>
          <SearchParamsContent />
        </Suspense>
      </div>

      {/* Background Images */}
      <div className="fixed bottom-0 left-0 w-full pointer-events-none">
        <div className="hidden md:block">
          <Image
            src={pcBg}
            alt="Background"
            width={1920}
            height={1080}
            className="w-full object-contain"
            priority
          />
        </div>
        <div className="block md:hidden">
          <Image
            src={mobileBg}
            alt="Background Mobile"
            width={390}
            height={844}
            className="w-full object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}

function SearchParamsContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  return (
    <div className={poppins.className}>
      {id && (
        <Link href={`/card/${id}`} prefetch>
        <button
          className={`bg-[#d98f8f] text-white font-bold text-[5vw] md:text-4xl py-[2vh] md:py-8 px-[5vw] md:px-[60px] rounded-full whitespace-nowrap 
          z-30 relative cursor-pointer
          transition-shadow duration-200 ease-in-out hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]
          ${fredoka.className}`}
        >
          View your card →
        </button>
      </Link>
      )}
      {!id && <p className="text-[5vw] md:text-4xl text-[#d98f8f]">No id provided</p>}
    </div>
  )
}

export default SuccessPage