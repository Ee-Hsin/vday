import Image from "next/image"
import { useState } from "react"
import ImageModal from "./ImageModal"

interface FramedImageProps {
  src: string
  alt: string
  caption: string
  className?: string
}

export default function FramedImage({ src, alt, caption, className = "" }: FramedImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        className={`relative p-4 bg-white shadow-lg rounded-lg cursor-pointer ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute inset-0 bg-pink-200 rounded-lg transform rotate-2"></div>
        <div className="relative">
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={150}
            height={150}
            className="rounded-lg object-cover"
          />
          <p className="text-center text-sm mt-2 text-pink-800">{caption}</p>
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

