"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react" // Import Suspense
import Image from "next/image"
import { Fredoka, Poppins } from "next/font/google"
import HeartBackground from "@/components/HeartBackground"
import ClickHeartEffect from "@/components/ClickHeartEffect"
import pcBg from "@/assets/mofu yay pc.png"
import mobileBg from "@/assets/mofu yay mobile longer.png"
import { MdHome } from "react-icons/md"
import { useEffect, useState } from "react"
import { IoCopy } from "react-icons/io5"
import toast, { Toaster } from "react-hot-toast"
import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase"; 

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
    <div className="h-svh relative bg-[#ffeded] overflow-hidden">
      <Toaster position="bottom-center" />
      <HeartBackground />
      <ClickHeartEffect />
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 text-[#d98f8f] hover:text-[#b35151] transition-colors"
      >
        <MdHome className="w-[4svh] h-[4svh] md:w-[40px] md:h-[40px]" />
      </Link>

      {/* Content */}

      <Suspense fallback={<p className={poppins.className}>Loading...</p>}>
        <SearchParamsContent />
      </Suspense>

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
  const [cardUrl, setCardUrl] = useState("")

  useEffect(() => {
    if (id) {
      setCardUrl(`${window.location.origin}/card/${id}`)
    }
  }, [id])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl)
      toast.success("Link copied to clipboard!", {
        style: {
          background: "#F5E6E6",
          color: "#d98f8f",
          fontFamily: fredoka.style.fontFamily,
        },
        iconTheme: {
          primary: "#d98f8f",
          secondary: "#fff",
        },
      })

      if (analytics) {
        logEvent(analytics, "link_copied", { url: cardUrl });
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="relative z-10 mt-[5svh] md:mt-[80px] md:ml-[5vw] text-center md:text-center md:w-[46vw]">
      <h1
        className={`text-[14vw] leading-[1] md:text-8xl py-1 font-bold text-[#d98f8f] mb-[4svh] md:mb-[4svh] ${fredoka.className}`}
      >
        {id ? (
          <>
            Your <br className="block md:hidden" />
            Website
            <br />
            is Live!
          </>
        ) : (
          <>
            Something
            <br />
            Went Wrong
          </>
        )}
      </h1>
      <p
        className={`text-[5vw] md:text-4xl max-w-5xl leading-relaxed text-[#aa9a7d] px-[5vw] mb-[4svh] md:mb-[4svh] ${poppins.className}`}
      >
        {id
          ? "Share this link with your potential valentine. We hope they say yes!"
          : "Please try submitting the form again. Make sure there is an 'id value' in this page's url."}
      </p>

      {/* URL input container - hidden on mobile */}
      {id && (
        <div className="w-full flex justify-center">
          <div className="flex justify-center items-center w-fit bg-[#d98f8f] rounded-3xl px-6 py-3 my-3">
            <Link
              href={cardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-lg text-white hover:text-[#ffcaca] hover:underline cursor-pointer"
            >
              <span className="hidden md:inline">{cardUrl}</span>
              <span className="md:hidden">{cardUrl.slice(0, 26)}...</span>
            </Link>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-2 text-white hover:text-[#ffcaca] transition-colors flex-shrink-0"
            >
              <IoCopy size={20} />
            </button>
          </div>
        </div>
      )}

      {/* {id && (
        <div className="flex gap-[4vw] justify-center md:hidden">
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
      )} */}

      {!id && (
        <Link href="/form">
          <button
            className={`bg-[#d98f8f] text-white font-bold text-[5vw] md:text-4xl py-[2svh] md:py-8 px-[6vw] md:px-[60px] rounded-full whitespace-nowrap 
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
