import { useState, useCallback, useEffect,  } from "react"

export function useMovingButton() {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      setContainerSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const buttonElement = e.currentTarget.querySelector("button:last-child") as HTMLButtonElement
      if (!buttonElement) return

      const buttonRect = buttonElement.getBoundingClientRect()
      const mouseX = e.clientX
      const mouseY = e.clientY

      const distanceX = mouseX - (buttonRect.left + buttonRect.width / 2)
      const distanceY = mouseY - (buttonRect.top + buttonRect.height / 2)

      if (Math.abs(distanceX) < 50 && Math.abs(distanceY) < 50) {
        setButtonPosition((prev) => {
          let newX = prev.x - distanceX / 22 // Slower movement
          let newY = prev.y - distanceY / 22 // Slower movement

          return { x: newX, y: newY }
        })
      }
    },
    [containerSize],
  )

  return { buttonPosition, handleMouseMove }
}

