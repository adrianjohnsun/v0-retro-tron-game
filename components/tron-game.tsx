"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useGameLoop } from "@/hooks/use-game-loop"
import { Button } from "@/components/ui/button"
import { Zap, Shield, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, SkipForward, Disc } from "lucide-react"
import { CluFace } from "./clu-face"
import Link from "next/link"
import { getStoryForLevel, type DialogueLine } from "@/lib/story"
import { TronIcons } from "./tron-icons"

const INITIAL_SPEED = 100  // Normal speed for level 1
const LEVEL_SPEED_UP = 0.85  // Progressive speed increase per level

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

function useGridDimensions() {
  const [dims, setDims] = useState({ gridSize: 60, cellSize: 10 })

  useEffect(() => {
    function calc() {
      const w = window.innerWidth
      const h = window.innerHeight
      const isPortrait = h > w

      if (w < 360) {
        // Very small phones (portrait)
        const size = Math.min(w - 24, h * 0.4)
        const cellSize = Math.max(5, Math.floor(size / 45))
        const gridSize = Math.floor(size / cellSize)
        setDims({ gridSize, cellSize })
      } else if (w < 480) {
        // Small to medium phones
        const size = Math.min(w - 32, h * (isPortrait ? 0.48 : 0.8))
        const cellSize = Math.max(6, Math.floor(size / 50))
        const gridSize = Math.floor(size / cellSize)
        setDims({ gridSize, cellSize })
      } else if (w < 768) {
        // Tablets and large phones
        const size = Math.min(w - 48, h * (isPortrait ? 0.55 : 0.8))
        const cellSize = Math.max(7, Math.floor(size / 55))
        const gridSize = Math.floor(size / cellSize)
        setDims({ gridSize, cellSize })
      } else if (w < 1024) {
        // iPad in portrait
        const size = Math.min(w - 60, h * 0.7)
        const cellSize = Math.max(8, Math.floor(size / 55))
        const gridSize = Math.floor(size / cellSize)
        setDims({ gridSize, cellSize })
      } else {
        // iPad landscape / desktop
        setDims({ gridSize: 60, cellSize: 10 })
      }
    }

    calc()

    const listener = () => calc()
    window.addEventListener("resize", listener)
    window.addEventListener("orientationchange", listener)
    return () => {
      window.removeEventListener("resize", listener)
      window.removeEventListener("orientationchange", listener)
    }
  }, [])

  return dims
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
    <div className={`relative transition-transform duration-100 ${rotation}`} style={{ perspective: "800px" }}>
      {/* Tron Legacy-style light cycle with subtle 3D glossy effect */}
      <div
        className="absolute -left-3 -top-2 w-10 h-5 border-2 relative overflow-hidden"
        style={{
          borderColor: color,
          backgroundColor: "rgba(0,0,0,0.95)",
          boxShadow: `
            0 0 16px ${color}, 
            0 0 24px ${color}88, 
            inset 0 0 10px ${color}33,
            -2px -2px 5px rgba(0,0,0,0.8),
            1px 1px 4px rgba(0,0,0,0.3)
          `,
          clipPath: "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
          transform: "perspective(600px) rotateX(5deg) rotateY(-3deg)",
        }}
      >
        {/* Glossy top surface highlight - subtle shine */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 40%, transparent 80%)",
            pointerEvents: "none",
          }}
        />

        {/* Front headlight - glossy */}
        <div
          className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2 h-3 rounded-full relative z-10"
          style={{
            backgroundColor: color,
            boxShadow: `
              0 0 8px ${color}, 
              0 0 12px ${color}66,
              inset -1px -1px 2px rgba(0,0,0,0.5),
              inset 1px 1px 2px rgba(255,255,255,0.2)
            `,
          }}
        />

        {/* Windshield/cockpit - glossy panel */}
        <div
          className="absolute left-2 top-1 w-5 h-3 border rounded-sm relative z-5 overflow-hidden"
          style={{
            borderColor: `${color}66`,
            boxShadow: `
              inset 0 0 3px ${color}22,
              inset 1px 1px 2px rgba(255,255,255,0.15),
              inset -1px -1px 2px rgba(0,0,0,0.3)
            `,
            background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.01) 100%)`,
          }}
        />

        {/* Upper beveled panel - glossy ridge */}
        <div
          className="absolute left-1 top-0.5 h-0.5 w-2 rounded-full"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
            boxShadow: "0 0.5px 1px rgba(255,255,255,0.15), inset 0 -0.5px 1px rgba(0,0,0,0.3)",
          }}
        />

        {/* Right side accent - subtle depth */}
        <div
          className="absolute right-1.5 top-0.5 h-0.5 w-1.5 rounded"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)",
            boxShadow: "inset 0 -0.5px 1px rgba(0,0,0,0.3)",
          }}
        />

        {/* Bottom shadow for depth - subtle */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 z-0"
          style={{
            background: `linear-gradient(180deg, transparent, ${color}22)`,
          }}
        />
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
    // silently fail
  }
}

function DialogueBox({
  lines,
  onComplete,
  speakerColors,
}: {
  lines: DialogueLine[]
  onComplete: () => void
  speakerColors: Record<string, string>
}) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showContinue, setShowContinue] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentLine = lines[currentLineIndex]
  const isLastLine = currentLineIndex >= lines.length - 1

  useEffect(() => {
    setDisplayedText("")
    setIsTyping(true)
    setShowContinue(false)
    let i = 0
    const text = currentLine.text

    intervalRef.current = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i))
      i++
      if (i >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsTyping(false)
        setShowContinue(true)
      }
    }, 20)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [currentLineIndex, currentLine.text])

  const handleAdvance = () => {
    if (isTyping) {
      // Skip to end of current line
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplayedText(currentLine.text)
      setIsTyping(false)
      setShowContinue(true)
      return
    }
    if (isLastLine) {
      onComplete()
    } else {
      playSound(330, "triangle", 0.05, 0.05)
      setCurrentLineIndex((prev) => prev + 1)
    }
  }

  const handleSkipAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    onComplete()
  }

  const speakerColor = speakerColors[currentLine.speaker] || "#00f2ff"
  const isClu = currentLine.speaker === "CLU"

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-30 p-4 md:p-8"
      onClick={handleAdvance}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleAdvance()
      }}
    >
      {/* Speaker portrait */}
      {isClu && (
        <div className="mb-4 md:mb-6 relative">
          <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-full" />
          <div className="w-32 h-36 md:w-48 md:h-56">
            <CluFace isSpeaking={isTyping} color="#ff8c00" />
          </div>
        </div>
      )}

      {!isClu && currentLine.speaker === "TRON" && (
        <div className="mb-4 md:mb-6 relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
          <div className="w-32 h-36 md:w-48 md:h-56">
            <CluFace isSpeaking={isTyping} color="#00f2ff" />
          </div>
        </div>
      )}

      {currentLine.speaker === "SYSTEM" && (
        <div className="mb-4 md:mb-6 flex items-center gap-2">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <div className="w-2 h-2 bg-primary/60 animate-pulse" style={{ animationDelay: "0.1s" }} />
          <div className="w-1 h-1 bg-primary/40 animate-pulse" style={{ animationDelay: "0.2s" }} />
        </div>
      )}

      {/* Speaker name */}
      <h2
        className="text-base md:text-2xl font-black mb-2 md:mb-4 tracking-tighter tron-glow uppercase"
        style={{ color: speakerColor }}
      >
        {currentLine.speaker === "CLU" && "CLU_PROTOCOL"}
        {currentLine.speaker === "TRON" && "user"}
        {currentLine.speaker === "SYSTEM" && "GRID_SYSTEM"}
        {currentLine.speaker === "USER" && "USER_TERMINAL"}
      </h2>

      {/* Dialogue text */}
      <div className="max-w-sm md:max-w-md min-h-16 md:min-h-24 mb-4 md:mb-6 px-2">
        <p
          className="text-xs md:text-sm leading-relaxed font-mono text-center"
          style={{ color: `${speakerColor}cc` }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">_</span>}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4 md:mb-6">
        {lines.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 md:w-2 md:h-2 transition-all duration-300"
            style={{
              backgroundColor: i <= currentLineIndex ? speakerColor : `${speakerColor}33`,
              boxShadow: i === currentLineIndex ? `0 0 6px ${speakerColor}` : "none",
            }}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 items-center">
        {showContinue && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleAdvance()
            }}
            className="bg-transparent border border-primary/60 text-primary hover:bg-primary/10 px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs tracking-widest animate-pulse"
          >
            {isLastLine ? "ENTER THE GRID" : "CONTINUE"}
          </Button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSkipAll()
          }}
          className="text-[9px] md:text-[10px] text-primary/40 hover:text-primary/70 uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          <SkipForward className="w-3 h-3" />
          Skip
        </button>
      </div>

      {/* Tap hint for mobile */}
      <p className="absolute bottom-4 text-[8px] md:text-[9px] text-primary/30 uppercase tracking-widest md:hidden">
        Tap anywhere to continue
      </p>
    </div>
  )
}

function TouchControls({ onDirection }: { onDirection: (dir: Direction) => void }) {
  const [pressed, setPressed] = useState<Direction | null>(null)

  const handleTouchStart = (dir: Direction) => {
    onDirection(dir)
    setPressed(dir)
    playSound(220, "triangle", 0.05, 0.05)
  }

  const handleTouchEnd = () => {
    setPressed(null)
  }

  // Responsive button sizing with perfect mobile spacing
  const getButtonSize = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024
    if (w < 360) return "w-11 h-11"
    if (w < 480) return "w-12 h-12"
    if (w < 640) return "w-13 h-13"
    if (w < 768) return "w-14 h-14"
    return "w-16 h-16"
  }

  const ButtonStyles = (dir: Direction) => `
    flex items-center justify-center 
    ${getButtonSize()}
    rounded-md border-2 font-bold text-xs
    transition-all duration-75 active:duration-100
    ${pressed === dir 
      ? "bg-primary/50 border-primary shadow-[0_0_16px_rgba(0,242,255,1)] scale-90" 
      : "bg-primary/20 border-primary/70 shadow-[0_0_10px_rgba(0,242,255,0.5)] hover:bg-primary/30 hover:border-primary"
    }
    active:bg-primary/50 active:border-primary active:shadow-[0_0_16px_rgba(0,242,255,1)]
  `

  return (
    <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 select-none safe-area-bottom" style={{ touchAction: "none", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
      <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5 w-fit px-2 py-3 rounded-t-lg bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-md border-t border-l border-r border-primary/30">
        {/* Row 1 */}
        <div />
        <button
          className={ButtonStyles("UP")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("UP") }}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart("UP")}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          aria-label="Move up"
        >
          <ChevronUp className="w-6 h-6 text-primary" />
        </button>
        <div />
        {/* Row 2 */}
        <button
          className={ButtonStyles("LEFT")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("LEFT") }}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart("LEFT")}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          aria-label="Move left"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <div className="flex items-center justify-center">
          <div className="w-2 h-2 border border-primary/30 rotate-45" />
        </div>
        <button
          className={ButtonStyles("RIGHT")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("RIGHT") }}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart("RIGHT")}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          aria-label="Move right"
        >
          <ChevronRight className="w-6 h-6 text-primary" />
        </button>
        {/* Row 3 */}
        <div />
        <button
          className={ButtonStyles("DOWN")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("DOWN") }}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart("DOWN")}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          aria-label="Move down"
        >
          <ChevronDown className="w-6 h-6 text-primary" />
        </button>
        <div />
      </div>
    </div>
  )
}

export function TronGame() {
  const { gridSize, cellSize } = useGridDimensions()
  const [gameState, setGameState] = useState<"START" | "DIALOGUE" | "PLAYING" | "RESULT">("START")
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([])
  const [dialogueCallback, setDialogueCallback] = useState<(() => void) | null>(null)
  const [winner, setWinner] = useState<number | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [level, setLevel] = useState(1)
  const lastUpdateRef = useRef<number>(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [isGlitching, setIsGlitching] = useState(false)
  const [totalWins, setTotalWins] = useState(0)
  const [totalLosses, setTotalLosses] = useState(0)
  const [cycleParticles, setCycleParticles] = useState<Array<{ id: string; playerId: number; x: number; y: number; color: string; age: number; life: number }>>([])
  const particleCounterRef = useRef(0)

  const speakerColors: Record<string, string> = useMemo(
    () => ({
      CLU: "#ff8c00",
      TRON: "#00f2ff",
      SYSTEM: "#00f2ff",
      USER: "#00ff88",
    }),
    [],
  )

  const triggerGlitch = () => {
    setIsGlitching(true)
    playSound(60, "sawtooth", 0.2, 0.2)
    setTimeout(() => setIsGlitching(false), 200)
  }

  const showDialogue = useCallback((lines: DialogueLine[], callback: () => void) => {
    setDialogueLines(lines)
    setDialogueCallback(() => callback)
    setGameState("DIALOGUE")
  }, [])

  const initGame = useCallback(
    (nextLevel = 1) => {
      setWinner(null)
      setLevel(nextLevel)
      setSpeed(INITIAL_SPEED * Math.pow(LEVEL_SPEED_UP, nextLevel - 1))
      lastUpdateRef.current = 0

      const story = getStoryForLevel(nextLevel)
      showDialogue(story.preMatch, () => startGridMatch(nextLevel))
    },
    [showDialogue, gridSize],
  )

  const startGridMatch = useCallback(
    (currentLevel: number) => {
      playSound(440, "square", 0.1)
      setTimeout(() => playSound(880, "square", 0.1), 100)

      const p1: Player = {
        id: 1,
        name: "USER",
        color: "#00f2ff",
        pos: { x: Math.floor(gridSize * 0.17), y: Math.floor(gridSize / 2) },
        dir: "RIGHT",
        trail: [{ x: Math.floor(gridSize * 0.17), y: Math.floor(gridSize / 2) }],
        isAlive: true,
      }
      const p2: Player = {
        id: 2,
        name: "PROGRAM",
        color: "#ff8c00",
        pos: { x: Math.floor(gridSize * 0.83), y: Math.floor(gridSize / 2) },
        dir: "LEFT",
        trail: [{ x: Math.floor(gridSize * 0.83), y: Math.floor(gridSize / 2) }],
        isAlive: true,
        isAI: true,
      }
      setPlayers([p1, p2])
      setGameState("PLAYING")
    },
    [gridSize],
  )

  const getAIDirection = useCallback(
    (aiPlayer: Player, allPlayers: Player[]): Direction => {
      const dirs: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"]

      const getNextPos = (p: Point, d: Direction): Point => {
        if (d === "UP") return { x: p.x, y: p.y - 1 }
        if (d === "DOWN") return { x: p.x, y: p.y + 1 }
        if (d === "LEFT") return { x: p.x - 1, y: p.y }
        return { x: p.x + 1, y: p.y }
      }

      // Check if position collides with any trail (own trail or opponent's trail)
      const isSafe = (pos: Point, checkOwnTrail: boolean = true): boolean => {
        if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) return false
        
        // Check opponent trail
        const opponent = allPlayers.find((p) => p.id !== aiPlayer.id)
        if (opponent && opponent.trail.some((t) => t.x === pos.x && t.y === pos.y)) return false
        
        // Check own trail to avoid self-collision
        if (checkOwnTrail && aiPlayer.trail.some((t) => t.x === pos.x && t.y === pos.y)) return false
        
        return true
      }

      const user = allPlayers.find((p) => p.id === 1)!

      const ratedDirs = dirs
        .filter((d) => {
          // Never reverse direction (suicide prevention)
          if (aiPlayer.dir === "UP" && d === "DOWN") return false
          if (aiPlayer.dir === "DOWN" && d === "UP") return false
          if (aiPlayer.dir === "LEFT" && d === "RIGHT") return false
          if (aiPlayer.dir === "RIGHT" && d === "LEFT") return false
          return true
        })
        .map((d) => {
          const next = getNextPos(aiPlayer.pos, d)
          let score = 0
          
          // Immediate death - avoid at all costs
          if (!isSafe(next, true)) {
            score -= 50000
            return { dir: d, score }
          }

          // Deep lookahead - much deeper to avoid trap corridors
          const lookAhead = 5 + Math.floor(level * 2)
          let tempPos = { ...next }
          let safeStepsFound = 0

          for (let i = 0; i < lookAhead; i++) {
            tempPos = getNextPos(tempPos, d)
            if (!isSafe(tempPos, false)) {
              // Penalize based on how soon the wall appears
              score -= (lookAhead - i) * 300
              break
            }
            safeStepsFound++
          }

          // Reward abundant space
          score += safeStepsFound * 80

          // Strategic positioning: hunt the player
          const distToUser = Math.abs(next.x - user.pos.x) + Math.abs(next.y - user.pos.y)
          
          // Only chase aggressively at higher levels
          if (level >= 2) {
            // Prefer moving toward user
            score -= distToUser * (0.3 * level)
          }

          // Minimal randomness - makes AI predictable but smart
          const randomFactor = (Math.random() - 0.5) * (level <= 1 ? 0 : 3)
          score += randomFactor

          return { dir: d, score }
        })
        .sort((a, b) => b.score - a.score)

      // Rarely make a suboptimal choice (only on high levels, and only if safe)
      const randomChance = Math.random()
      const shouldBeRandom = randomChance < (level <= 1 ? 0.02 : level === 2 ? 0.08 : 0.12)

      if (shouldBeRandom && ratedDirs.length > 1) {
        // Only pick from SAFE directions
        const safeDirs = ratedDirs.filter((d) => d.score > -10000)
        if (safeDirs.length > 0) {
          return safeDirs[Math.floor(Math.random() * Math.min(2, safeDirs.length))].dir
        }
      }

      // Default to best scored safe direction
      const bestDir = ratedDirs.find((d) => d.score > -10000)
      return bestDir ? bestDir.dir : aiPlayer.dir
    },
    [gridSize, level],
  )

  const changeDirection = useCallback((newDir: Direction) => {
    setPlayers((prev) => {
      if (!prev[0] || !prev[0].isAlive) return prev
      const currentDir = prev[0].dir
      if (
        (newDir === "UP" && currentDir === "DOWN") ||
        (newDir === "DOWN" && currentDir === "UP") ||
        (newDir === "LEFT" && currentDir === "RIGHT") ||
        (newDir === "RIGHT" && currentDir === "LEFT")
      ) {
        return prev
      }
      const newPlayers = [...prev]
      newPlayers[0] = { ...newPlayers[0], dir: newDir }
      return newPlayers
    })
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const dirMap: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
        W: "UP",
        S: "DOWN",
        A: "LEFT",
        D: "RIGHT",
      }
      const dir = dirMap[e.key]
      if (dir) {
        e.preventDefault()
        changeDirection(dir)
        playSound(220, "triangle", 0.05, 0.05)
      }
    },
    [changeDirection],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Swipe controls for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (gameState !== "PLAYING") return
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (gameState !== "PLAYING" || !touchStartRef.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      const minSwipe = 20

      if (Math.abs(dx) > minSwipe || Math.abs(dy) > minSwipe) {
        if (Math.abs(dx) > Math.abs(dy)) {
          changeDirection(dx > 0 ? "RIGHT" : "LEFT")
        } else {
          changeDirection(dy > 0 ? "DOWN" : "UP")
        }
        touchStartRef.current = { x: touch.clientX, y: touch.clientY }
        playSound(220, "triangle", 0.05, 0.05)
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [gameState, changeDirection])

  const movePlayer = (player: Player): Player => {
    const newPos = { ...player.pos }
    if (player.dir === "UP") newPos.y -= 1
    if (player.dir === "DOWN") newPos.y += 1
    if (player.dir === "LEFT") newPos.x -= 1
    if (player.dir === "RIGHT") newPos.x += 1

    // Light cycle sound effect - subtle tone when moving
    if (player.id === 1) {
      // Player cycle - higher frequency
      playSound(280 + Math.random() * 20, "triangle", 0.02, 0.03)
    } else {
      // CLU cycle - lower frequency
      playSound(200 + Math.random() * 20, "sine", 0.02, 0.02)
    }

    return {
      ...player,
      pos: newPos,
      trail: [...player.trail, newPos],
    }
  }

  const checkCollision = (p: Player, allPlayers: Player[]): boolean => {
    if (p.pos.x < 0 || p.pos.x >= gridSize || p.pos.y < 0 || p.pos.y >= gridSize) {
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

  const handleGameOver = useCallback(
    (winnerPlayer: Player | undefined) => {
      const winnerId = winnerPlayer ? winnerPlayer.id : null
      setWinner(winnerId)
      triggerGlitch()
      playSound(100, "sawtooth", 0.8, 0.3)

      const story = getStoryForLevel(level)
      const resultLines = winnerId === 1 ? story.onPlayerWin : story.onPlayerLose

      if (winnerId === 1) {
        setTotalWins((prev) => prev + 1)
      } else {
        setTotalLosses((prev) => prev + 1)
      }

      // Short delay before showing result dialogue
      setTimeout(() => {
        showDialogue(resultLines, () => {
          setGameState("RESULT")
        })
      }, 600)
    },
    [level, showDialogue],
  )

  useGameLoop((delta) => {
    if (gameState !== "PLAYING") return
    
    try {
      lastUpdateRef.current += delta
      if (lastUpdateRef.current < speed) return
      lastUpdateRef.current = 0

      setPlayers((prev) => {
        try {
          // Safety check for corrupted state
          if (!Array.isArray(prev) || prev.length === 0) {
            return prev
          }

          const updatedWithAI = prev.map((p) => {
            try {
              if (p.isAI && p.isAlive) {
                return { ...p, dir: getAIDirection(p, prev) }
              }
            } catch (e) {
              console.error("[v0] AI error:", e)
            }
            return p
          })

          const movedPlayers = updatedWithAI.map((p) => (p.isAlive ? movePlayer(p) : p))
          const collisionResults = movedPlayers.map((p) => checkCollision(p, movedPlayers))

          const finalPlayers = movedPlayers.map((p, i) => ({
            ...p,
            isAlive: p.isAlive && !collisionResults[i],
          }))

          // Emit particles from alive cycles - optimized for performance on all devices
          setCycleParticles((prev) => {
            try {
              let newParticles = [...prev]
              
              // Update existing particles
              newParticles = newParticles
                .map((p) => ({ ...p, age: p.age + 1 }))
                .filter((p) => p.age < p.life)

              // Adaptive particle limits based on screen size
              const isMobile = typeof window !== "undefined" && window.innerWidth < 768
              const maxParticles = isMobile ? 50 : 80
              const emitChance = isMobile ? 0.5 : 0.6

              if (newParticles.length < maxParticles && Math.random() > emitChance) {
                for (const player of finalPlayers) {
                  if (player.isAlive && newParticles.length < maxParticles) {
                    const newParticle = {
                      id: `${player.id}-${particleCounterRef.current++}`,
                      playerId: player.id,
                      x: player.pos.x,
                      y: player.pos.y,
                      color: player.color,
                      age: 0,
                      life: 5 + Math.random() * 2,
                    }
                    newParticles.push(newParticle)
                  }
                }
              }

              return newParticles.slice(-maxParticles)
            } catch (e) {
              console.error("[v0] Particle error:", e)
              return prev
            }
          })

          const aliveCount = finalPlayers.filter((p) => p.isAlive).length
          if (aliveCount <= 1 && gameState === "PLAYING") {
            const wp = finalPlayers.find((p) => p.isAlive)
            handleGameOver(wp)
          }

          return finalPlayers
        } catch (e) {
          console.error("[v0] Game state error:", e)
          return prev
        }
      })
    } catch (e) {
      console.error("[v0] Game loop error:", e)
    }
  }, [gameState, speed, handleGameOver])

  const pixelWidth = gridSize * cellSize
  const pixelHeight = gridSize * cellSize

  return (
    <div
      className={`flex flex-col items-center justify-start md:justify-center min-h-screen min-h-[100dvh] bg-black font-retro relative overflow-x-hidden overflow-y-auto md:overflow-hidden text-foreground ${isGlitching ? "glitch-flash" : ""}`}
    >
      <div className="crt-overlay" />
      <div className="noise-overlay" />
      <div className="scanline" />

      {/* Header */}
      <div className="flex flex-col items-center z-10 pt-3 sm:pt-4 md:pt-0 md:mb-6 mb-2 sm:mb-3">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tighter text-primary filter drop-shadow-[0_0_12px_rgba(0,242,255,0.9)]">
          TRON
        </h1>
        <div className="text-[6px] sm:text-[7px] md:text-[8px] tracking-[0.5em] sm:tracking-[0.6em] md:tracking-[0.8em] text-primary/60 mt-1 md:mt-2 uppercase font-semibold">
          Light Cycle Program
        </div>
      </div>

      {/* Status bar - mobile optimized spacing */}
      <div className="flex items-center justify-between w-full max-w-[600px] px-3 sm:px-4 md:px-0 mb-2 sm:mb-3 md:mb-6 z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-primary/10 px-2 sm:px-3 py-1.5 rounded-md">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3">
              <TronIcons.RadarPulse size={10} color="#00f2ff" />
            </div>
            <span className="text-[7px] sm:text-[8px] md:text-[10px] text-primary/90 tracking-widest font-bold">LVL {level}</span>
          </div>
          <div className="w-px h-3 bg-primary/15" />
          <span className="text-[7px] sm:text-[8px] md:text-[10px] text-primary/60 font-mono font-semibold">
            {totalWins}W {totalLosses}L
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: "#00f2ff",
              boxShadow: "0 0 6px #00f2ff",
            }}
          />
          <span className="text-[7px] md:text-[9px] text-primary/40 tracking-wider">GRID ACTIVE</span>
        </div>
      </div>

      {/* Game grid - mobile optimized */}
      <div
        className="relative tron-border rounded-md overflow-hidden z-10 shadow-[0_0_20px_rgba(0,242,255,0.4)]"
        style={{
          width: pixelWidth,
          height: pixelHeight,
          maxWidth: "100vw",
        }}
      >
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 242, 255, 0.3) 0.5px, transparent 0.5px), 
              linear-gradient(90deg, rgba(0, 242, 255, 0.3) 0.5px, transparent 0.5px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

        {/* Cycle particles */}
        {cycleParticles.map((particle) => {
          const opacity = 1 - particle.age / particle.life
          const size = cellSize * (0.2 + Math.sin(particle.age * 0.5) * 0.1)
          return (
            <div
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: particle.x * cellSize + (cellSize - size) / 2,
                top: particle.y * cellSize + (cellSize - size) / 2,
                width: size,
                height: size,
                backgroundColor: particle.color,
                boxShadow: `0 0 4px ${particle.color}, 0 0 8px ${particle.color}88`,
                opacity: opacity * 0.7,
                transform: `scale(${1 - opacity * 0.3})`,
              }}
            />
          )
        })}

        {/* Trails and cycles */}
        {players.map((player) => (
          <React.Fragment key={player.id}>
            {player.trail.map((p, i) => {
              const trailProgress = i / player.trail.length
              const opacity = 0.5 + trailProgress * 0.5
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: p.x * cellSize,
                    top: p.y * cellSize,
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: player.color,
                    boxShadow: `
                      0 0 6px ${player.color},
                      0 0 12px ${player.color}99,
                      inset 0 0 4px ${player.color}66
                    `,
                    opacity: opacity,
                    filter: `brightness(${0.8 + trailProgress * 0.2})`,
                  }}
                />
              )
            })}
            <div
              className="absolute z-10"
              style={{
                left: player.pos.x * cellSize,
                top: player.pos.y * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            >
              {/* Glow halo effect */}
              <div
                className="absolute inset-0 animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${player.color}44 0%, ${player.color}11 70%, transparent 100%)`,
                  filter: `blur(2px)`,
                  zIndex: -1,
                }}
              />
              
              {/* Motion streaks for speed effect */}
              {player.isAlive && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(${player.dir === "UP" ? "180deg" : player.dir === "DOWN" ? "0deg" : player.dir === "LEFT" ? "90deg" : "270deg"}, ${player.color}33 0%, transparent 100%)`,
                    opacity: 0.4,
                  }}
                />
              )}

              {/* Core cycle */}
              <LightCycle color={player.color} dir={player.dir} isAlive={player.isAlive} />

              {/* Energy glow around cycle */}
              {player.isAlive && (
                <div
                  className="absolute inset-0"
                  style={{
                    boxShadow: `
                      0 0 8px ${player.color},
                      0 0 16px ${player.color}77,
                      inset 0 0 6px ${player.color}33
                    `,
                    borderRadius: "2px",
                    animation: "pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }}
                />
              )}
            </div>
          </React.Fragment>
        ))}

        {/* START overlay */}
        {gameState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20 p-4">
            <div className="text-center mb-4 md:mb-6">
              <p className="text-primary text-[9px] md:text-xs mb-1 tracking-wider">DESKTOP: ARROW KEYS / WASD</p>
              <p className="text-primary/60 text-[8px] md:text-[10px] tracking-wider">MOBILE: SWIPE OR D-PAD</p>
            </div>
            <p className="text-secondary/70 text-[8px] md:text-[10px] mb-4 md:mb-6 text-center max-w-xs leading-relaxed">
              CLU has taken control of the Grid. You are the last User. Enter the Light Cycle arena and fight to free
              the system.
            </p>
            <Button
              onClick={() => initGame(1)}
              className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all px-6 py-4 md:px-8 md:py-6 text-sm md:text-xl tracking-widest"
            >
              ENTER THE GRID
            </Button>
          </div>
        )}

        {/* DIALOGUE overlay */}
        {gameState === "DIALOGUE" && dialogueLines.length > 0 && (
          <DialogueBox
            lines={dialogueLines}
            onComplete={() => {
              if (dialogueCallback) dialogueCallback()
            }}
            speakerColors={speakerColors}
          />
        )}

        {/* RESULT overlay */}
        {gameState === "RESULT" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-20 p-4">
            <Trophy className={`w-10 h-10 md:w-16 md:h-16 mb-3 md:mb-4 ${winner === 1 ? "text-primary" : "text-secondary"}`} />
            <h2
              className={`text-xl md:text-4xl font-black mb-2 md:mb-3 ${winner === 1 ? "text-primary" : "text-secondary"} tron-glow tracking-tighter`}
            >
              {winner === 1 ? "USER WINS" : "DEREZZED"}
            </h2>
            <p className="text-[8px] md:text-[10px] text-foreground/40 mb-4 md:mb-6 tracking-wider">
              {winner === 1
                ? `Sector ${level} cleared. ${level >= 5 ? "The Grid is free." : "CLU retreats deeper into the Grid."}`
                : "Your light cycle has been destroyed. The Grid endures."}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => initGame(1)}
                variant="outline"
                className="border-primary/40 text-primary/60 hover:text-primary text-[10px] md:text-sm px-3 py-2 md:px-4 md:py-3"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" />
                RESTART
              </Button>
              {winner === 1 && (
                <Button
                  onClick={() => initGame(level + 1)}
                  className="bg-primary text-black hover:bg-primary/80 px-4 py-2 md:px-8 md:py-3 text-[10px] md:text-sm font-bold tracking-widest"
                >
                  {level >= 5 ? "ENDLESS MODE" : `SECTOR ${level + 1}`}
                </Button>
              )}
              {winner !== 1 && (
                <Button
                  onClick={() => initGame(level)}
                  className="bg-secondary text-black hover:bg-secondary/80 px-4 py-2 md:px-8 md:py-3 text-[10px] md:text-sm font-bold tracking-widest"
                >
                  RETRY SECTOR {level}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Player info - compact on mobile */}
      <div className="mt-3 md:mt-8 flex gap-6 md:gap-16 z-10">
        <div
          className={`flex flex-col items-center gap-2 md:gap-3 p-2 md:p-4 border-b-2 md:border-b-4 transition-all ${players[0]?.isAlive !== false ? "border-primary opacity-100" : "border-primary/10 opacity-30"}`}
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-4 h-4 md:w-5 md:h-5">
              <TronIcons.Circuit size={16} color="#00f2ff" />
            </div>
            <span className="text-primary font-black tracking-widest text-[10px] md:text-lg">USER</span>
          </div>
          <div className="flex gap-0.5 md:gap-1">
            {[...Array(Math.min(totalWins, 5))].map((_, i) => (
              <div key={i} className="w-2 h-2 md:w-3 md:h-3">
                <TronIcons.Diamond size={8} color="#00f2ff" />
              </div>
            ))}
            {totalWins === 0 && <span className="text-[7px] md:text-[9px] text-primary/30 tracking-wider">--</span>}
          </div>
        </div>

        <div
          className={`flex flex-col items-center gap-2 md:gap-3 p-2 md:p-4 border-b-2 md:border-b-4 transition-all ${players[1]?.isAlive !== false ? "border-secondary opacity-100" : "border-secondary/10 opacity-30"}`}
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-4 h-4 md:w-5 md:h-5">
              <TronIcons.Hexagon size={16} color="#ff8c00" />
            </div>
            <span className="text-secondary font-black tracking-widest text-[10px] md:text-lg">CLU</span>
          </div>
          <span className="text-[7px] md:text-[10px] text-secondary/60 font-bold uppercase tracking-widest">
            {level <= 2 ? "STD" : level <= 4 ? "AGR" : "MAX"}
          </span>
        </div>
      </div>

      {/* Touch controls for mobile during gameplay */}
      {gameState === "PLAYING" && <TouchControls onDirection={changeDirection} />}

      {/* Navigation to Disc Wars */}
      <Link
        href="/disc-wars"
        className="absolute top-3 right-3 md:top-6 md:right-6 z-20 flex items-center gap-1.5 text-secondary/50 hover:text-secondary transition-colors group"
      >
        <span className="text-[7px] md:text-[9px] tracking-widest uppercase">Disc Wars</span>
        <Disc className="w-3 h-3 md:w-4 md:h-4 group-hover:animate-spin" />
      </Link>

      {/* Bottom status - hidden on mobile during gameplay to make room for d-pad */}
      <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 items-center gap-3 text-[7px] md:text-[10px] text-primary/40 uppercase tracking-[0.2em] md:tracking-[0.3em] hidden md:flex">
        <div className="animate-pulse w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full" />
        System Status: Optimal
      </div>
    </div>
  )
}
