import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import Image from "next/image"
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
      <DialogContent className="bg-[#f7eaee] border-2 max-w-[90vw] md:max-w-[70svh] max-h-[70svh] md:max-h-[90svh] p-6 pt-12 flex flex-col gap-4 items-center rounded-xl">
        <div className="relative aspect-square w-full flex-shrink-0">
          <Image 
            src={src || "/placeholder.svg"} 
            alt={alt} 
            layout="fill" 
            objectFit="cover" 
            className="rounded-lg" 
          />
        </div>
        <div className="overflow-y-auto w-full max-h-[20svh] md:max-h-[30svh]">
          <p className={`font-poppins text-center text-pink-800`}>
            {caption}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}