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

      // Fade in/out effect
      const fadeInDuration = 1
      const fadeOutDuration = 0.8
      const fadeInProgress = Math.min(progress / fadeInDuration, 1)
      const fadeOutProgress = Math.max((progress - (DURATION / 1000 - fadeOutDuration)) / fadeOutDuration, 0)
      const alpha = Math.min(1, fadeInProgress) * (1 - fadeOutProgress)

      // Draw logo image
      if (logoImageRef.current) {
        const img = logoImageRef.current
        const maxWidth = w * 0.6
        const maxHeight = h * 0.7

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

        ctx.globalAlpha = alpha
        ctx.drawImage(img, x, y, displayWidth, displayHeight)
        ctx.globalAlpha = 1.0

        // Add glitch effect to TV screen area (where the J logo is)
        if (Math.random() > 0.92) {
          const glitchAmount = Math.random() * 6 - 3
          const screenCenterX = x + displayWidth / 2
          const screenCenterY = y + displayHeight * 0.35
          const screenWidth = displayWidth * 0.5
          const screenHeight = displayHeight * 0.35

          // Glitch horizontal slice
          ctx.fillStyle = `rgba(255, 0, 255, ${Math.random() * 0.3 * alpha})`
          ctx.fillRect(
            screenCenterX - screenWidth / 2 + glitchAmount,
            screenCenterY - screenHeight / 2 + Math.random() * screenHeight,
            screenWidth,
            Math.random() * 8 + 2
          )

          // Glitch vertical line
          ctx.strokeStyle = `rgba(0, 255, 255, ${Math.random() * 0.4 * alpha})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(screenCenterX + glitchAmount, screenCenterY - screenHeight / 2)
          ctx.lineTo(screenCenterX + glitchAmount, screenCenterY + screenHeight / 2)
          ctx.stroke()
        }
      }

      // Particle effects floating around the logo
      const particleCount = 30
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 271
        const angle = (seed % 360) * (Math.PI / 180) + progress * 0.5
        const distance = 150 + Math.sin(progress * 2 + seed) * 80
        const px = w / 2 + Math.cos(angle) * distance
        const py = h / 2 + Math.sin(angle) * distance - h * 0.1
        const hue = (seed % 2) === 0 ? 190 : 25 // Cyan or orange
        const particleAlpha = Math.sin(progress * Math.PI + seed * 0.1) * 0.5 + 0.3

        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${particleAlpha * alpha * 0.6})`
        ctx.fillRect(px - 2, py - 2, 4, 4)
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
