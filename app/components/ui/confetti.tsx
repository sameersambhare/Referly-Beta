"use client"

import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"

interface ConfettiProps {
  duration?: number
}

export function Confetti({ duration = 3000 }: ConfettiProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    // Set dimensions on mount
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Add resize listener
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)

    // Set timeout to remove confetti
    const timeout = setTimeout(() => {
      setIsActive(false)
    }, duration)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeout)
    }
  }, [duration])

  if (!isActive) return null

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.15}
      colors={[
        "#f44336", // red
        "#e91e63", // pink
        "#9c27b0", // purple
        "#673ab7", // deep purple
        "#3f51b5", // indigo
        "#2196f3", // blue
        "#03a9f4", // light blue
        "#00bcd4", // cyan
        "#009688", // teal
        "#4caf50", // green
        "#8bc34a", // light green
        "#cddc39", // lime
        "#ffeb3b", // yellow
        "#ffc107", // amber
        "#ff9800", // orange
        "#ff5722", // deep orange
      ]}
    />
  )
} 