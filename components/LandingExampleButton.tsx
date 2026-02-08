"use client"

import { useState } from "react"
import ExampleModal from "@/components/ExampleModal"
import { analytics } from "@/lib/firebase"
import { logEvent } from "firebase/analytics"

export default function LandingExampleButton() {
  const [isExampleOpen, setIsExampleOpen] = useState(false)

  const openExampleModal = () => {
    if (analytics) {
      logEvent(analytics, "example_modal_opened")
    }
    setIsExampleOpen(true)
  }

  return (
    <>
      <button
        onClick={openExampleModal}
        className="bg-[#d98f8f] text-white font-bold text-[5vw] md:text-4xl py-[2svh] md:py-8 px-[5vw] md:px-[60px] rounded-full whitespace-nowrap 
        z-30 relative cursor-pointer
        transition-shadow duration-200 ease-in-out hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]
        font-fredoka"
      >
        See Example
      </button>

      <ExampleModal
        isOpen={isExampleOpen}
        onClose={() => setIsExampleOpen(false)}
      />
    </>
  )
}
