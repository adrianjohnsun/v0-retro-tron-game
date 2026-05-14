"use client"

import { useEffect, useRef, useState } from "react"

interface TronModesProps {
  onBack: () => void
  onSelectMode: (mode: string) => void
}

const MODES = [
  {
    id: "light-cycle",
    name: "LIGHT CYCLE",
    description: "Navigate the Grid on your light cycle. Outmaneuver CLU's programs and survive the digital arena. The last User standing wins.",
    detail: "Classic Tron // Arrow Keys or Swipe",
    color: "#00e8ff",
    icon: "//",
  },
  {
    id: "disc-wars",
    name: "DISC WARS",
    description: "Enter the Disc Wars arena. Throw your identity disc to derez your opponent. Timing and precision are everything.",
    detail: "Combat Arena // Click to Throw",
    color: "#ff6a00",
    icon: "( )",
  },
]

export default function TronModes({ onBack, onSelectMode }: TronModesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [visible, setVisible] = useState(false)
  const [hoveredMode, setHoveredMode] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
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

    const animate = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.fillStyle = "rgba(0, 5, 8, 0.15)"
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = "hsla(190, 90%, 50%, 0.02)"
      ctx.lineWidth = 0.4
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      const now = performance.now()
      for (let i = 0; i < 40; i++) {
        const seed = i * 4271
        const px = ((seed % 1000) / 1000 * w + now * 0.01 * ((seed % 7) / 7 - 0.3)) % w
        const py = ((seed % 777) / 777 * h - now * 0.006 * ((seed % 5) / 5 + 0.2)) % h
        const posY = py < 0 ? py + h : py
        const a = 0.1 + Math.sin(now * 0.002 + seed) * 0.07
        const hue = (seed % 10) < 1 ? 28 : 190
        ctx.fillStyle = `hsla(${hue}, 100%, 68%, ${a})`
        ctx.fillRect(px, posY, 1.2, 1)
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-40" style={{ background: "#000608" }}>
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: "100%", height: "100%" }} />

      <div
        className="relative z-10 flex flex-col h-full overflow-y-auto"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease-out" }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="fixed top-6 left-6 z-20 font-mono text-sm tracking-widest py-2 px-4 cursor-pointer transition-all duration-300"
          style={{
            color: "rgba(0, 232, 255, 0.4)",
            borderLeft: "2px solid rgba(0, 232, 255, 0.2)",
            background: "rgba(0, 5, 8, 0.85)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#00e8ff"
            e.currentTarget.style.borderLeftColor = "#00e8ff"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(0, 232, 255, 0.4)"
            e.currentTarget.style.borderLeftColor = "rgba(0, 232, 255, 0.2)"
          }}
        >
          {'<'} BACK
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <h2
            className="font-black italic tracking-tighter mb-2"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              color: "#00e8ff",
              textShadow: "0 0 20px rgba(0, 232, 255, 0.6), 0 0 40px rgba(0, 232, 255, 0.3)",
              fontFamily: "Arial Black, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            TRON RETRO
          </h2>

          <h3
            className="font-mono text-xs tracking-[0.3em] mb-8"
            style={{
              color: "rgba(0, 232, 255, 0.5)",
              letterSpacing: "0.3em",
            }}
          >
            GAME MODES
          </h3>

          <div
            className="w-28 h-px mb-6"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0, 232, 255, 0.4), transparent)" }}
          />

          <div className="flex flex-col gap-4 w-full max-w-lg">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
                className="relative w-full text-left py-6 px-7 transition-all duration-300 cursor-pointer"
                style={{
                  background: hoveredMode === mode.id
                    ? `${mode.color}08`
                    : "rgba(0, 5, 8, 0.35)",
                  borderLeft: hoveredMode === mode.id
                    ? `2px solid ${mode.color}`
                    : `2px solid ${mode.color}18`,
                  transform: hoveredMode === mode.id ? "translateX(6px)" : "translateX(0)",
                }}
              >
                {hoveredMode === mode.id && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, ${mode.color}0a, transparent)`,
                    }}
                  />
                )}

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-xs opacity-40"
                      style={{ color: mode.color }}
                    >
                      {mode.icon}
                    </span>
                    <span
                      className="block font-mono font-bold tracking-[0.2em]"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
                        color: hoveredMode === mode.id ? mode.color : `${mode.color}66`,
                        textShadow: hoveredMode === mode.id ? `0 0 10px ${mode.color}55` : "none",
                        transition: "color 0.3s, text-shadow 0.3s",
                      }}
                    >
                      {mode.name}
                    </span>
                  </div>
                  <span
                    className="block font-mono mt-2.5 leading-relaxed"
                    style={{
                      fontSize: "clamp(0.62rem, 1.3vw, 0.76rem)",
                      color: hoveredMode === mode.id
                        ? "rgba(0, 232, 255, 0.38)"
                        : "rgba(0, 232, 255, 0.16)",
                      transition: "color 0.3s",
                    }}
                  >
                    {mode.description}
                  </span>
                  <span
                    className="block font-mono mt-1.5"
                    style={{
                      fontSize: "clamp(0.5rem, 1vw, 0.62rem)",
                      color: hoveredMode === mode.id
                        ? `${mode.color}44`
                        : `${mode.color}14`,
                      letterSpacing: "0.15em",
                      transition: "color 0.3s",
                    }}
                  >
                    {mode.detail}
                  </span>
                </div>

                {hoveredMode === mode.id && (
                  <div
                    className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-xs tracking-widest"
                    style={{ color: `${mode.color}55` }}
                  >
                    ENTER {'>'}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="fixed inset-0 z-20 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 3px)",
        }}
      />
    </div>
  )
}
