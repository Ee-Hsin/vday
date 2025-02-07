import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMovingButton } from "../hooks/useMovingButton"
import SuccessModal from "../components/SuccessModal"
import HeartBackground from "../components/HeartBackground"
import FramedImage from "../components/FramedImage"
import BrokenHeart from "../components/BrokenHeart"
import NiceHeart from "../components/NiceHeart"
import ClickHeartEffect from "@/components/ClickHeartEffect"
import { Fredoka, Poppins } from "next/font/google"
import { useIsMobile } from "@/hooks/use-mobile" // Add this import
import { YesButton } from "../components/YesButton"


const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

interface ValentineProposalProps {
    imgUrl: string
    imgCaption: string
    imgUrl2: string
    imgCaption2: string
    valentineName: string
    message: string
}

const noMessages = [
  "are you sure?",
  "really sure?",
  "think again!",
  "last chance!",
  "surely not?",
  "you might regret this!",
  "give it another thought!",
  "are you absolutely certain?",
  "this could be a mistake!",
  "have a heart!",
  "don't be so cold!",
  "change of heart?",
  "wouldn't you reconsider?",
  "is that your final answer?",
  "you're breaking my heart ;("
];

export default function ValentineProposal({imgUrl, imgCaption, imgUrl2, imgCaption2, valentineName, message} : ValentineProposalProps) {
    const [showModal, setShowModal] = useState(false)
    const [noClicked, setNoClicked] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null);
    const { buttonPosition, handleMouseMove } = useMovingButton()
    const [messageIndex, setMessageIndex] = useState(0);
    const [extraYesButtons, setExtraYesButtons] = useState<{x: number, y: number}[]>([]);
    const isMobile = useIsMobile(); // Add this hook

    const handleYesClick = () => {
      setShowModal(true);
      setExtraYesButtons([]); // Clear extra buttons
      setMessageIndex(0); // Reset counter
    };

    const handleNoClick = () => {
      setNoClicked(true);
      setMessageIndex((prev) => (prev + 1) % noMessages.length);
    
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        const BUTTON_WIDTH = isMobile ? 50 : 70;
        const BUTTON_HEIGHT = 40; // Approximate button height
        
        // Calculate center point
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate max offset (half of container dimensions)
        const maxOffsetX = rect.width / 2 - BUTTON_WIDTH;
        const maxOffsetY = rect.height / 2 - BUTTON_HEIGHT;
        
        const newButtons = Array(messageIndex + 1).fill(0).map(() => {
          const offsetX = (Math.random() - 0.5) * 2 * maxOffsetX;
          const offsetY = (Math.random() - 0.5) * 2 * maxOffsetY;
          
          return { 
            x: centerX + offsetX - BUTTON_WIDTH/2,  // Offset by half button width
            y: centerY + offsetY - BUTTON_HEIGHT/2  // Offset by half button height
          };
        });
        
        setExtraYesButtons(prev => [...prev, ...newButtons]);
      }
    };
  
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

        <div
          ref={containerRef} 
          className="w-[90vw] md:max-w-[750px] md:h-auto aspect-[1.414/1] max-h-[500px] md:max-h-none bg-[#ffffff] rounded-lg shadow-lg p-8 flex flex-col items-center z-10 justify-between"
        >

          <h1 className={`${fredoka.className} text-4xl font-bold text-[#d98f8f] text-center flex items-center justify-center`}>
            Hi {valentineName}, will you be my Valentine?
          </h1>
          
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
          
          
          <div className="flex items-center space-x-5 relative">
            <Button 
              className={`${fredoka.className} bg-[#d98f8f] hover:bg-[#a55c5c] text-white w-[70px] font-medium rounded-xl text-lg -ml-[95px] shadow-md`}
              onClick={handleYesClick}
            >              
            Yes
            </Button>
            <motion.div
              className="relative z-20"
              style={{
                position: "absolute",
                left: isMobile ? "auto" : `calc(100% + ${buttonPosition.x}px)`,
                top: isMobile ? "auto" : `${buttonPosition.y}px`,
              }}
              animate={isMobile ? undefined : { x: buttonPosition.x, y: buttonPosition.y }}
              transition={isMobile ? undefined : { type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button
                className={`${fredoka.className} bg-gray-300 hover:bg-gray-400 text-gray-700 w-[70px] font-medium rounded-xl text-lg relative shadow-md overflow-visible`}
                onClick={handleNoClick}
              >
                <AnimatePresence mode="wait">
                  {noClicked ? (
                    <motion.div
                      key="broken-heart"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BrokenHeart size={24} color="rgba(192, 58, 75, 0.7)" />
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
                    className={`
                      ${poppins.className} 
                      absolute top-full left-1 
                      transform -translate-x-1/2 mt-2 
                      bg-[#efcdd0] text-pink-800 
                      px-4 py-2 rounded-xl text-md
                      md:whitespace-nowrap
                      max-w-[200px] md:max-w-none
                      text-center
                    `}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {noMessages[messageIndex]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {extraYesButtons.map((pos, index) => (
          <YesButton
            key={index}
            onClick={handleYesClick}
            position={pos}
            zIndex={index}
            onClear={() => setExtraYesButtons([])}
          />
        ))}

        <SuccessModal isOpen={showModal} onClose={() => setShowModal(false)} message={message} />
      </div>
    )
  }
  