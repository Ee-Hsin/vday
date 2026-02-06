import Image from "next/image"
import { useState } from "react"
import ImageModal from "./ImageModal"
import stamp1 from "@/assets/stamp 1.png"

interface FramedImageProps {
  src: string
  alt: string
  caption: string
  className?: string
}

export default function FramedImage({
  src,
  alt,
  caption,
  className = "",
}: FramedImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        className={`relative p-4 bg-[#f7eaee] hover:bg-[#efcdd0] transition-colors duration-200 shadow-[0_0px_30px_0px_rgba(244,114,182,0.2),0_0px_20px_-5px_rgba(0,0,0,0.4)] rounded-lg ${src != "fallbackStamp" && "cursor-pointer"} w-[200px] ${className}`}
        onClick={() => {
          if (src != "fallbackStamp") {
            setIsModalOpen(true)
          }
        }}
      >
        <div className="relative flex flex-col">
          {/* Fixed square image container */}
          <div className="relative aspect-square w-full transform">
            {src == "fallbackStamp" ? (
              <Image
                src={stamp1}
                alt={alt}
                fill
                className="rounded-lg object-cover"
              />
            ) : (
              <Image
                src={src || "/placeholder.svg"}
                alt={alt}
                fill
                className="rounded-lg object-cover"
              />
            )}
          </div>
          {/* Caption with automatic height */}
          <p
            className={`
            text-center text-sm mt-2 text-pink-800
            font-poppins
            line-clamp-3
          `}
          >
            {caption}
          </p>
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
