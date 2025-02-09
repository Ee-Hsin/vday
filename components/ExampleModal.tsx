"use client"

import { Fredoka } from "next/font/google"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Maximize2, Minimize2 } from "lucide-react"
import ValentineProposal from "@/components/CardExample"
import { useState } from "react"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

interface ExampleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExampleModal({ isOpen, onClose }: ExampleModalProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black/40 z-[998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className={`fixed ${
              isMaximized 
                ? 'inset-0' 
                : 'inset-[2vh] md:inset-[5vh]'
            } z-[999] bg-[#ffeded] rounded-lg shadow-xl flex flex-col overflow-hidden`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Title Bar */}
            <div className={`${fredoka.className} h-10 bg-[#d98f8f] flex items-center justify-between px-4 flex-shrink-0`}>
              <span className="text-white">Example Card</span>
              <div className="flex gap-4">
                <button onClick={onClose} className="text-white hover:text-pink-200">
                  <Minus size={18} />
                </button>
                <button onClick={() => setIsMaximized(!isMaximized)} className="text-white hover:text-pink-200">
                  {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={onClose} className="text-white hover:text-pink-200">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-hidden bg-[#ffeded] p-4 md:p-8">
              <div className={`w-full h-full flex items-center justify-center transform ${
                isMaximized 
                  ? 'scale-100' 
                  : 'scale-[0.8] md:scale-[0.9]'
              } transition-transform`}>
                <ValentineProposal
                  imgUrl="/chaewon_first_date.jpeg"
                  imgCaption="Our first date"
                  imgUrl2="/meal.jpg"
                  imgCaption2="Your favorite meal"
                  valentineName="Chaewon"
                  senderName="Jordan"
                  message="I've made reservations at Nobu for Friday. I'll see you at 7:30 then, it's gonna be great!"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}