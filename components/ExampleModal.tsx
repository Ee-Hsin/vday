"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Maximize2, Minimize2, RotateCw, Search } from "lucide-react"
import ValentineProposal from "@/components/CardExample"
import { useState } from "react"

interface ExampleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExampleModal({ isOpen, onClose }: ExampleModalProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [key, setKey] = useState(0) // For forcing re-render
  const mockUrl = "https://www.valentineproposal.com/example"

  const handleReload = () => {
    setKey(prev => prev + 1)
  }

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
            } z-[999] rounded-lg shadow-xl flex flex-col overflow-hidden`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Title Bar */}
            <div className={`font-fredoka h-10 bg-[#d98f8f] flex items-center justify-between px-4 flex-shrink-0 gap-4`}>
              <button 
                onClick={handleReload}
                className="text-white hover:text-pink-200"
              >
                <RotateCw size={18} />
              </button>

              <div className="flex-1 flex items-center max-w-2xl mx-4 bg-[#c27e7e] rounded-md px-3 h-7 cursor-pointer group"
                   onClick={() => window.open(mockUrl, '_blank')}>
                <Search size={14} className="text-white/70 mr-2" />
                <input 
                  readOnly
                  value={mockUrl}
                  className="bg-transparent text-sm text-white w-full outline-none cursor-pointer group-hover:text-pink-200"
                />
              </div>

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
              <div key={key} className={`w-full h-full flex items-center justify-center transform ${
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