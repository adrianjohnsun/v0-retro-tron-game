import { useMobileLayout } from './useMobileLayout'

export interface ResponsivePaddingConfig {
  mobilePadding: string
  tabletPadding: string
  desktopPadding: string
}

export function useResponsivePadding(config: ResponsivePaddingConfig): string {
  const { isMobile, isTablet } = useMobileLayout()

  if (isMobile) return config.mobilePadding
  if (isTablet) return config.tabletPadding
  return config.desktopPadding
}

export function useResponsiveMargin(config: ResponsivePaddingConfig): string {
  const { isMobile, isTablet } = useMobileLayout()

  if (isMobile) return config.mobilePadding
  if (isTablet) return config.tabletPadding
  return config.desktopPadding
}

export function useResponsiveGap(config: {
  mobile: string
  tablet: string
  desktop: string
}): string {
  const { isMobile, isTablet } = useMobileLayout()

  if (isMobile) return config.mobile
  if (isTablet) return config.tablet
  return config.desktop
}

// Get touch-safe button dimensions
export function useTouchSafeDimensions() {
  const { isMobile } = useMobileLayout()

  return {
    minHeight: isMobile ? '44px' : '40px',
    minWidth: isMobile ? '44px' : '40px',
    padding: isMobile ? '0.75rem 1rem' : '0.5rem 0.75rem',
  }
}
