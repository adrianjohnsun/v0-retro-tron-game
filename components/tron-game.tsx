"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useGameLoop } from "@/hooks/use-game-loop"
import { Button } from "@/components/ui/button"
import { Zap, Shield, Trophy } from "lucide-react"
import { CluFace } from "./clu-face"

const GRID_SIZE = 60
const CELL_SIZE = 10
const INITIAL_SPEED = 100
const LEVEL_SPEED_UP = 0.85

type Point = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

interface Player {
  id: number
  color: string
  pos: Point
  dir: Direction
  trail: Point[]
  isAlive: boolean
  name: string
  isAI?: boolean
}

function LightCycle({ color, dir, isAlive }: { color: string; dir: Direction; isAlive: boolean }) {
  const rotation = {
    UP: "-rotate-90",
    DOWN: "rotate-90",
    LEFT: "rotate-180",
    RIGHT: "rotate-0",
  }[dir]

  if (!isAlive) return null

  return (
    <div className={`relative transition-transform duration-100 ${rotation}`}>
      <div
        className="absolute -left-3 -top-2 w-10 h-5 border-[1.5px]"
        style={{
          borderColor: color,
          backgroundColor: "rgba(0,0,0,0.9)",
          boxShadow: `0 0 12px ${color}, inset 0 0 8px ${color}44`,
        }}
      >
        {/* Main Body Glow Strip */}
        <div className="absolute left-1 top-2 w-6 h-[1px] bg-white opacity-40 shadow-[0_0_4px_white]" />

        {/* Cockpit Canopy - more detailed */}
        <div className="absolute right-1 top-0.5 w-4 h-2.5 bg-white/10 border border-white/30 skew-x-[15deg] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
        </div>

        {/* Rear Wheel / Exhaust Housing */}
        <div className="absolute -left-1.5 top-0.5 w-2 h-4 border border-inherit" />

        {/* Front Aero Winglets */}
        <div className="absolute -right-1 top-1 w-2 h-0.5 bg-inherit" />
        <div className="absolute -right-1 bottom-1 w-2 h-0.5 bg-inherit" />
      </div>
    </div>
  )
}

const playSound = (freq: number, type: OscillatorType = "square", duration = 0.1, volume = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  } catch (e) {
    console.log("[v0] Audio failed:", e)
  }
}

