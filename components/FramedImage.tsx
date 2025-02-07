import Image from "next/image"
import { useState } from "react"
import ImageModal from "./ImageModal"
import { Fredoka, Poppins } from "next/font/google"

interface FramedImageProps {
  src: string
  alt: string
  caption: string
  className?: string
}

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

export default function FramedImage({ src, alt, caption, className = "" }: FramedImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        className={`relative p-4 bg-[#f7eaee] hover:bg-[#efcdd0] transition-colors duration-200 shadow-[0_0px_30px_0px_rgba(244,114,182,0.2),0_0px_20px_-5px_rgba(0,0,0,0.4)] rounded-lg cursor-pointer w-[200px] ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative flex flex-col">
          {/* Fixed square image container */}
          <div className="relative aspect-square w-full transform">
            <Image
              src={src || "/placeholder.svg"}
              alt={alt}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          {/* Caption with automatic height */}
          <p className={`text-center text-sm mt-2 text-pink-800 break-word ${poppins.className}`}>{caption}</p>
        </div>
      </div>
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        src={src || "/placeholder.svg"}
        alt={alt}
        caption={caption}
      />
    </>
  )
}
