"use client"

import { useEffect, useRef, useState } from "react"
import { useMobileLayout } from "@/hooks/useMobileLayout"

interface TronHomeProps {
  onNavigate: (page: "play" | "modes" | "about") => void
}

interface AmbientParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  alpha: number
  flickerSpeed: number
  phase: number
}

export default function TronHome({ onNavigate }: TronHomeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [activeItem, setActiveItem] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const { isMobile } = useMobileLayout()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const particles: AmbientParticle[] = []
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.08 - Math.random() * 0.35,
        size: 0.8 + Math.random() * 1.8,
        hue: Math.random() > 0.92 ? 28 : 190,
        alpha: 0.15 + Math.random() * 0.45,
        flickerSpeed: 2 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
      })
    }

    const animate = () => {
      const w = window.innerWidth
      const h = window.innerHeight

      ctx.fillStyle = "rgba(0, 5, 8, 0.12)"
      ctx.fillRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = "hsla(190, 90%, 50%, 0.025)"
      ctx.lineWidth = 0.4
      const gridSize = 40
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      const now = performance.now()
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        const flicker = 0.5 + Math.sin(now * 0.001 * p.flickerSpeed + p.phase) * 0.5
        ctx.fillStyle = `hsla(${p.hue}, 100%, 68%, ${p.alpha * flicker})`
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.7)
      }

      // Scan line
      const scanY = (now * 0.025) % h
      ctx.fillStyle = "hsla(190, 100%, 55%, 0.012)"
      ctx.fillRect(0, scanY, w, 1.5)

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  const menuItems = [
    { label: "PLAY", sub: "Enter the Light Cycle Grid", key: "play" as const },
    { label: "GAME MODES", sub: "Light Cycle // Disc Wars", key: "modes" as const },
    { label: "ABOUT", sub: "The Program", key: "about" as const },
  ]

  return (
    <div className="fixed inset-0 z-40" style={{ background: "#000608" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />

      <div
        className={`relative z-10 flex flex-col items-center justify-center h-full ${isMobile ? 'px-4' : 'px-6'}`}
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.9s ease-out",
          paddingBottom: isMobile ? '2rem' : '0',
        }}
      >
        {/* Title */}
        <div className={`text-center select-none ${isMobile ? 'mb-8' : 'mb-14'}`}>
          <h1
            className="font-mono font-black tracking-widest leading-none"
            style={{
              fontSize: "clamp(3rem, 10vw, 7rem)",
              color: "#00e8ff",
              textShadow: "0 0 25px rgba(0, 232, 255, 0.35), 0 0 50px rgba(0, 232, 255, 0.12)",
              letterSpacing: "0.15em",
            }}
          >
            TRON
          </h1>
          <div
            className="mx-auto my-3"
            style={{
              width: "clamp(100px, 28vw, 260px)",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(0, 232, 255, 0.5), transparent)",
            }}
          />
          <p
            className="font-mono font-light tracking-[0.5em]"
            style={{
              fontSize: "clamp(0.75rem, 2.2vw, 1.4rem)",
              color: "rgba(0, 232, 255, 0.6)",
            }}
          >
            R E T R O
          </p>
        </div>

        {/* Menu */}
        <nav className={`flex flex-col items-center ${isMobile ? 'gap-2 w-full px-2' : 'gap-1.5 max-w-md'}`}>
          {menuItems.map((item, i) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              onMouseEnter={() => !isMobile && setActiveItem(i)}
              onMouseLeave={() => !isMobile && setActiveItem(null)}
              className={`group relative w-full text-left transition-all duration-300 cursor-pointer active:scale-95 ${
                isMobile ? 'py-4 px-6 rounded border' : 'py-4 px-8'
              }`}
              style={{
                background: activeItem === i
                  ? "rgba(0, 232, 255, 0.05)"
                  : "transparent",
                borderLeft: activeItem === i
                  ? "3px solid rgba(0, 232, 255, 0.75)"
                  : isMobile ? "3px solid rgba(0, 232, 255, 0.15)" : "2px solid rgba(0, 232, 255, 0.08)",
                borderTop: isMobile ? "1px solid rgba(0, 232, 255, 0.1)" : "none",
                borderRight: isMobile ? "1px solid rgba(0, 232, 255, 0.1)" : "none",
                borderBottom: isMobile ? "1px solid rgba(0, 232, 255, 0.1)" : "none",
                transform: activeItem === i ? "translateX(8px)" : "translateX(0)",
                minHeight: isMobile ? '52px' : 'auto',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: activeItem === i
                    ? "linear-gradient(90deg, rgba(0, 232, 255, 0.06), transparent)"
                    : "transparent",
                  transition: "background 0.3s",
                }}
              />

              <span
                className="relative block font-mono font-bold tracking-[0.2em] transition-colors duration-300"
                style={{
                  fontSize: "clamp(0.95rem, 2.2vw, 1.25rem)",
                  color: activeItem === i ? "#00e8ff" : "rgba(0, 232, 255, 0.4)",
                  textShadow: activeItem === i
                    ? "0 0 12px rgba(0, 232, 255, 0.4)"
                    : "none",
                }}
              >
                {item.label}
              </span>
              <span
                className="relative block font-mono mt-1 transition-colors duration-300"
                style={{
                  fontSize: "clamp(0.55rem, 1.3vw, 0.72rem)",
                  color: activeItem === i
                    ? "rgba(0, 232, 255, 0.4)"
                    : "rgba(0, 232, 255, 0.15)",
                  letterSpacing: "0.1em",
                }}
              >
                {item.sub}
              </span>

              {activeItem === i && (
                <div
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5"
                  style={{
                    background: "#00e8ff",
                    boxShadow: "0 0 6px rgba(0, 232, 255, 0.7)",
                  }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="absolute bottom-6 font-mono text-center"
          style={{
            fontSize: "clamp(0.5rem, 1.1vw, 0.65rem)",
            color: "rgba(0, 232, 255, 0.15)",
            letterSpacing: "0.15em",
          }}
        >
          TRONRETRO.ONLINE // ENTER THE GRID
        </div>
      </div>

      {/* Scanlines overlay */}
      <div
        className="fixed inset-0 z-20 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 3px)",
        }}
      />
    </div>
  )
}
