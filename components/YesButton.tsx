import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Fredoka } from "next/font/google"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

interface YesButtonProps {
  onClick: () => void
  zIndex: number
  position: { x: number; y: number }
  onClear: () => void
}

export const YesButton = ({ onClick, zIndex, position, onClear }: YesButtonProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    style={{ 
      position: 'absolute',
      left: position.x,
      top: position.y,
      zIndex: 40 + zIndex
    }}
  >
    <Button 
      className={`${fredoka.className} bg-[#d98f8f] hover:bg-[#a55c5c] text-white w-[70px] font-medium rounded-xl text-lg shadow-md`}
      onClick={() => {
        onClick();
        onClear();
      }}
    >
      Yes
    </Button>
  </motion.div>
)