"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useGameLoop } from "@/hooks/use-game-loop"
import { Button } from "@/components/ui/button"
import { Zap, Shield, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, SkipForward, Disc } from "lucide-react"
import { CluFace } from "./clu-face"
import Link from "next/link"
import { getStoryForLevel, type DialogueLine } from "@/lib/story"
import { TronIcons } from "./tron-icons"

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

function useGridDimensions() {
  const [dims, setDims] = useState({ gridSize: 60, cellSize: 10 })

  useEffect(() => {
    function calc() {
      const w = window.innerWidth
      const h = window.innerHeight

      if (w < 480) {
        // Small phones
        const size = Math.min(w - 32, h * 0.45)
        const cellSize = Math.max(6, Math.floor(size / 50))
        const gridSize = Math.floor(size / cellSize)
        setDims({ gridSize, cellSize })
      } else if (w < 768) {
        // Tablets / large phones
        const size = Math.min(w - 48, h * 0.5)
        const cellSize = Math.max(7, Math.floor(size / 55))
        const gridSize = Math.floor(size / cellSize)
        setDims({ gridSize, cellSize })
      } else {
        setDims({ gridSize: 60, cellSize: 10 })
      }
    }
    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
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
    <div className={`relative transition-transform duration-100 ${rotation}`}>
      {/* Tron Legacy-style realistic light cycle */}
      <div
        className="absolute -left-3 -top-2 w-10 h-5 border-2"
        style={{
          borderColor: color,
          backgroundColor: "rgba(0,0,0,0.95)",
          boxShadow: `0 0 16px ${color}, 0 0 24px ${color}88, inset 0 0 10px ${color}33`,
          clipPath: "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
        }}
      >
        {/* Front headlight */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-3 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}, 0 0 12px ${color}66`,
          }}
        />
        {/* Windshield/cockpit */}
        <div
          className="absolute left-2 top-1 w-5 h-3 border border-white/20"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            boxShadow: `inset 0 0 4px ${color}44`,
          }}
        />
        {/* Beveled panels */}
        <div className="absolute left-1 top-0.5 h-0.5 w-2 bg-white/20" />
        <div className="absolute right-1.5 top-0.5 h-0.5 w-1.5 bg-white/10" />
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
        {currentLine.speaker === "TRON" && "TRON_LEGACY"}
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

  const ButtonStyles = (dir: Direction) => `
    flex items-center justify-center 
    w-12 h-12 sm:w-14 sm:h-14
    rounded-sm border-2
    transition-all duration-75
    ${pressed === dir 
      ? "bg-primary/40 border-primary shadow-[0_0_12px_rgba(0,242,255,0.8)] scale-95" 
      : "bg-primary/15 border-primary/50 shadow-[0_0_8px_rgba(0,242,255,0.4)]"
    }
    active:bg-primary/40 active:border-primary active:shadow-[0_0_12px_rgba(0,242,255,0.8)]
    hover:border-primary/80
  `

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none" style={{ touchAction: "none" }}>
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-fit">
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

      const isSafe = (pos: Point): boolean => {
        if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) return false
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
        const wp = finalPlayers.find((p) => p.isAlive)
        handleGameOver(wp)
      }

      return finalPlayers
    })
  }, gameState === "PLAYING")

  const pixelWidth = gridSize * cellSize
  const pixelHeight = gridSize * cellSize

  return (
    <div
      className={`flex flex-col items-center justify-start md:justify-center min-h-screen min-h-[100dvh] bg-black font-retro relative overflow-hidden text-foreground ${isGlitching ? "glitch-flash" : ""}`}
    >
      <div className="crt-overlay" />
      <div className="noise-overlay" />
      <div className="scanline" />

      {/* Header */}
      <div className="flex flex-col items-center z-10 pt-3 md:pt-0 md:mb-4 mb-2">
        <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter text-primary filter drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">
          TRON
        </h1>
        <div className="text-[6px] md:text-[8px] tracking-[0.5em] md:tracking-[0.8em] text-primary/50 mt-0.5 md:mt-1 uppercase">
          Light Cycle Program
        </div>
      </div>

      {/* Status bar - mobile compact */}
      <div className="flex items-center justify-between w-full max-w-[600px] px-4 md:px-0 mb-2 md:mb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3">
              <TronIcons.RadarPulse size={12} color="#00f2ff" />
            </div>
            <span className="text-[8px] md:text-[10px] text-primary/80 tracking-widest font-bold">LVL {level}</span>
          </div>
          <div className="w-px h-3 bg-primary/20" />
          <span className="text-[8px] md:text-[10px] text-primary/50 font-mono">
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

      {/* Game grid */}
      <div
        className="relative tron-border rounded-sm overflow-hidden z-10"
        style={{
          width: pixelWidth,
          height: pixelHeight,
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
              <LightCycle color={player.color} dir={player.dir} isAlive={player.isAlive} />
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
