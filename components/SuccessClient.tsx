"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { IoCopy } from "react-icons/io5"
import toast, { Toaster } from "react-hot-toast"
import { logEvent } from "firebase/analytics"
import { analytics } from "@/lib/firebase"

interface SuccessClientProps {
  id: string
}

export default function SuccessClient({ id }: SuccessClientProps) {
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
          fontFamily: "var(--font-fredoka)",
        },
        iconTheme: {
          primary: "#d98f8f",
          secondary: "#fff",
        },
      })

      if (analytics) {
        logEvent(analytics, "link_copied", { url: cardUrl })
      }
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error("Failed to copy link")
    }
  }

  // Prevent hydration mismatch by not rendering the link until URL is ready
  if (!cardUrl) return null

  return (
    <>
      <Toaster position="bottom-center" />
      <div className="w-full flex justify-center">
        <div className="flex justify-center items-center w-fit bg-[#d98f8f] rounded-3xl px-6 py-3 my-3">
          <Link
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-lg text-white hover:text-[#ffcaca] hover:underline cursor-pointer font-fredoka"
          >
            <span className="hidden md:inline">{cardUrl}</span>
            <span className="md:hidden">{cardUrl.slice(0, 26)}...</span>
          </Link>
          <button
            onClick={copyToClipboard}
            className="ml-2 p-2 text-white hover:text-[#ffcaca] transition-colors flex-shrink-0"
            aria-label="Copy Link"
          >
            <IoCopy size={20} />
          </button>
        </div>
      </div>
    </>
  )
}
