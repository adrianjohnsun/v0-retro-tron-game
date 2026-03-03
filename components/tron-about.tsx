"use client"

import { useEffect, useRef, useState } from "react"
import { useMobileLayout } from "@/hooks/useMobileLayout"

interface TronAboutProps {
  onBack: () => void
}

export default function TronAbout({ onBack }: TronAboutProps) {
  const { isMobile } = useMobileLayout()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [visible, setVisible] = useState(false)

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

      ctx.strokeStyle = "hsla(190, 90%, 50%, 0.018)"
      ctx.lineWidth = 0.4
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      const now = performance.now()
      for (let i = 0; i < 25; i++) {
        const seed = i * 3571
        const px = ((seed % 1000) / 1000 * w + now * 0.008 * ((seed % 7) / 7 - 0.3)) % w
        const py = ((seed % 777) / 777 * h - now * 0.006 * ((seed % 5) / 5 + 0.2)) % h
        const posY = py < 0 ? py + h : py
        const a = 0.12 + Math.sin(now * 0.002 + seed) * 0.08
        ctx.fillStyle = `hsla(190, 100%, 68%, ${a})`
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
          className={`fixed top-4 left-4 z-20 font-mono tracking-widest cursor-pointer transition-all duration-300 rounded ${
            isMobile ? 'py-3 px-4 text-xs min-h-11' : 'text-sm py-2 px-4'
          }`}
          style={{
            color: "rgba(0, 232, 255, 0.4)",
            borderLeft: "3px solid rgba(0, 232, 255, 0.2)",
            background: "rgba(0, 5, 8, 0.85)",
            border: isMobile ? "1px solid rgba(0, 232, 255, 0.15)" : "none",
            borderLeftWidth: isMobile ? "3px" : "2px",
          }}
          onMouseEnter={e => !isMobile && (e.currentTarget.style.color = "#00e8ff", e.currentTarget.style.borderLeftColor = "#00e8ff")}
          onMouseLeave={e => !isMobile && (e.currentTarget.style.color = "rgba(0, 232, 255, 0.4)", e.currentTarget.style.borderLeftColor = "rgba(0, 232, 255, 0.2)")}
        >
          {'<'} BACK
        </button>

        <div className={`flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto ${isMobile ? 'px-4 py-12 pb-24' : 'px-6 py-20'}`}>
          <h2
            className="font-mono font-black tracking-[0.3em] mb-3"
            style={{
              fontSize: "clamp(1.3rem, 3.5vw, 2.2rem)",
              color: "#00e8ff",
              textShadow: "0 0 18px rgba(0, 232, 255, 0.25)",
            }}
          >
            ABOUT
          </h2>

          <div
            className="w-28 h-px mb-10"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0, 232, 255, 0.4), transparent)" }}
          />

          <div className="space-y-5 text-center">
            <p
              className="font-mono leading-relaxed"
              style={{
                fontSize: "clamp(0.72rem, 1.6vw, 0.88rem)",
                color: "rgba(0, 232, 255, 0.4)",
                letterSpacing: "0.04em",
              }}
            >
              TRON: RETRO is a tribute to the original 1982 TRON and its digital frontier. Navigate light cycles across the Grid, engage in Disc Wars, and fight to free the system from CLU.
            </p>

            <p
              className="font-mono leading-relaxed"
              style={{
                fontSize: "clamp(0.72rem, 1.6vw, 0.88rem)",
                color: "rgba(0, 232, 255, 0.4)",
                letterSpacing: "0.04em",
              }}
            >
              Inspired by the aesthetics of TRON: Legacy and the gameplay of classic arcade light cycle games. Every grid line, every glow, every particle is crafted to pull you into the world of the Grid.
            </p>

            <p
              className="font-mono leading-relaxed"
              style={{
                fontSize: "clamp(0.72rem, 1.6vw, 0.88rem)",
                color: "rgba(0, 232, 255, 0.4)",
                letterSpacing: "0.04em",
              }}
            >
              Built with pure code. No frameworks for the game engine -- just canvas, math, and the relentless pursuit of the perfect neon glow. The Grid is alive. Every cycle you ride, every disc you throw, writes new data into the system.
            </p>

            <p
              className="font-mono leading-relaxed"
              style={{
                fontSize: "clamp(0.72rem, 1.6vw, 0.88rem)",
                color: "rgba(0, 232, 255, 0.4)",
                letterSpacing: "0.04em",
              }}
            >
              The Grid awaits. End of line.
            </p>
          </div>

          {/* Separator */}
          <div
            className="w-20 h-px my-8"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0, 232, 255, 0.25), transparent)" }}
          />

          {/* Creator section */}
          <div className="text-center">
            <p
              className="font-mono mb-3"
              style={{
                fontSize: "clamp(0.6rem, 1.2vw, 0.72rem)",
                color: "rgba(0, 232, 255, 0.25)",
                letterSpacing: "0.2em",
              }}
            >
              CREATED BY
            </p>
            <a
              href="https://www.linkedin.com/in/adrianjohnsona"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono transition-all duration-300"
              style={{
                fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
                color: "rgba(0, 232, 255, 0.5)",
                letterSpacing: "0.1em",
                borderBottom: "1px solid rgba(0, 232, 255, 0.15)",
                paddingBottom: "2px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#00e8ff"
                e.currentTarget.style.borderBottomColor = "#00e8ff"
                e.currentTarget.style.textShadow = "0 0 10px rgba(0, 232, 255, 0.4)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgba(0, 232, 255, 0.5)"
                e.currentTarget.style.borderBottomColor = "rgba(0, 232, 255, 0.15)"
                e.currentTarget.style.textShadow = "none"
              }}
            >
              ADRIAN JOHNSON
            </a>
            <p
              className="font-mono mt-2"
              style={{
                fontSize: "clamp(0.5rem, 1vw, 0.6rem)",
                color: "rgba(0, 232, 255, 0.15)",
                letterSpacing: "0.12em",
              }}
            >
              linkedin.com/in/adrianjohnsona
            </p>
          </div>

          {/* Version */}
          <div
            className="mt-10 font-mono"
            style={{
              fontSize: "clamp(0.5rem, 1vw, 0.62rem)",
              color: "rgba(0, 232, 255, 0.1)",
              letterSpacing: "0.2em",
            }}
          >
            VERSION 1.0 // TRONRETRO.ONLINE
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
