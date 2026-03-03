'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface BikeProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  scale?: number
}

function BikeMesh({ position = [0, 0, 0], rotation = [0, 0, 0], color = '#00f2ff', scale = 1 }: BikeProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Create neon material
  const neonMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1.5,
      metalness: 0.8,
      roughness: 0.2,
      toneMapped: false,
    })
  }, [color])

  // Dark material for shadow areas
  const darkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#0a0a1a',
      metalness: 0.6,
      roughness: 0.4,
    })
  }, [])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Main bike body - elongated rectangular shape */}
      <mesh position={[0, 0, 0]} material={neonMaterial}>
        <boxGeometry args={[0.8, 0.3, 2.5]} />
      </mesh>

      {/* Driver pod - slightly elevated */}
      <mesh position={[0, 0.4, -0.5]} material={neonMaterial}>
        <boxGeometry args={[0.5, 0.4, 0.8]} />
      </mesh>

      {/* Front windscreen */}
      <mesh position={[0, 0.5, -1.2]} material={neonMaterial}>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
      </mesh>

      {/* Rear tail fin */}
      <mesh position={[0, 0.2, 1.2]} material={darkMaterial}>
        <boxGeometry args={[0.6, 0.5, 0.3]} />
      </mesh>

      {/* Left wheel axle */}
      <mesh position={[-0.5, -0.15, -0.5]} material={neonMaterial} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
      </mesh>

      {/* Right wheel axle */}
      <mesh position={[0.5, -0.15, -0.5]} material={neonMaterial} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
      </mesh>

      {/* Left rear wheel axle */}
      <mesh position={[-0.5, -0.15, 0.8]} material={neonMaterial} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
      </mesh>

      {/* Right rear wheel axle */}
      <mesh position={[0.5, -0.15, 0.8]} material={neonMaterial} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
      </mesh>

      {/* Energy trail connector left */}
      <mesh position={[-0.4, -0.25, -1.25]} material={neonMaterial}>
        <boxGeometry args={[0.15, 0.15, 0.5]} />
      </mesh>

      {/* Energy trail connector right */}
      <mesh position={[0.4, -0.25, -1.25]} material={neonMaterial}>
        <boxGeometry args={[0.15, 0.15, 0.5]} />
      </mesh>

      {/* Handle bars */}
      <mesh position={[0, 0.6, -0.8]} material={neonMaterial}>
        <boxGeometry args={[0.8, 0.1, 0.2]} />
      </mesh>

      {/* Center spine - light trail emission */}
      <mesh position={[0, -0.05, 0]} material={neonMaterial}>
        <boxGeometry args={[0.1, 0.1, 2.6]} />
      </mesh>
    </group>
  )
}

export function Bike3D({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  color = '#00f2ff',
  scale = 1,
  interactive = false 
}: BikeProps & { interactive?: boolean }) {
  return (
    <Canvas
      camera={{ position: [3, 2, 4], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: true,
        toneMappingExposure: 1
      }}
    >
      <color attach="background" args={['#000000']} />
      
      {/* Lighting setup */}
      <ambientLight intensity={0.5} color={color} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.2} 
        castShadow 
        color="#ffffff"
      />
      <pointLight 
        position={[-5, 2, 3]} 
        intensity={0.8} 
        color={color}
      />
      <pointLight 
        position={[0, 0, -5]} 
        intensity={0.6} 
        color="#ff1493"
      />

      <BikeMesh position={position} rotation={rotation} color={color} scale={scale} />

      {interactive && (
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={2}
          enableZoom={false}
          enablePan={false}
        />
      )}
    </Canvas>
  )
}

export function SimpleBike3D({ color = '#00f2ff' }: { color?: string }) {
  return (
    <Canvas
      camera={{ position: [2, 1.5, 3], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: true,
      }}
    >
      <color attach="background" args={['#000000']} />
      
      <ambientLight intensity={0.6} color={color} />
      <directionalLight position={[4, 4, 4]} intensity={1} color="#ffffff" />
      <pointLight position={[-4, 2, 2]} intensity={0.8} color={color} />
      
      <BikeMesh color={color} scale={0.8} />
    </Canvas>
  )
}
