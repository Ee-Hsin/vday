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
      <DialogContent className="bg-[#f7eaee] border-2 max-w-[90vw] md:max-w-[80vh] md:max-h-[90vh] p-6 pt-12 flex flex-col items-center justify-center rounded-xl">
        <div className="relative aspect-square w-full">
          <Image src={src || "/placeholder.svg"} alt={alt} layout="fill" objectFit="cover" className="rounded-lg" />
        </div>
        <p className={`text-center text-pink-800 mt-4 ${poppins.className}`}>{caption}</p>
      </DialogContent>
    </Dialog>
  )
}