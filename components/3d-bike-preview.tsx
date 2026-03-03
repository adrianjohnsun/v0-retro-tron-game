'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useMobileLayout } from '@/hooks/useMobileLayout'

// Dynamically load Canvas to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
})

const BikePreviewContent = dynamic(
  async () => {
    const module = await import('./3d-bike')
    return { default: module.SimpleBike3D }
  },
  { ssr: false }
)

interface BikePreviewProps {
  color?: string
  containerHeight?: string
}

export function BikePreview3D({ 
  color = '#00f2ff',
  containerHeight = 'h-48'
}: BikePreviewProps) {
  const { isMobile } = useMobileLayout()

  // Don't render 3D on mobile for performance
  if (isMobile) {
    return (
      <div className={`${containerHeight} bg-black border border-cyan-400/20 rounded flex items-center justify-center`}>
        <span className="text-cyan-400/40 text-xs font-mono">3D Preview</span>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className={`${containerHeight} bg-black`} />}>
      <div className={`${containerHeight} w-full bg-black rounded border border-cyan-400/10`}>
        <BikePreviewContent color={color} />
      </div>
    </Suspense>
  )
}

// Standalone interactive 3D bike viewer
export function BikeViewer3D({ 
  color = '#00f2ff'
}: { color?: string }) {
  const { isMobile } = useMobileLayout()

  if (isMobile) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-cyan-400/40 font-mono text-sm">3D Viewer</p>
          <p className="text-cyan-400/20 font-mono text-xs mt-2">Not available on mobile</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="w-full h-screen bg-black" />}>
      <BikePreviewContent color={color} />
    </Suspense>
  )
}
