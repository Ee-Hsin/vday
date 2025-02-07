import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import Image from "next/image"
import { Fredoka, Poppins } from "next/font/google"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
  caption: string
}

export default function ImageModal({ isOpen, onClose, src, alt, caption }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#f7eaee] border-2 max-w-[90vw] md:max-w-[70vh] max-h-[70vh] md:max-h-[90vh] p-6 pt-12 flex flex-col gap-4 items-center rounded-xl">
        <div className="relative aspect-square w-full flex-shrink-0">
          <Image 
            src={src || "/placeholder.svg"} 
            alt={alt} 
            layout="fill" 
            objectFit="cover" 
            className="rounded-lg" 
          />
        </div>
        <div className="overflow-y-auto w-full max-h-[20vh] md:max-h-[30vh]">
          <p className={`${poppins.className} text-center text-pink-800`}>
            {caption}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}