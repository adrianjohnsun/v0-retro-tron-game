import { useEffect, useState } from 'react'

export interface MobileLayoutConfig {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  isLandscape: boolean
  isPortrait: boolean
  isTouchDevice: boolean
}

export function useMobileLayout(): MobileLayoutConfig {
  const [config, setConfig] = useState<MobileLayoutConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true,
    isPortrait: typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false,
    isTouchDevice: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
  })

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      setConfig({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        isLandscape: width > height,
        isPortrait: height > width,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      })
    }

    updateConfig()

    window.addEventListener('resize', updateConfig)
    window.addEventListener('orientationchange', updateConfig)

    return () => {
      window.removeEventListener('resize', updateConfig)
      window.removeEventListener('orientationchange', updateConfig)
    }
  }, [])

  return config
}

export function getResponsiveValue<T>(
  mobileValue: T,
  tabletValue: T,
  desktopValue: T,
  config: MobileLayoutConfig
): T {
  if (config.isMobile) return mobileValue
  if (config.isTablet) return tabletValue
  return desktopValue
}

export function getParticleCount(config: MobileLayoutConfig): number {
  if (config.isMobile) return 1500 // Lower for mobile performance
  if (config.isTablet) return 2000
  return 3000 // Full quality on desktop
}
