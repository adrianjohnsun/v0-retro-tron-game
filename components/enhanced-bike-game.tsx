"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { LevelSelect, type GameSettings } from "./level-select"
import { GameEnvironment } from "./game-environment"
import { LightCycleBike, type BikeClass, type TeamColor } from "./bike-renderer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { updateBoosts, removeBoostAtPosition, type Boost, type BoostState } from "@/lib/boost-system"
import { RotateCcw, Zap, Shield } from "lucide-react"

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

interface BikePlayer {
  id: number
  name: string
  color: string
  teamColor: TeamColor
  bikeClass: BikeClass
  pos: { x: number; y: number }
  dir: Direction
  trail: Set<string>
  isAlive: boolean
  team: number
  speedMultiplier: number
  hasShield: boolean
  shieldEndTime: number
  score: number
}

interface GameState {
  gameStarted: boolean
  gameOver: boolean
  winner: number | null
  players: BikePlayer[]
  boostState: BoostState
  settings: GameSettings | null
}

export function EnhancedBikeGame() {
  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    gameOver: false,
    winner: null,
    players: [],
    boostState: { boosts: [], activeBoostTimers: {} },
    settings: null,
  })

  const [gridSize, setGridSize] = useState(60)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<Record<string, Direction | null>>({})

  // Initialize keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const player = gameState.players[0]
      if (!player || !gameState.gameStarted) return

      switch (e.key.toUpperCase()) {
        case "ARROWUP":
        case "W":
          if (player.dir !== "DOWN") inputRef.current["0"] = "UP"
          break
        case "ARROWDOWN":
        case "S":
          if (player.dir !== "UP") inputRef.current["0"] = "DOWN"
          break
        case "ARROWLEFT":
        case "A":
          if (player.dir !== "RIGHT") inputRef.current["0"] = "LEFT"
          break
        case "ARROWRIGHT":
        case "D":
          if (player.dir !== "LEFT") inputRef.current["0"] = "RIGHT"
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState.gameStarted, gameState.players])

  const startGame = useCallback((settings: GameSettings) => {
    const playerCount = settings.mode === "3v3" ? 6 : 10
    const teamSize = playerCount / 2

    const teamColors: TeamColor[] = ["cyan", "orange"]
    const bikeClasses: BikeClass[] = ["scout", "fighter", "tank"]
    const players: BikePlayer[] = []

    // Create teams
    for (let i = 0; i < playerCount; i++) {
      const team = i < teamSize ? 0 : 1
      const teamColor = teamColors[team]
      const bikeClass = bikeClasses[i % 3]
      const isAI = i !== 0 // First player is human

      const startX = team === 0 ? 15 : gridSize - 15
      const startY = 30

      players.push({
        id: i,
        name: isAI ? `AI-${teamColor.toUpperCase()}-${i}` : "PLAYER",
        color: teamColor === "cyan" ? "#00f2ff" : "#ff8c00",
        teamColor,
        bikeClass,
        pos: { x: startX, y: startY + (i % teamSize) * 3 },
        dir: team === 0 ? "RIGHT" : "LEFT",
        trail: new Set([`${startX},${startY + (i % teamSize) * 3}`]),
        isAlive: true,
        team,
        speedMultiplier: 1,
        hasShield: false,
        shieldEndTime: 0,
        score: 0,
      })
    }

    setGameState({
      gameStarted: true,
      gameOver: false,
      winner: null,
      players,
      boostState: { boosts: [], activeBoostTimers: {} },
      settings,
    })

    inputRef.current = {}
  }, [])

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    setGameState({
      gameStarted: false,
      gameOver: false,
      winner: null,
      players: [],
      boostState: { boosts: [], activeBoostTimers: {} },
      settings: null,
    })
  }, [])

  // Game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return

    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev.settings) return prev

        let players = prev.players.map((p) => ({ ...p }))
        let boostState = prev.boostState

        // Update boosts
        boostState = updateBoosts(boostState, gridSize, prev.settings.difficulty)

        // Move each player
        players.forEach((player) => {
          if (!player.isAlive) return

          // AI movement
          if (player.id !== 0) {
            const rand = Math.random()
            if (rand < 0.05) {
              const directions: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"]
              const validDirs = directions.filter(
                (d) => (player.dir === "UP" && d !== "DOWN") || (player.dir === "DOWN" && d !== "UP") || (player.dir === "LEFT" && d !== "RIGHT") || (player.dir === "RIGHT" && d !== "LEFT")
              )
              if (validDirs.length > 0) {
                player.dir = validDirs[Math.floor(Math.random() * validDirs.length)]
              }
            }
          } else {
            // Player input
            if (inputRef.current["0"]) {
              player.dir = inputRef.current["0"]
            }
          }

          // Calculate new position with speed multiplier
          const speed = player.speedMultiplier * (1 + 0.2 * Math.random())
          let newPos = { ...player.pos }
          const moveDistance = Math.ceil(speed)

          switch (player.dir) {
            case "UP":
              newPos.y = Math.max(0, newPos.y - moveDistance)
              break
            case "DOWN":
              newPos.y = Math.min(gridSize - 1, newPos.y + moveDistance)
              break
            case "LEFT":
              newPos.x = Math.max(0, newPos.x - moveDistance)
              break
            case "RIGHT":
              newPos.x = Math.min(gridSize - 1, newPos.x + moveDistance)
              break
          }

          // Check collisions with own trail
          const posKey = `${newPos.x},${newPos.y}`
          if (player.trail.has(posKey)) {
            player.isAlive = false
            return
          }

          // Check collisions with other trails
          for (let other of players) {
            if (other.id !== player.id && other.trail.has(posKey)) {
              if (!player.hasShield) {
                player.isAlive = false
                other.score += 10
              } else {
                player.hasShield = false
                player.shieldEndTime = 0
              }
              return
            }
          }

          // Check boost pickup
          const boostType = removeBoostAtPosition(boostState, newPos.x, newPos.y)
          if (boostType) {
            if (boostType === "speed") {
              player.speedMultiplier = 1.8
              setTimeout(() => {
                setGameState((s) => ({
                  ...s,
                  players: s.players.map((p) => (p.id === player.id ? { ...p, speedMultiplier: 1 } : p)),
                }))
              }, 3000)
            } else if (boostType === "shield") {
              player.hasShield = true
              player.shieldEndTime = Date.now() + 4000
            }
            player.score += 5
          }

          player.pos = newPos
          player.trail.add(posKey)
        })

        // Check if only one team remains
        const aliveTeams = new Set(players.filter((p) => p.isAlive).map((p) => p.team))
        const winner = aliveTeams.size === 1 && aliveTeams.size > 0 ? [...aliveTeams][0] : null

        return {
          ...prev,
          players,
          boostState,
          gameOver: winner !== null,
          winner,
        }
      })
    }, 50)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameState.gameStarted, gameState.gameOver])

  if (!gameState.gameStarted) {
    return (
      <LevelSelect
        onStart={startGame}
        onCancel={() => {
          // Handle cancel
        }}
      />
    )
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">LIGHTCYCLE ARENA</h1>
          <p className="text-sm text-cyan-300/70">
            {gameState.settings?.mode} • {gameState.settings?.difficulty.toUpperCase()} • {gameState.settings?.environment}
          </p>
        </div>
        <Button onClick={resetGame} variant="outline" className="border-cyan-600/50 text-cyan-300">
          <RotateCcw className="w-4 h-4 mr-2" /> NEW GAME
        </Button>
      </div>

      {/* Game area */}
      <div className="flex-1 flex gap-4">
        {/* Main game canvas */}
        <div className="flex-1 bg-gradient-to-br from-slate-950 to-black rounded-lg border-2 border-cyan-500/30 overflow-hidden relative">
          <div style={{ width: "100%", height: "100%" }} className="relative">
            <GameEnvironment
              gridSize={gridSize}
              cellSize={10}
              environmentType={gameState.settings?.environment || "topLevel"}
              boosts={gameState.boostState.boosts}
            />

            {/* Players */}
            {gameState.players.map((player) => (
              <div
                key={player.id}
                style={{
                  position: "absolute",
                  left: `${(player.pos.x / gridSize) * 100}%`,
                  top: `${(player.pos.y / gridSize) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: player.isAlive ? 10 : 0,
                }}
              >
                <LightCycleBike
                  color={player.color}
                  teamColor={player.teamColor}
                  bikeClass={player.bikeClass}
                  isAlive={player.isAlive}
                  direction={player.dir}
                  hasBoost={player.speedMultiplier > 1}
                  healthPercent={player.hasShield ? 100 : 80}
                />
              </div>
            ))}

            {/* Game over overlay */}
            {gameState.gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                <Card className="bg-gradient-to-b from-slate-950 to-black border-2 border-orange-500/50 p-8 text-center">
                  <h2 className="text-3xl font-bold text-orange-400 mb-4">
                    TEAM {gameState.winner === 0 ? "CYAN" : "ORANGE"} WINS!
                  </h2>
                  <div className="text-lg text-orange-300/80 mb-6">
                    {gameState.players
                      .filter((p) => p.team === gameState.winner && p.isAlive)
                      .map((p) => p.name)
                      .join(", ")}
                  </div>
                  <Button onClick={resetGame} className="bg-orange-600 hover:bg-orange-500">
                    PLAY AGAIN
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Stats panel */}
        <div className="w-64 flex flex-col gap-4">
          {/* Team scores */}
          {[0, 1].map((team) => (
            <Card key={team} className="bg-gradient-to-b from-slate-950 to-black border-2 border-cyan-500/30 p-4">
              <h3 className="font-bold text-lg mb-3">
                <span style={{ color: team === 0 ? "#00f2ff" : "#ff8c00" }} className="text-xl mr-2">
                  ●
                </span>
                TEAM {team === 0 ? "CYAN" : "ORANGE"}
              </h3>
              <div className="space-y-2 text-sm">
                {gameState.players
                  .filter((p) => p.team === team)
                  .map((p) => (
                    <div key={p.id} className={`flex justify-between ${p.isAlive ? "text-cyan-300/80" : "text-red-500/50"}`}>
                      <span>{p.name}</span>
                      <span className="font-mono">{p.score}</span>
                    </div>
                  ))}
              </div>
            </Card>
          ))}

          {/* Legend */}
          <Card className="bg-gradient-to-b from-slate-950 to-black border border-cyan-500/20 p-4">
            <h3 className="font-bold text-cyan-400 mb-3">BOOSTS</h3>
            <div className="space-y-2 text-xs">
              <div>⚡ Speed +80%</div>
              <div>🛡️ Shield</div>
              <div>❄️ Slow enemies</div>
            </div>
          </Card>

          {/* Controls */}
          <Card className="bg-gradient-to-b from-slate-950 to-black border border-cyan-500/20 p-4">
            <h3 className="font-bold text-cyan-400 mb-3">CONTROLS</h3>
            <div className="space-y-1 text-xs text-cyan-300/80">
              <div>↑/W Move Up</div>
              <div>↓/S Move Down</div>
              <div>←/A Move Left</div>
              <div>→/D Move Right</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
