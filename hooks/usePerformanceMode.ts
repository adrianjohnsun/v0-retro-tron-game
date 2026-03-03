import { useEffect, useState } from 'react'
import { useMobileLayout } from './useMobileLayout'

export interface PerformanceSettings {
  enableParticles: boolean
  particleCount: number
  enableGlows: boolean
  enableShadows: boolean
  enableBlur: boolean
  reduceAnimations: boolean
  targetFPS: number
}

export function usePerformanceMode(): PerformanceSettings {
  const { isMobile } = useMobileLayout()
  const [hasLowBattery, setHasLowBattery] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check for low battery mode
    if ('getBattery' in navigator) {
      ;(navigator as any).getBattery?.().then((battery: any) => {
        const updateBattery = () => setHasLowBattery(battery.level < 0.2 && battery.discharging)
        battery.addEventListener('chargingchange', updateBattery)
        battery.addEventListener('levelchange', updateBattery)
        return () => {
          battery.removeEventListener('chargingchange', updateBattery)
          battery.removeEventListener('levelchange', updateBattery)
        }
      })
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Determine settings based on device and battery
  if (isMobile) {
    return {
      enableParticles: !hasLowBattery,
      particleCount: hasLowBattery ? 500 : 1500,
      enableGlows: !hasLowBattery,
      enableShadows: false,
      enableBlur: !hasLowBattery,
      reduceAnimations: prefersReducedMotion || hasLowBattery,
      targetFPS: hasLowBattery ? 30 : 60,
    }
  }

  return {
    enableParticles: true,
    particleCount: 3000,
    enableGlows: true,
    enableShadows: true,
    enableBlur: true,
    reduceAnimations: prefersReducedMotion,
    targetFPS: 60,
  }
}
