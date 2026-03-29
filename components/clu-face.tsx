"use client"

import { useEffect, useState } from "react"

interface CluFaceProps {
  isSpeaking: boolean
  color?: string
}

export function CluFace({ isSpeaking, color = "#ffd700" }: CluFaceProps) {
  const [glowIntensity, setGlowIntensity] = useState(1)

  // Pulse glow effect when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setGlowIntensity(0.8)
      return
    }

    const interval = setInterval(() => {
      setGlowIntensity(0.85 + Math.random() * 0.15)
    }, 200)

    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <div className="relative w-56 h-64 flex items-center justify-center">
      <svg viewBox="0 0 200 240" className="w-full h-full">
        <defs>
          {/* Strong glow filter for the visor */}
          <filter id="visorGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense outer glow */}
          <filter id="outerGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main U-shaped visor outline - iconic CLU helmet design */}
        <path
          d="M50,40 Q50,20 100,15 Q150,20 150,40 L150,120 Q150,150 100,160 Q50,150 50,120 Z"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#outerGlow)"
          style={{ opacity: glowIntensity, transition: "opacity 0.3s ease" }}
        />

        {/* Inner highlight on visor edges for depth */}
        <path
          d="M55,45 Q55,28 100,23 Q145,28 145,45 L145,115 Q145,140 100,150 Q55,140 55,115 Z"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
          filter="url(#visorGlow)"
        />

        {/* Subtle glow pulsing effect when speaking */}
        {isSpeaking && (
          <path
            d="M50,40 Q50,20 100,15 Q150,20 150,40 L150,120 Q150,150 100,160 Q50,150 50,120 Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            className="animate-pulse"
            filter="url(#visorGlow)"
          />
        )}

        {/* Subtle center panel line for geometric detail */}
        <line
          x1="100"
          y1="15"
          x2="100"
          y2="160"
          stroke={color}
          strokeWidth="1"
          opacity="0.2"
        />
      </svg>

      {/* Ambient glow background */}
      <div
        className="absolute inset-0 rounded-full opacity-35 blur-3xl pointer-events-none -z-10 transition-opacity duration-300"
        style={{
          backgroundColor: color,
          width: "150%",
          height: "150%",
          left: "-25%",
          top: "-25%",
          opacity: 0.35 * glowIntensity,
        }}
      />
    </div>
  )
}
