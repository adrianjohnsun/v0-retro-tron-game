"use client"

import { useEffect, useState } from "react"

interface CluFaceProps {
  isSpeaking: boolean
  color?: string
}

export function CluFace({ isSpeaking, color = "#ff8c00" }: CluFaceProps) {
  const [mouthOpen, setMouthOpen] = useState(0)
  const [eyeIntensity, setEyeIntensity] = useState(1)

  // Animate mouth based on speaking state
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0)
      setEyeIntensity(0.6)
      return
    }

    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 10)
      setEyeIntensity(0.5 + Math.random() * 0.5)
    }, 90)

    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <div className="relative w-48 h-56 flex items-center justify-center" style={{ filter: `drop-shadow(0 0 12px ${color})` }}>
      <svg viewBox="0 0 100 130" className="w-full h-full">
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Face Outline - Angular/Robotic like CLU 2 */}
        <path
          d="M25,35 L75,35 L82,75 L75,110 Q50,120 25,110 L18,75 Z"
          fill={`${color}08`}
          stroke={color}
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Face panel divider */}
        <path d="M50,35 L50,110" stroke={color} strokeWidth="0.75" opacity="0.3" />

        {/* Upper face structure */}
        <path d="M25,35 L75,35 L78,60 L22,60 Z" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />

        {/* Eyes - Larger, more defined like CLU from the movie */}
        <g style={{ opacity: eyeIntensity }}>
          {/* Left Eye */}
          <ellipse cx="32" cy="52" rx="7" ry="8" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="32" cy="52" r="5" fill={color} opacity="0.7" />
          <circle cx="33" cy="51" r="2" fill={`${color}FF`} opacity="0.9" />

          {/* Right Eye */}
          <ellipse cx="68" cy="52" rx="7" ry="8" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="68" cy="52" r="5" fill={color} opacity="0.7" />
          <circle cx="69" cy="51" r="2" fill={`${color}FF`} opacity="0.9" />
        </g>

        {/* Nose/Center ridge - geometric */}
        <path d="M50,45 L50,75" stroke={color} strokeWidth="1" opacity="0.4" />
        <path d="M48,75 L52,75" stroke={color} strokeWidth="1.5" opacity="0.6" />

        {/* Lower face structure */}
        <path d="M22,70 L78,70 L82,100 L18,100 Z" stroke={color} strokeWidth="0.5" fill="none" opacity="0.15" />

        {/* Mouth - more natural curves like CLU */}
        <g transform={`translate(50, 88)`}>
          {/* Upper lip */}
          <path
            d={`M-10,0 Q0,${mouthOpen * 0.8} 10,0`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-75"
          />
          {/* Lower lip */}
          <path
            d={`M-10,0 Q0,${mouthOpen * 0.6 + 2} 10,0`}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
            className="transition-all duration-75"
          />
          {/* Inner mouth glow when speaking */}
          {isSpeaking && mouthOpen > 3 && (
            <circle cx="0" cy={mouthOpen * 0.5} r="3" fill={color} opacity="0.3" className="animate-pulse" />
          )}
        </g>

        {/* Cheekbone definition */}
        <path d="M18,60 Q15,70 18,85" stroke={color} strokeWidth="0.75" fill="none" opacity="0.3" />
        <path d="M82,60 Q85,70 82,85" stroke={color} strokeWidth="0.75" fill="none" opacity="0.3" />

        {/* Digital artifacts when speaking */}
        {isSpeaking && (
          <g className="animate-pulse">
            <line x1="12" y1="45" x2="18" y2="45" stroke={color} strokeWidth="1" opacity="0.5" />
            <line x1="82" y1="65" x2="88" y2="65" stroke={color} strokeWidth="1" opacity="0.5" />
            <line x1="15" y1="100" x2="20" y2="100" stroke={color} strokeWidth="0.75" opacity="0.4" />
          </g>
        )}
      </svg>

      {/* Ambient glow background */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-xl pointer-events-none"
        style={{
          backgroundColor: color,
          filter: `blur(20px)`,
        }}
      />

      {/* Scanning line animation */}
      <div
        className="absolute w-full h-0.5 pointer-events-none animate-[scan-vertical_3s_linear_infinite]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.3,
        }}
      />
    </div>
  )
}