export function TronGame() {
  const [gameState, setGameState] = useState<"START" | "INTRO" | "PLAYING" | "GAMEOVER">("START")
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [level, setLevel] = useState(1)
  const lastUpdateRef = useRef<number>(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [isGlitching, setIsGlitching] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.storage.googleapis.com/tron_music-Wv1y8OGJ.mp3",
    ) // Placeholder for Daft Punk style track
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio
    return () => audio.pause()
  }, [])

  const triggerGlitch = () => {
    setIsGlitching(true)
    playSound(60, "sawtooth", 0.2, 0.2) // Bass glitch sound
    setTimeout(() => setIsGlitching(false), 200)
  }

  const initGame = useCallback(
    (nextLevel = 1) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }

      setGameState("INTRO")
      setWinner(null)
      setLevel(nextLevel)
      setSpeed(INITIAL_SPEED * Math.pow(LEVEL_SPEED_UP, nextLevel - 1))
      lastUpdateRef.current = 0

      const fullText =
        nextLevel === 1
          ? "I'm going to create a perfect system. And you, User... you are an imperfection. Greetings, Program."
          : `Sector ${level} reached. Your persistence is irrelevant. The Grid belongs to CLU.`

      startDialogue(fullText)
    },
    [level],
  )

  const startDialogue = (text: string) => {
    setDisplayedText("")
    setIsTyping(true)
    let i = 0
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i))
      i++
      if (i >= text.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 50)
  }

  const startGridMatch = () => {
    playSound(440, "square", 0.1)
    setTimeout(() => playSound(880, "square", 0.1), 100)

    const p1: Player = {
      id: 1,
      name: "USER",
      color: "#00f2ff",
      pos: { x: 10, y: 30 },
      dir: "RIGHT",
      trail: [{ x: 10, y: 30 }],
      isAlive: true,
    }
    const p2: Player = {
      id: 2,
      name: "PROGRAM",
      color: "#ff8c00",
      pos: { x: 50, y: 30 },
      dir: "LEFT",
      trail: [{ x: 50, y: 30 }],
      isAlive: true,
      isAI: true,
    }
    setPlayers([p1, p2])
    setGameState("PLAYING")
  }

  const getAIDirection = (aiPlayer: Player, allPlayers: Player[]): Direction => {
    const dirs: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"]

    const getNextPos = (p: Point, d: Direction): Point => {
      if (d === "UP") return { x: p.x, y: p.y - 1 }
      if (d === "DOWN") return { x: p.x, y: p.y + 1 }
      if (d === "LEFT") return { x: p.x - 1, y: p.y }
      return { x: p.x + 1, y: p.y }
    }

    const isSafe = (pos: Point): boolean => {
      if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) return false
      return !allPlayers.some((p) => p.trail.some((t) => t.x === pos.x && t.y === pos.y))
    }

    const user = allPlayers.find((p) => p.id === 1)!

    const ratedDirs = dirs
      .filter((d) => {
        if (aiPlayer.dir === "UP" && d === "DOWN") return false
        if (aiPlayer.dir === "DOWN" && d === "UP") return false
        if (aiPlayer.dir === "LEFT" && d === "RIGHT") return false
        if (aiPlayer.dir === "RIGHT" && d === "LEFT") return false
        return true
      })
      .map((d) => {
        const next = getNextPos(aiPlayer.pos, d)
        let score = 0
        if (!isSafe(next)) score -= 10000

        const lookAhead = 3 + Math.floor(level * 1.5)
        let tempPos = { ...next }
        let spaceFound = 0

        for (let i = 0; i < lookAhead; i++) {
          tempPos = getNextPos(tempPos, d)
          if (!isSafe(tempPos)) {
            score -= (lookAhead - i) * 200
            break
          }
          spaceFound++
        }

        score += spaceFound * 50

        const distToUser = Math.abs(next.x - user.pos.x) + Math.abs(next.y - user.pos.y)
        if (level > 2) {
          score -= distToUser * (0.5 * level)
        }

        return { dir: d, score }
      })
      .sort((a, b) => b.score - a.score)

    return ratedDirs[0].score < -5000 ? aiPlayer.dir : ratedDirs[0].dir
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setPlayers((prev) => {
      const newPlayers = [...prev]
      let changed = false
      if (e.key === "ArrowUp" && prev[0].dir !== "DOWN") {
        newPlayers[0].dir = "UP"
        changed = true
      }
      if (e.key === "ArrowDown" && prev[0].dir !== "UP") {
        newPlayers[0].dir = "DOWN"
        changed = true
      }
      if (e.key === "ArrowLeft" && prev[0].dir !== "RIGHT") {
        newPlayers[0].dir = "LEFT"
        changed = true
      }
      if (e.key === "ArrowRight" && prev[0].dir !== "LEFT") {
        newPlayers[0].dir = "RIGHT"
        changed = true
      }

      if (changed) playSound(220, "triangle", 0.05, 0.05)
      return newPlayers
    })
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const movePlayer = (player: Player): Player => {
    const newPos = { ...player.pos }
    if (player.dir === "UP") newPos.y -= 1
    if (player.dir === "DOWN") newPos.y += 1
    if (player.dir === "LEFT") newPos.x -= 1
    if (player.dir === "RIGHT") newPos.x += 1

    return {
      ...player,
      pos: newPos,
      trail: [...player.trail, newPos],
    }
  }

  const checkCollision = (p: Player, allPlayers: Player[]): boolean => {
    if (p.pos.x < 0 || p.pos.x >= GRID_SIZE || p.pos.y < 0 || p.pos.y >= GRID_SIZE) {
      return true
    }

    for (const other of allPlayers) {
      const trailToCheck = other.id === p.id ? other.trail.slice(0, -1) : other.trail
      if (trailToCheck.some((t) => t.x === p.pos.x && t.y === p.pos.y)) {
        return true
      }
    }

    return false
  }

  useGameLoop((delta) => {
    lastUpdateRef.current += delta
    if (lastUpdateRef.current < speed) return
    lastUpdateRef.current = 0

    setPlayers((prev) => {
      const updatedWithAI = prev.map((p) => {
        if (p.isAI && p.isAlive) {
          return { ...p, dir: getAIDirection(p, prev) }
        }
        return p
      })

      const movedPlayers = updatedWithAI.map((p) => (p.isAlive ? movePlayer(p) : p))
      const collisionResults = movedPlayers.map((p) => checkCollision(p, movedPlayers))

      const finalPlayers = movedPlayers.map((p, i) => ({
        ...p,
        isAlive: p.isAlive && !collisionResults[i],
      }))

      const aliveCount = finalPlayers.filter((p) => p.isAlive).length
      if (aliveCount <= 1 && gameState === "PLAYING") {
        setGameState("GAMEOVER")
        const winnerPlayer = finalPlayers.find((p) => p.isAlive)
        setWinner(winnerPlayer ? winnerPlayer.id : null)

        triggerGlitch()
        playSound(100, "sawtooth", 0.8, 0.3)
        playSound(50, "square", 1.0, 0.4)
      }

      return finalPlayers
    })
  }, gameState === "PLAYING")

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-black font-retro relative overflow-hidden text-white cursor-none ${isGlitching ? "glitch-flash" : ""}`}
    >
      <div className="crt-overlay" />
      <div className="noise-overlay" />
      <div className="scanline" />

      <div className="absolute top-6 left-6 z-10 hidden md:block">
        <div className="p-4 border border-primary/30 bg-black/40 backdrop-blur-sm space-y-2">
          <div className="text-[8px] text-primary/60 animate-pulse tracking-widest">MCP_TERMINAL_V1.982</div>
          <div className="text-lg font-black text-primary tron-glow tracking-tighter">GRID_STATUS: ACTIVE</div>
          <div className="h-0.5 w-full bg-primary/20" />
          <div className="text-[10px] text-primary/80">SECTOR: 0x{level.toString(16).toUpperCase()}</div>
          <div className="text-[10px] text-primary/80">CYCLES: {players[0]?.trail.length || 0}</div>
        </div>
      </div>

      <div className="mb-6 flex flex-col items-center z-10">
        <h1 className="text-6xl font-black italic tracking-tighter text-primary filter drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">
          TRON
        </h1>
        <div className="text-[8px] tracking-[0.8em] text-primary/50 mt-1 uppercase">Light Cycle Program</div>
      </div>

      <div
        className="relative tron-border rounded-sm overflow-hidden z-10"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 242, 255, 0.4) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(0, 242, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {players.map((player) => (
          <React.Fragment key={player.id}>
            {player.trail.map((p, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: p.x * CELL_SIZE,
                  top: p.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: player.color,
                  boxShadow: `0 0 8px ${player.color}`,
                  opacity: 0.6 + (i / player.trail.length) * 0.4,
                }}
              />
            ))}
            <div
              className="absolute z-10"
              style={{
                left: player.pos.x * CELL_SIZE,
                top: player.pos.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              <LightCycle color={player.color} dir={player.dir} isAlive={player.isAlive} />
            </div>
          </React.Fragment>
        ))}

        {gameState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <p className="text-primary mb-4 text-center">
              PLAYER 1: ARROWS
              <br />
              <span className="text-secondary opacity-80">AI PROGRAM ACTIVE</span>
            </p>
            <Button
              onClick={() => initGame(1)}
              className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all px-8 py-6 text-xl"
            >
              INITIALIZE GRID
            </Button>
          </div>
        )}

        {gameState === "INTRO" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-30 p-8 text-center border-2 border-secondary/20">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-full" />
              <CluFace isSpeaking={isTyping} color="#ff8c00" />
            </div>

            <h2 className="text-secondary text-2xl font-black mb-4 tracking-tighter tron-glow">
              IDENTIFY_SYSTEM_THREAT
            </h2>
            <div className="max-w-md h-24 mb-8">
              <p className="text-secondary/80 text-sm leading-relaxed font-mono">
                {displayedText}
                <span className="animate-pulse">_</span>
              </p>
            </div>
            <Button
              onClick={startGridMatch}
              disabled={isTyping}
              className={`bg-secondary text-black hover:bg-secondary/80 px-10 py-4 font-bold tracking-widest ${!isTyping ? "animate-pulse" : "opacity-50"}`}
            >
              {isTyping ? "PROCESSING..." : "ACKNOWLEDGE_COMMAND"}
            </Button>
          </div>
        )}

        {gameState === "GAMEOVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-20">
            <Trophy className={`w-16 h-16 mb-4 ${winner === 1 ? "text-primary" : "text-secondary"}`} />
            <h2
              className={`text-4xl font-black mb-6 ${winner === 1 ? "text-primary" : "text-secondary"} tron-glow tracking-tighter`}
            >
              {winner === 1 ? "USER_VICTORY" : "PROGRAM_WINS"}
            </h2>
            <div className="flex gap-4">
              <Button
                onClick={() => initGame(1)}
                variant="outline"
                className="border-primary/40 text-primary/60 hover:text-primary"
              >
                RESET GRID
              </Button>
              {winner === 1 && (
                <Button
                  onClick={() => initGame(level + 1)}
                  className="bg-primary text-black hover:bg-primary/80 px-8 py-6 text-xl font-bold"
                >
                  NEXT SECTOR
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex gap-16">
        <div
          className={`flex flex-col items-center gap-3 p-4 border-b-4 transition-all ${players[0]?.isAlive ? "border-primary opacity-100" : "border-white/10 opacity-30"}`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-black tracking-widest text-lg">USER_01</span>
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Shield key={i} className="w-3 h-3 text-primary/50" />
            ))}
          </div>
        </div>

        <div
          className={`flex flex-col items-center gap-3 p-4 border-b-4 transition-all ${players[1]?.isAlive ? "border-secondary opacity-100" : "border-white/10 opacity-30"}`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-secondary font-black tracking-widest text-lg">CLU_AI</span>
          </div>
          <div className="flex gap-1 text-[10px] text-secondary font-bold uppercase tracking-widest">
            Level {level} Aggression
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-3 text-[10px] text-primary/40 uppercase tracking-[0.3em]">
        <div className="animate-pulse w-2 h-2 bg-primary rounded-full" />
        System Status: Optimal | Data Stream: Secure
      </div>
    </div>
  )
}
