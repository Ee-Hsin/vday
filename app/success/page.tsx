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
import { MdHome } from "react-icons/md"
import { useEffect, useState } from 'react'
import { IoCopy } from "react-icons/io5";
import toast, { Toaster } from 'react-hot-toast';

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

function SuccessPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  return (
    <div className="h-screen relative bg-[#ffeded] overflow-hidden">
      <Toaster position="bottom-center" />
      <HeartBackground />
      <ClickHeartEffect />
      <Link 
        href="/"
        className="absolute top-5 left-5 z-20 text-[#d98f8f] hover:text-[#b35151] transition-colors"
      >
        <MdHome className="w-[4vh] h-[4vh] md:w-[40px] md:h-[40px]" />
      </Link>
      
      {/* Content */}
      <div className="relative z-10 mt-[5vh] md:mt-[80px] md:ml-[5vw] text-center md:text-center md:w-[45vw]">
        <h1 className={`text-[14vw] leading-[1] md:text-9xl py-1 font-bold text-[#d98f8f] mb-[4vh] md:mb-[4vh] ${fredoka.className}`}>
          {id ? (
            <>Your <br className="block md:hidden" />Website<br />is Live!</>
          ) : (
            <>Something<br />Went Wrong</>
          )}
        </h1>
        <p className={`text-[5vw] md:text-4xl max-w-5xl leading-relaxed text-[#aa9a7d] px-[5vw] mb-[4vh] md:mb-[4vh] ${poppins.className}`}>
        {id ? (
            "Share this link with your potential valentine. We hope they say yes!"
          ) : (
            "Please try submitting the form again. Make sure there is an 'id value' in this page's url."
          )}
        </p>
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
  const [cardUrl, setCardUrl] = useState('')

  useEffect(() => {
    if (id) {
      setCardUrl(`${window.location.origin}/card/${id}`)
    }
  }, [id])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl)
      toast.success('Link copied to clipboard!', {
        style: {
          background: '#F5E6E6',
          color: '#d98f8f',
          fontFamily: fredoka.style.fontFamily,
        },
        iconTheme: {
          primary: '#d98f8f',
          secondary: '#fff',
        }
      });
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={poppins.className}>
      {id && (
        <div className="flex gap-[4vw] justify-center">
        <Link 
          href={`/card/${id}`} 
          prefetch
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            className={`bg-[#d98f8f] text-white font-bold text-[5vw] md:text-4xl py-[2vh] md:py-8 px-[6vw] md:px-[60px] rounded-full whitespace-nowrap 
            z-30 relative cursor-pointer
            transition-shadow duration-200 ease-in-out hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]
            ${fredoka.className}`}
          >
            Visit Site
          </button>
        </Link>

        <button
          onClick={copyToClipboard}
          className={`bg-[#d98f8f] text-white font-bold text-[5vw] md:text-4xl py-[2vh] md:py-8 px-[6vw] md:px-[60px] rounded-full whitespace-nowrap 
          z-30 relative cursor-pointer flex items-center justify-center md:gap-4 gap-[2vw]
          transition-shadow duration-200 ease-in-out hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]
          ${fredoka.className}`}
        >
          Copy Link 
        </button>
      </div>


      )}
      {!id && (
        <Link href="/form">
          <button
            className={`bg-[#d98f8f] text-white font-bold text-[5vw] md:text-4xl py-[2vh] md:py-8 px-[6vw] md:px-[60px] rounded-full whitespace-nowrap 
            z-30 relative cursor-pointer
            transition-shadow duration-200 ease-in-out hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]
            ${fredoka.className}`}
          >
            Back to Form
          </button>
        </Link>
      )}
    </div>
  )
}

export default SuccessPage