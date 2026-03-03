'use client'

import React, { useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture, Html, PerspectiveCamera, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

interface ParticleIntroProps {
  onComplete: () => void
  skipable?: boolean
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCountRef = useRef(3000)

  useEffect(() => {
    if (!particlesRef.current) return

    const geometry = new THREE.BufferGeometry()
    const particleCount = particleCountRef.current

    // Initial random positions in a sphere
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const targetPositions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    // TRON text positions (simplified letter shapes)
    const textPositions = generateTRONPositions(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 15
      const height = (Math.random() - 0.5) * 20

      positions[i * 3] = Math.cos(angle) * distance
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * distance

      velocities[i * 3] = (Math.random() - 0.5) * 0.3
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.3
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      const textPos = textPositions[i % textPositions.length]
      targetPositions[i * 3] = textPos.x
      targetPositions[i * 3 + 1] = textPos.y
      targetPositions[i * 3 + 2] = textPos.z

      // Neon cyan to magenta gradient
      const colorMix = Math.random()
      if (colorMix > 0.5) {
        colors[i * 3] = 0 // R
        colors[i * 3 + 1] = 1 // G (cyan)
        colors[i * 3 + 2] = 1 // B
      } else {
        colors[i * 3] = 1 // R (magenta)
        colors[i * 3 + 1] = 0.2 // G
        colors[i * 3 + 2] = 1 // B
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      toneMapped: false,
    })

    particlesRef.current.geometry = geometry
    particlesRef.current.material = material

    let time = 0
    const animationDuration = 4000 // 4 seconds
    let animationFrameId: number

    const animate = () => {
      time += 16 // Approximately 60fps
      const progress = Math.min(time / animationDuration, 1)

      const positions = geometry.attributes.position.array as Float32Array
      const colors = geometry.attributes.color.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        // Explosion phase (0-0.4)
        if (progress < 0.4) {
          const explosionProg = progress / 0.4
          const force = explosionProg * 2

          positions[i * 3] += velocities[i * 3] * force
          positions[i * 3 + 1] += velocities[i * 3 + 1] * force
          positions[i * 3 + 2] += velocities[i * 3 + 2] * force
        } else {
          // Converge phase (0.4-1.0)
          const convergeProg = (progress - 0.4) / 0.6
          const easeInOutCubic = convergeProg < 0.5
            ? 4 * convergeProg * convergeProg * convergeProg
            : 1 - Math.pow(-2 * convergeProg + 2, 3) / 2

          positions[i * 3] = THREE.MathUtils.lerp(
            positions[i * 3],
            targetPositions[i * 3],
            easeInOutCubic * 0.05
          )
          positions[i * 3 + 1] = THREE.MathUtils.lerp(
            positions[i * 3 + 1],
            targetPositions[i * 3 + 1],
            easeInOutCubic * 0.05
          )
          positions[i * 3 + 2] = THREE.MathUtils.lerp(
            positions[i * 3 + 2],
            targetPositions[i * 3 + 2],
            easeInOutCubic * 0.05
          )
        }

        // Glow intensity animation
        const glowIntensity = Math.sin(progress * Math.PI * 2) * 0.2 + 0.8
        colors[i * 3] *= glowIntensity
        colors[i * 3 + 1] *= glowIntensity
        colors[i * 3 + 2] *= glowIntensity
      }

      geometry.attributes.position.needsUpdate = true
      geometry.attributes.color.needsUpdate = true

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial sizeAttenuation transparent />
    </points>
  )
}

function generateTRONPositions(totalCount: number) {
  const positions: Array<{ x: number; y: number; z: number }> = []
  const letterSpacing = 3
  const letterWidth = 2.5

  // T shape
  addLetterT(positions, -4.5, 0, 0)
  // R shape
  addLetterR(positions, -1.5, 0, 0)
  // O shape
  addLetterO(positions, 1.5, 0, 0)
  // N shape
  addLetterN(positions, 4.5, 0, 0)

  // Scale to match particle count
  while (positions.length < totalCount) {
    positions.push(...positions.slice(0, Math.min(100, totalCount - positions.length)))
  }

  return positions.slice(0, totalCount)
}

function addLetterT(
  positions: Array<{ x: number; y: number; z: number }>,
  offsetX: number,
  offsetY: number,
  offsetZ: number
) {
  // Top horizontal bar
  for (let x = -1; x <= 1; x += 0.2) {
    for (let z = -0.5; z <= 0.5; z += 0.3) {
      positions.push({ x: offsetX + x, y: offsetY + 1, z: offsetZ + z })
    }
  }
  // Vertical bar
  for (let y = -1; y <= 1; y += 0.2) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      positions.push({ x: offsetX, y: offsetY + y, z: offsetZ + z })
    }
  }
}

