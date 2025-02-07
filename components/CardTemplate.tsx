import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMovingButton } from "../hooks/useMovingButton"
import SuccessModal from "../components/SuccessModal"
import HeartBackground from "../components/HeartBackground"
import FramedImage from "../components/FramedImage"
import BrokenHeart from "../components/BrokenHeart"
import NiceHeart from "../components/NiceHeart"
import ClickHeartEffect from "@/components/ClickHeartEffect"

interface ValentineProposalProps {
    imgUrl: string
    imgCaption: string
    imgUrl2: string
    imgCaption2: string
    valentineName: string
    message: string
}

export default function ValentineProposal({imgUrl, imgCaption, imgUrl2, imgCaption2, valentineName, message} : ValentineProposalProps) {
    const [showModal, setShowModal] = useState(false)
    const [noClicked, setNoClicked] = useState(false)
    const { buttonPosition, handleMouseMove } = useMovingButton()
  
    useEffect(() => {
      if (noClicked) {
        const timer = setTimeout(() => {
          setNoClicked(false)
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [noClicked])
  
    return (
      <div
        className="min-h-screen bg-pink-100 flex flex-col items-center justify-center p-4 overflow-hidden relative"
        onMouseMove={handleMouseMove}
      >
        <ClickHeartEffect />
        <HeartBackground />
        <div className="relative w-full h-[600px] flex items-center justify-center">
          <FramedImage
            src={imgUrl}
            alt="Memory 1"
            caption={imgCaption}
            className="absolute transform -rotate-6 z-10"
          />
          <FramedImage
            src={imgUrl2}
            alt="Memory 2"
            caption={imgCaption2}
            className="absolute transform rotate-6"
          />
        </div>
        <h1 className="text-4xl font-bold text-pink-600 mb-8 text-center flex items-center justify-center">
          <NiceHeart className="mr-2 text-pink-600" size={40} /> Hi {valentineName}, will you be my Valentine?{" "}
          <NiceHeart className="ml-2 text-pink-600" size={40} />
        </h1>
        <div className="flex items-center space-x-4 relative">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setShowModal(true)}>
            Yes
          </Button>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setShowModal(true)}>
            Also Yes
          </Button>
          <motion.div
            className="relative"
            style={{
              position: "absolute",
              left: `calc(100% + ${buttonPosition.x}px)`,
              top: `${buttonPosition.y}px`,
            }}
            animate={{ x: buttonPosition.x, y: buttonPosition.y }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button className="bg-gray-300 text-gray-700 relative overflow-visible" onClick={() => setNoClicked(true)}>
              <AnimatePresence mode="wait">
                {noClicked ? (
                  <motion.div
                    key="broken-heart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BrokenHeart size={24} color="rgba(255, 105, 180, 0.7)" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="no-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    No
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <AnimatePresence>
              {noClicked && (
                <motion.span
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap bg-pink-100 px-2 py-1 rounded text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  erm, can you click yes instead?
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <SuccessModal isOpen={showModal} onClose={() => setShowModal(false)} message={message}/>
      </div>
    )
  }
  