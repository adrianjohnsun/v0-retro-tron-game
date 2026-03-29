"use client"

import { useEffect, useState } from "react"

interface CluFaceProps {
  isSpeaking: boolean
  color?: string
}

export function CluFace({ isSpeaking, color = "#ff8c00" }: CluFaceProps) {
  const [eyeGlow, setEyeGlow] = useState(1)

  // Animate eye glow based on speaking state
  useEffect(() => {
    if (!isSpeaking) {
      setEyeGlow(0.8)
      return
    }

    const interval = setInterval(() => {
      setEyeGlow(0.7 + Math.random() * 0.3)
    }, 150)

    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <div className="relative w-56 h-64 flex items-center justify-center">
      <svg viewBox="0 0 120 150" className="w-full h-full">
        <defs>
          {/* Strong glow filter for eyes */}
          <filter id="eyeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Outer glow */}
          <filter id="outerGlow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark helmet/head base - minimal geometric shape */}
        <path
          d="M30,40 L90,40 Q105,50 105,90 Q105,130 60,145 Q15,130 15,90 Q15,50 30,40 Z"
          fill="#1a1a1a"
          stroke={color}
          strokeWidth="2.5"
          filter="url(#outerGlow)"
        />

        {/* Subtle center panel line */}
        <line x1="60" y1="40" x2="60" y2="145" stroke={color} strokeWidth="0.5" opacity="0.15" />

        {/* Left Eye - Large glowing hexagon-like shape */}
        <g style={{ opacity: eyeGlow }}>
          {/* Outer glow circle */}
          <circle cx="38" cy="70" r="18" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" filter="url(#eyeGlow)" />
          
          {/* Main eye - bold hexagonal outline */}
          <path
            d="M32,58 L44,58 L50,64 L50,78 L44,84 L32,84 L26,78 L26,64 Z"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#eyeGlow)"
          />
          
          {/* Inner bright fill */}
          <circle cx="38" cy="71" r="12" fill={color} opacity="0.8" filter="url(#eyeGlow)" />
          
          {/* Bright core highlight */}
          <circle cx="38" cy="68" r="6" fill={color} opacity="1" filter="url(#eyeGlow)" />
        </g>

        {/* Right Eye - Large glowing hexagon-like shape */}
        <g style={{ opacity: eyeGlow }}>
          {/* Outer glow circle */}
          <circle cx="82" cy="70" r="18" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" filter="url(#eyeGlow)" />
          
          {/* Main eye - bold hexagonal outline */}
          <path
            d="M76,58 L88,58 L94,64 L94,78 L88,84 L76,84 L70,78 L70,64 Z"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#eyeGlow)"
          />
          
          {/* Inner bright fill */}
          <circle cx="82" cy="71" r="12" fill={color} opacity="0.8" filter="url(#eyeGlow)" />
          
          {/* Bright core highlight */}
          <circle cx="82" cy="68" r="6" fill={color} opacity="1" filter="url(#eyeGlow)" />
        </g>

        {/* Lower face geometry - minimal details */}
        <path
          d="M40,105 L80,105"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.4"
          strokeLinecap="round"
        />

        {/* Mouth line when speaking */}
        {isSpeaking && (
          <g className="animate-pulse">
            <path
              d="M45,115 Q60,125 75,115"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>
        )}

        {/* Subtle side panel lines for geometry */}
        <path d="M20,70 Q15,80 20,95" stroke={color} strokeWidth="0.75" opacity="0.2" />
        <path d="M100,70 Q105,80 100,95" stroke={color} strokeWidth="0.75" opacity="0.2" />
      </svg>

      {/* Strong ambient glow around face */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-2xl pointer-events-none -z-10"
        style={{
          backgroundColor: color,
          width: "120%",
          height: "120%",
          left: "-10%",
          top: "-10%",
        }}
      />
    </div>
  )
}