function addLetterR(
  positions: Array<{ x: number; y: number; z: number }>,
  offsetX: number,
  offsetY: number,
  offsetZ: number
) {
  // Vertical bar
  for (let y = -1; y <= 1; y += 0.2) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      positions.push({ x: offsetX - 0.5, y: offsetY + y, z: offsetZ + z })
    }
  }
  // Top curve
  for (let x = 0; x <= 1; x += 0.2) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      positions.push({ x: offsetX - 0.5 + x, y: offsetY + 0.5, z: offsetZ + z })
    }
  }
  // Diagonal leg
  for (let i = 0; i <= 1; i += 0.2) {
    positions.push({ x: offsetX - 0.5 + i, y: offsetY - i, z: offsetZ })
  }
}

function addLetterO(
  positions: Array<{ x: number; y: number; z: number }>,
  offsetX: number,
  offsetY: number,
  offsetZ: number
) {
  const radius = 0.8
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      positions.push({
        x: offsetX + Math.cos(angle) * radius,
        y: offsetY + Math.sin(angle) * radius,
        z: offsetZ + z,
      })
    }
  }
}

function addLetterN(
  positions: Array<{ x: number; y: number; z: number }>,
  offsetX: number,
  offsetY: number,
  offsetZ: number
) {
  // Left vertical
  for (let y = -1; y <= 1; y += 0.2) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      positions.push({ x: offsetX - 0.5, y: offsetY + y, z: offsetZ + z })
    }
  }
  // Diagonal
  for (let i = 0; i <= 1; i += 0.15) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      positions.push({ x: offsetX - 0.5 + i, y: offsetY - 1 + i * 2, z: offsetZ + z })
    }
  }
  // Right vertical
  for (let y = -1; y <= 1; y += 0.2) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      positions.push({ x: offsetX + 0.5, y: offsetY + y, z: offsetZ + z })
    }
  }
}

export function ParticleIntro({ onComplete, skipable = true }: ParticleIntroProps) {
  const [isSkipped, setIsSkipped] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSkipped) {
        onComplete()
      }
    }, 4500)

    return () => clearTimeout(timer)
  }, [isSkipped, onComplete])

  const handleSkip = () => {
    setIsSkipped(true)
    onComplete()
  }

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          toneMappingExposure: 1,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#000000']} />

        {/* Lighting */}
        <ambientLight intensity={0.3} color="#00f2ff" />
        <pointLight position={[0, 0, 10]} intensity={1.5} color="#00f2ff" />
        <pointLight position={[10, 10, 5]} intensity={0.8} color="#ff1493" />
        <pointLight position={[-10, -10, 5]} intensity={0.8} color="#00f2ff" />

        {/* Particles */}
        <Particles />
      </Canvas>

      {/* Skip button */}
      {skipable && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 px-4 py-2 text-sm font-mono text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-black transition-all"
        >
          SKIP &gt;
        </button>
      )}

      {/* Bottom text hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center font-retro text-cyan-400 text-sm opacity-60 animate-pulse">
        Entering the Grid...
      </div>
    </div>
  )
}
