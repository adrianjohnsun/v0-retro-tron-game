'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import TronOpening from './tron-opening'

interface EnhancedIntroProps {
  onComplete: () => void
  use3D?: boolean
}

export function EnhancedTronIntro({ onComplete, use3D = true }: EnhancedIntroProps) {
  const { isMobile } = useMobileLayout()
  const [showParticles, setShowParticles] = useState(true)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)

  // Use 3D only on desktop, fallback to 2D on mobile for performance
  const shouldUse3D = use3D && !isMobile

  useEffect(() => {
    if (!showParticles || !shouldUse3D || !particleCanvasRef.current) return

    const canvas = particleCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const w = window.innerWidth
    const h = window.innerHeight
    const centerX = w / 2
    const centerY = h / 2

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
    }

    const particles: Particle[] = []
    const particleCount = isMobile ? 500 : 1500

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 300 + 50

      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: Math.cos(angle) * (Math.random() + 0.5),
        vy: Math.sin(angle) * (Math.random() + 0.5),
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.5 ? '#00f2ff' : '#ff1493',
      })
    }

    let startTime = performance.now()

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / 4000, 1)

      ctx.fillStyle = 'rgba(0, 5, 10, 0.2)'
      ctx.fillRect(0, 0, w, h)

      particles.forEach((particle, i) => {
        const explosionForce = Math.sin(progress * Math.PI) * 2

        particle.x += particle.vx * explosionForce
        particle.y += particle.vy * explosionForce

        const convergeProg = Math.max(0, progress - 0.3) / 0.7
        particle.x = particle.x * (1 - convergeProg * 0.01) + centerX * convergeProg * 0.01
        particle.y = particle.y * (1 - convergeProg * 0.01) + centerY * convergeProg * 0.01

        const alpha = particle.opacity * (1 - Math.abs(progress - 0.5) * 0.2)
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
        if (progress > 0.2 && progress < 0.8) {
          ctx.shadowColor = particle.color
          ctx.shadowBlur = 10
          ctx.fillStyle = particle.color + '33'
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      // Center glow
      const glowIntensity = Math.sin(progress * Math.PI * 2) * 0.3 + 0.5
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200)
      gradient.addColorStop(0, `rgba(0, 242, 255, ${glowIntensity * 0.15})`)
      gradient.addColorStop(0.5, `rgba(255, 20, 147, ${glowIntensity * 0.05})`)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [showParticles, shouldUse3D, isMobile])

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Traditional 2D intro (always shown) */}
      <TronOpening onComplete={() => {
        setShowParticles(false)
        setTimeout(onComplete, 200)
      }} />

      {/* 3D particle overlay (desktop only) */}
      {shouldUse3D && showParticles && (
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 45 }}
        />
      )}
    </div>
  )
}

export default EnhancedTronIntro
