"use client"

import { useEffect, useState } from "react"

interface Heart {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  rotation: number
}

const SvgHeart = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

export default function HeartBackground() {
  const [hearts, setHearts] = useState<Heart[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prevHearts) => {
        const newHeart: Heart = {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100, // Start from random vertical positions
          size: Math.random() * 20 + 10,
          opacity: 1,
          rotation: Math.random() * 360,
        }
        return [...prevHearts, newHeart]
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setHearts((prevHearts) =>
        prevHearts
          .map((heart) => ({
            ...heart,
            y: (heart.y - 0.2 + 100) % 100, // Move upwards and wrap around
            opacity: heart.opacity - 0.005, // Slower fade out
            rotation: heart.rotation + 0.5,
          }))
          .filter((heart) => heart.opacity > 0),
      )
    }, 50)

    return () => clearInterval(animationInterval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            opacity: heart.opacity,
            transform: `rotate(${heart.rotation}deg)`,
          }}
        >
          <SvgHeart size={heart.size} color="rgba(217, 143, 143, 0.7)" />
        </div>
      ))}
    </div>
  )
}

