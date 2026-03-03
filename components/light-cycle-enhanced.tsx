'use client'

import React from 'react'
import type { Direction } from '@/components/tron-game'

interface LightCycleEnhancedProps {
  color: string
  dir: Direction
  isAlive: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LightCycleEnhanced({ 
  color, 
  dir, 
  isAlive,
  size = 'md'
}: LightCycleEnhancedProps) {
  const sizeMap = {
    sm: { width: 'w-8', height: 'h-4', iconSize: 'w-6 h-4' },
    md: { width: 'w-10', height: 'h-5', iconSize: 'w-6 h-[1px]' },
    lg: { width: 'w-12', height: 'h-6', iconSize: 'w-7 h-1.5' },
  }

  const rotation = {
    UP: '-rotate-90',
    DOWN: 'rotate-90',
    LEFT: 'rotate-180',
    RIGHT: 'rotate-0',
  }[dir]

  const dims = sizeMap[size]

  if (!isAlive) return null

  return (
    <div className={`relative transition-transform duration-100 ${rotation}`}>
      <div
        className={`absolute -left-3 -top-2 ${dims.width} ${dims.height} border-[1.5px] rounded-sm`}
        style={{
          borderColor: color,
          backgroundColor: 'rgba(0,0,0,0.95)',
          boxShadow: `
            0 0 12px ${color}, 
            inset 0 0 8px ${color}44,
            0 0 20px ${color}22
          `,
        }}
      >
        {/* Front light */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" 
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}, 0 0 12px ${color}55`
          }}
        />

        {/* Windscreen */}
        <div className="absolute right-1 top-0.5 w-3 h-2 border border-white/40 rounded-sm overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}10, ${color}05)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent" />
        </div>

        {/* Side accents */}
        <div className="absolute -left-1.5 top-0.5 w-1.5 h-3.5 border border-inherit opacity-60" />
        <div className="absolute -right-1 top-1 w-1.5 h-0.5" style={{ background: color, opacity: 0.7 }} />
        <div className="absolute -right-1 bottom-1 w-1.5 h-0.5" style={{ background: color, opacity: 0.7 }} />

        {/* Energy trail */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-full opacity-40"
          style={{
            background: `linear-gradient(90deg, ${color}66, transparent)`,
          }}
        />
      </div>

      {/* Motion blur trail effect */}
      <div
        className="absolute -left-3 -top-2 opacity-30"
        style={{
          width: dims.width,
          height: dims.height,
          background: color,
          filter: 'blur(8px)',
          transform: 'scaleX(1.5)',
          zIndex: -1,
        }}
      />
    </div>
  )
}

// Trail visualization component for 3D effect
export function BikeTrail({
  points,
  color,
  glowing = true,
}: {
  points: Array<{ x: number; y: number }>
  color: string
  glowing?: boolean
}) {
  if (points.length < 2) return null

  return (
    <>
      {/* Main trail line */}
      <svg
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>

      {/* Glow trail (3D effect) */}
      {glowing && (
        <svg
          className="absolute inset-0"
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <filter id={`trail-glow-${color.replace('#', '')}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="4"
            opacity="0.2"
            filter={`url(#trail-glow-${color.replace('#', '')})`}
          />
        </svg>
      )}
    </>
  )
}
