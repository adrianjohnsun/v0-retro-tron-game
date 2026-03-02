"use client"

import React from "react"

export type BikeClass = "scout" | "fighter" | "tank"
export type TeamColor = "cyan" | "orange" | "purple" | "green" | "red"

interface BikeRendererProps {
  color: string
  teamColor: TeamColor
  bikeClass: BikeClass
  isAlive: boolean
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT"
  speed?: number
  trailLength?: number
  hasBoost?: boolean
  healthPercent?: number
}

const getClassStats = (bikeClass: BikeClass) => {
  switch (bikeClass) {
    case "scout":
      return { speed: 1.3, acceleration: 1.2, width: 8, length: 12, health: 60 }
    case "fighter":
      return { speed: 1.0, acceleration: 1.0, width: 10, length: 14, health: 100 }
    case "tank":
      return { speed: 0.7, acceleration: 0.6, width: 12, length: 16, health: 150 }
  }
}

const getTeamColorValue = (teamColor: TeamColor): string => {
  const colors: Record<TeamColor, string> = {
    cyan: "#00f2ff",
    orange: "#ff8c00",
    purple: "#c700ff",
    green: "#00ff00",
    red: "#ff0000",
  }
  return colors[teamColor]
}

export function LightCycleBike({
  color,
  teamColor,
  bikeClass,
  isAlive,
  direction,
  speed = 0.5,
  trailLength = 100,
  hasBoost = false,
  healthPercent = 100,
}: BikeRendererProps) {
  if (!isAlive) return null

  const stats = getClassStats(bikeClass)
  const rotation = {
    UP: "-rotate-90",
    DOWN: "rotate-90",
    LEFT: "rotate-180",
    RIGHT: "rotate-0",
  }[direction]

  const baseColor = getTeamColorValue(teamColor)
  const glowIntensity = hasBoost ? 2 : 1
  const speedGlow = speed > 0.7 ? "shadow-lg" : ""

  const classEmoji = {
    scout: "⚡",
    fighter: "⚔️",
    tank: "🛡️",
  }[bikeClass]

  return (
    <div className={`relative transition-transform duration-75 ${rotation}`}>
      {/* Main bike body with team coloring */}
      <div
        className={`absolute -left-3 -top-2 w-10 h-5 border-[2px] rounded-sm ${speedGlow}`}
        style={{
          borderColor: baseColor,
          backgroundColor: "rgba(0,0,0,0.95)",
          boxShadow: `0 0 ${12 * glowIntensity}px ${baseColor}, 
                      inset 0 0 ${8 * glowIntensity}px ${baseColor}66,
                      0 0 ${20 * glowIntensity}px ${baseColor}33`,
          filter: `brightness(${1 + speed * 0.3})`,
        }}
      >
        {/* Front cockpit section */}
        <div className="absolute left-1 top-0.5 w-6 h-3 rounded-sm bg-white/15 border border-white/40 shadow-[inset_0_0_4px_rgba(255,255,255,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-sm" />
        </div>

        {/* Mid-section accent */}
        <div
          className="absolute left-2.5 top-2 w-4 h-1 rounded-full"
          style={{
            backgroundColor: baseColor,
            boxShadow: `0 0 6px ${baseColor}`,
            opacity: 0.8,
          }}
        />

        {/* Rear thruster exhaust */}
        <div className="absolute -right-2 top-1 w-3 h-1.5 bg-white/10 border-l-2 border-inherit rounded-r" />
        <div className="absolute -right-2 bottom-1 w-3 h-1.5 bg-white/10 border-l-2 border-inherit rounded-r" />

        {/* Boost effect */}
        {hasBoost && (
          <div
            className="absolute -right-3 top-0.5 bottom-0.5 w-2 animate-pulse"
            style={{
              backgroundColor: baseColor,
              boxShadow: `0 0 8px ${baseColor}, 0 0 12px ${baseColor}99`,
              opacity: 0.9,
            }}
          />
        )}
      </div>

      {/* Health indicator bar */}
      {healthPercent < 100 && (
        <div className="absolute -left-3 -top-4 w-10 h-1 bg-black/50 border border-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
            style={{
              width: `${healthPercent}%`,
              boxShadow: `0 0 4px rgba(255,100,0,0.6)`,
            }}
          />
        </div>
      )}

      {/* Class indicator */}
      <div className="absolute -left-2 -bottom-3 text-xs opacity-60">{classEmoji}</div>
    </div>
  )
}

export function BikeStatsDisplay({
  bikeClass,
  teamColor,
  speed,
}: {
  bikeClass: BikeClass
  teamColor: TeamColor
  speed: number
}) {
  const stats = getClassStats(bikeClass)
  const color = getTeamColorValue(teamColor)

  return (
    <div className="text-xs font-mono space-y-0.5">
      <div style={{ color }}>
        {bikeClass.toUpperCase()} CLASS
      </div>
      <div className="text-white/60">
        Speed: {((speed / stats.speed) * 100).toFixed(0)}%
      </div>
      <div className="text-white/60">
        Health: {stats.health}
      </div>
    </div>
  )
}
