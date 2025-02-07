import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Fredoka, Poppins } from "next/font/google"
import yay from "../assets/mofu yes.png"
import Image from "next/image" 

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-[80vh] max-h-[70vh] bg-[#f7eaee] border-2 rounded-xl z-[9999] flex flex-col gap-4 p-6">
        <DialogHeader>
          <DialogTitle className={`${fredoka.className} text-4xl font-bold text-[#cd7b7b] text-center`}>
            Yay!!
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full flex-shrink-0">
          <Image 
            src={yay} 
            alt="Yay celebration" 
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          <p className={`${poppins.className} text-center text-pink-800`}>
            {message}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}