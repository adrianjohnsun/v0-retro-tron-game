"use client"

import { useEffect, useState } from "react"

interface CluFaceProps {
  isSpeaking: boolean
  color?: string
}

export function CluFace({ isSpeaking, color = "#ff8c00" }: CluFaceProps) {
  const [mouthOpen, setMouthOpen] = useState(0)
  const [eyeFlicker, setEyeFlicker] = useState(false)

  // Animate mouth based on speaking state
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0)
      return
    }

    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 8)
      setEyeFlicker(Math.random() > 0.95)
    }, 100)

    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <div className="relative w-48 h-56 flex items-center justify-center filter drop-shadow-[0_0_8px_var(--secondary)]">
      <svg viewBox="0 0 100 120" className="w-full h-full">
        {/* Face Outline - Wireframe style */}
        <path
          d="M20,30 Q50,15 80,30 L85,70 Q85,100 50,110 Q15,100 15,70 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Inner Structure Lines */}
        <path d="M15,50 L85,50" stroke={color} strokeWidth="0.5" strokeDasharray="2,2" className="opacity-30" />
        <path d="M50,15 L50,110" stroke={color} strokeWidth="0.5" strokeDasharray="2,2" className="opacity-30" />

        {/* Eyes - Rectangular/Digital */}
        <g className={eyeFlicker ? "opacity-20" : "opacity-100"}>
          {/* Left Eye */}
          <rect x="25" y="45" width="15" height="4" fill={color} className="animate-pulse" />
          <rect x="25" y="42" width="15" height="1" fill={color} className="opacity-40" />

          {/* Right Eye */}
          <rect x="60" y="45" width="15" height="4" fill={color} className="animate-pulse" />
          <rect x="60" y="42" width="15" height="1" fill={color} className="opacity-40" />
        </g>

        {/* Nose - Vector style */}
        <path d="M48,55 L52,55 L50,75 Z" fill="none" stroke={color} strokeWidth="1" className="opacity-60" />

        {/* Mouth - Animated */}
        <g transform={`translate(50, 88)`}>
          <path
            d={`M-12,0 Q0,${mouthOpen} 12,0`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-75"
          />
          {/* Jaw highlight */}
          <path
            d={`M-15,4 Q0,${mouthOpen + 4} 15,4`}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            className="opacity-30"
          />
        </g>

        {/* Digital Glitch Elements */}
        {isSpeaking && (
          <g className="animate-pulse">
            <line x1="10" y1="20" x2="20" y2="20" stroke={color} strokeWidth="1" />
            <line x1="80" y1="90" x2="90" y2="90" stroke={color} strokeWidth="1" />
          </g>
        )}
      </svg>

      {/* Scanning line for the face */}
      <div
        className="absolute w-full h-1 bg-white opacity-20 pointer-events-none animate-[scan-vertical_4s_linear_infinite]"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}
