"use client"

import { useEffect, useRef, useState } from "react"

interface TronLogoProps {
  onComplete: () => void
  audioRef?: React.RefObject<HTMLAudioElement>
}

export default function TronLogo({ onComplete, audioRef }: TronLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoImageRef = useRef<HTMLImageElement | null>(null)
  const animRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const [visible, setVisible] = useState(false)

  const DURATION = 6000 // 6 seconds for logo display
  const TV_DISPLAY_TIME = 3000 // TV stays fully visible for 3 seconds

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", {
      alpha: false,
      preserveDrawingBuffer: false,
      antialias: false,
    })
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    const resize = () => {
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })

    // Load TV logo image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      logoImageRef.current = img
    }
    img.src = "/tv-logo.png"

    const animate = (now: number) => {
      if (startTimeRef.current === 0) startTimeRef.current = now

      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      const w = window.innerWidth
      const h = window.innerHeight

      // Dark background with scanlines
      ctx.fillStyle = "#000608"
      ctx.fillRect(0, 0, w, h)

      // Scanlines effect
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"
      ctx.lineWidth = 0.5
      for (let y = 0; y < h; y += 2) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Fade in/out effect - TV stays fully visible for 3 seconds
      const fadeInDuration = 0.4
      const stayDuration = TV_DISPLAY_TIME / 1000
      const fadeOutDuration = (DURATION - TV_DISPLAY_TIME) / 1000
      const fadeInProgress = Math.min(progress / fadeInDuration, 1)
      const fadeOutStartTime = fadeInDuration + stayDuration
      const fadeOutProgress = Math.max((progress - fadeOutStartTime) / fadeOutDuration, 0)
      const alpha = Math.min(1, fadeInProgress) * (1 - fadeOutProgress)

      // Draw logo image - clean and simple
      if (logoImageRef.current) {
        const img = logoImageRef.current
        const maxWidth = w * 0.35  // Much smaller - 35% instead of 60%
        const maxHeight = h * 0.45  // Much smaller - 45% instead of 70%

        let displayWidth = img.width
        let displayHeight = img.height
        const ratio = img.width / img.height

        if (displayWidth > maxWidth) {
          displayWidth = maxWidth
          displayHeight = displayWidth / ratio
        }
        if (displayHeight > maxHeight) {
          displayHeight = maxHeight
          displayWidth = displayHeight * ratio
        }

        const x = (w - displayWidth) / 2
        const y = (h - displayHeight) / 2 - h * 0.05

        // Render the TV image
        ctx.globalAlpha = alpha
        ctx.drawImage(img, x, y, displayWidth, displayHeight)
        ctx.globalAlpha = 1.0

        // Add glitch effect only during fade-out phase
        if (progress > fadeOutStartTime && Math.random() > 0.88) {
          const glitchAmount = Math.random() * 8 - 4
          const screenCenterX = x + displayWidth / 2
          const screenCenterY = y + displayHeight * 0.35
          const screenWidth = displayWidth * 0.5
          const screenHeight = displayHeight * 0.35

          ctx.fillStyle = `rgba(255, 0, 128, ${Math.random() * 0.4 * fadeOutProgress})`
          ctx.fillRect(
            screenCenterX - screenWidth / 2 + glitchAmount,
            screenCenterY - screenHeight / 2 + Math.random() * screenHeight,
            screenWidth,
            Math.random() * 10 + 2
          )

          ctx.strokeStyle = `rgba(0, 255, 255, ${Math.random() * 0.5 * fadeOutProgress})`
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(screenCenterX + glitchAmount, screenCenterY - screenHeight / 2)
          ctx.lineTo(screenCenterX + glitchAmount, screenCenterY + screenHeight / 2)
          ctx.stroke()
        }
      }

      // Continue animation or complete
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease-out",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
