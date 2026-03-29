// Tron Legacy-style geometric icons
export const TronIcons = {
  Grid: ({ size = 24, color = "#00f2ff" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="2" x2="8" y2="22" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="16" y1="2" x2="16" y2="22" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="2" y1="8" x2="22" y2="8" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="2" y1="16" x2="22" y2="16" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  ),

  Hexagon: ({ size = 24, color = "#00f2ff" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L20.39 6.39V15.61L12 22L3.61 15.61V6.39L12 2Z" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  ),

  Disc: ({ size = 24, color = "#ff8c00" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1" opacity="0.6" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  ),

  RadarPulse: ({ size = 24, color = "#00f2ff" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2" fill={color} />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1" opacity="0.7" />
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1" opacity="0.4" />
      <path d="M12 2L12 8" stroke={color} strokeWidth="1.5" />
    </svg>
  ),

  Circuit: ({ size = 24, color = "#00f2ff" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="6" cy="6" r="1.5" fill={color} />
      <circle cx="18" cy="6" r="1.5" fill={color} />
      <circle cx="6" cy="18" r="1.5" fill={color} />
      <circle cx="18" cy="18" r="1.5" fill={color} />
      <line x1="6" y1="6" x2="18" y2="6" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="6" y1="18" x2="18" y2="18" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  ),

  Diamond: ({ size = 24, color = "#00f2ff" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L22 12L12 22L2 12Z" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  ),
}

export function TronIconWrapper({
  icon: Icon,
  size = 24,
  color = "#00f2ff",
  className = "",
}: {
  icon: typeof TronIcons.Grid
  size?: number
  color?: string
  className?: string
}) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Icon size={size} color={color} />
    </div>
  )
}
