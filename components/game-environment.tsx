"use client"

import React, { useMemo } from "react"

export interface EnvironmentTile {
  x: number
  y: number
  type: "floor" | "wall" | "hazard" | "boost"
  level: "top" | "basement"
  isActive: boolean
}

interface GameEnvironmentProps {
  gridSize: number
  cellSize: number
  environmentType: "topLevel" | "basement" | "mixed"
  boosts: Array<{ x: number; y: number; type: "speed" | "shield" | "slow" }>
  activateBoost?: (x: number, y: number) => void
}

const generateEnvironmentLayout = (
  gridSize: number,
  environmentType: "topLevel" | "basement" | "mixed"
): EnvironmentTile[] => {
  const tiles: EnvironmentTile[] = []

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let type: "floor" | "wall" | "hazard" = "floor"
      let level: "top" | "basement" = "top"

      // Determine level based on environment type
      if (environmentType === "basement") {
        level = "basement"
      } else if (environmentType === "mixed") {
        // Divide the grid - top half is top level, bottom half is basement
        level = y < gridSize / 2 ? "top" : "basement"
      }

      // Add some structure based on level
      if (level === "basement") {
        // Basement has tighter passages and hazards
        if ((x + y) % 8 === 0 && Math.random() < 0.3) {
          type = "hazard" // Dark hazardous areas
        }
        if (x % 9 === 0 || y % 9 === 0) {
          if (Math.random() < 0.4) {
            type = "wall" // Narrow passages
          }
        }
      } else {
        // Top level has open spaces
        if (x % 15 === 0 || y % 15 === 0) {
          if (Math.random() < 0.15) {
            type = "wall"
          }
        }
      }

      tiles.push({
        x,
        y,
        type,
        level,
        isActive: true,
      })
    }
  }

  return tiles
}

export function GameEnvironment({
  gridSize,
  cellSize,
  environmentType,
  boosts,
  activateBoost,
}: GameEnvironmentProps) {
  const tiles = useMemo(
    () => generateEnvironmentLayout(gridSize, environmentType),
    [gridSize, environmentType]
  )

  const boostMap = useMemo(() => {
    const map = new Set<string>()
    boosts.forEach((b) => map.add(`${b.x},${b.y}`))
    return map
  }, [boosts])

  const getBoostAtPosition = (x: number, y: number) => {
    return boosts.find((b) => b.x === x && b.y === y)
  }

  const getBackgroundColor = (tile: EnvironmentTile) => {
    if (tile.type === "wall") {
      return tile.level === "basement" ? "#1a1a2e" : "#0a3a4a"
    }
    if (tile.type === "hazard") {
      return "#2a0a1a"
    }
    if (tile.level === "basement") {
      return "rgba(5, 15, 25, 0.8)"
    }
    return "rgba(0, 30, 50, 0.6)"
  }

  const getBorderColor = (tile: EnvironmentTile) => {
    if (tile.level === "basement") {
      return tile.type === "hazard" ? "rgba(255, 50, 50, 0.2)" : "rgba(100, 100, 150, 0.15)"
    }
    return "rgba(0, 200, 255, 0.1)"
  }

  const getGlowEffect = (tile: EnvironmentTile) => {
    if (tile.level === "basement") {
      if (tile.type === "hazard") {
        return "0 0 8px rgba(255, 50, 50, 0.4)"
      }
      return "0 0 4px rgba(100, 100, 150, 0.2)"
    }
    return "0 0 6px rgba(0, 200, 255, 0.2)"
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-cyan-500/20">
      {/* Grid of environment tiles */}
      {tiles.map((tile) => {
        const boost = getBoostAtPosition(tile.x, tile.y)
        const isBoostTile = boostMap.has(`${tile.x},${tile.y}`)

        return (
          <div
            key={`${tile.x}-${tile.y}`}
            style={{
              position: "absolute",
              left: `${(tile.x / gridSize) * 100}%`,
              top: `${(tile.y / gridSize) * 100}%`,
              width: `${(1 / gridSize) * 100}%`,
              height: `${(1 / gridSize) * 100}%`,
              backgroundColor: getBackgroundColor(tile),
              borderWidth: "1px",
              borderColor: getBorderColor(tile),
              boxShadow: getGlowEffect(tile),
              cursor: isBoostTile ? "pointer" : "default",
              transition: "background-color 0.3s",
            }}
            onClick={() => {
              if (isBoostTile && activateBoost) {
                activateBoost(tile.x, tile.y)
              }
            }}
          >
            {/* Boost item rendering */}
            {boost && (
              <div className="absolute inset-0 flex items-center justify-center">
                <BoostPickup type={boost.type} />
              </div>
            )}

            {/* Level transition line */}
            {environmentType === "mixed" && tile.y === Math.floor(gridSize / 2) && tile.x % 3 === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.6), transparent)",
                  boxShadow: "0 0 8px rgba(255,140,0,0.4)",
                }}
              />
            )}
          </div>
        )
      })}

      {/* Grid overlay for visual reference */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.05,
        }}
        width="100%"
        height="100%"
      >
        {/* Vertical lines */}
        {Array.from({ length: Math.ceil(gridSize / 10) }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={`${((i * 10) / gridSize) * 100}%`}
            y1="0"
            x2={`${((i * 10) / gridSize) * 100}%`}
            y2="100%"
            stroke="rgba(0,200,255,0.3)"
            strokeWidth="1"
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: Math.ceil(gridSize / 10) }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={`${((i * 10) / gridSize) * 100}%`}
            x2="100%"
            y2={`${((i * 10) / gridSize) * 100}%`}
            stroke="rgba(0,200,255,0.3)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  )
}

function BoostPickup({ type }: { type: "speed" | "shield" | "slow" }) {
  const styles = {
    speed: {
      color: "rgba(255, 200, 0, 0.9)",
      glow: "0 0 12px rgba(255, 200, 0, 0.8)",
      shape: "⚡",
    },
    shield: {
      color: "rgba(0, 255, 150, 0.9)",
      glow: "0 0 12px rgba(0, 255, 150, 0.8)",
      shape: "🛡️",
    },
    slow: {
      color: "rgba(100, 200, 255, 0.9)",
      glow: "0 0 12px rgba(100, 200, 255, 0.8)",
      shape: "❄️",
    },
  }

  const style = styles[type]

  return (
    <div
      style={{
        fontSize: "1.5rem",
        filter: "drop-shadow(0 0 6px " + style.color + ")",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      {style.shape}
    </div>
  )
}
