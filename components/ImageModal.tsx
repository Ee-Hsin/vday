import { Dialog, DialogContent } from "@/components/ui/dialog"
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
      <DialogContent className="bg-pink-100 border-2 border-pink-500 max-w-3xl">
        <div className="relative aspect-square w-full">
          <Image src={src || "/placeholder.svg"} alt={alt} layout="fill" objectFit="cover" className="rounded-lg" />
        </div>
        <p className="text-center text-pink-800 mt-4">{caption}</p>
      </DialogContent>
    </Dialog>
  )
}

