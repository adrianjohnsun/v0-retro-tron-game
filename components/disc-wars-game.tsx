"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CluFace } from "./clu-face"
import {
  Zap, Shield, Trophy, RotateCcw, SkipForward, Crosshair,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { getDiscStoryForRound, type DialogueLine } from "@/lib/disc-story"

// -- Constants --
const ARENA_ASPECT = 1.2 // width/height ratio
const PLAYER_RADIUS = 14
const DISC_RADIUS = 6
const DISC_SPEED = 6
const PLAYER_SPEED = 3
const AI_SPEED_BASE = 1.8
const AI_SPEED_PER_ROUND = 0.25
const THROW_COOLDOWN = 800
const DISC_LIFETIME = 3000
const MAX_BOUNCES = 3

type Vec2 = { x: number; y: number }

interface Disc {
  pos: Vec2
  vel: Vec2
  owner: "player" | "ai"
  bounces: number
  born: number
  active: boolean
}

interface Combatant {
  pos: Vec2
  hp: number
  maxHp: number
  lastThrow: number
  name: string
  color: string
  shieldActive: boolean
  shieldCooldown: number
  invulnUntil: number
}

// -- Sound utility --
const playSound = (freq: number, type: OscillatorType = "square", duration = 0.1, volume = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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
  } catch {
    // silently fail
  }
}

// -- Arena size hook --
function useArenaSize() {
  const [size, setSize] = useState({ w: 500, h: 420 })

  useEffect(() => {
    function calc() {
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (vw < 480) {
        const w = vw - 24
        const h = Math.min(vh * 0.5, w / ARENA_ASPECT)
        setSize({ w, h })
      } else if (vw < 768) {
        const w = Math.min(vw - 40, 480)
        const h = Math.min(vh * 0.55, w / ARENA_ASPECT)
        setSize({ w, h })
      } else {
        setSize({ w: 560, h: 460 })
      }
    }
    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])

  return size
}

// -- Dialogue Box (reuses pattern from light cycles) --
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
    }, 35)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [currentLineIndex, currentLine.text])

  const handleAdvance = () => {
    if (isTyping) {
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
  const showFace = currentLine.speaker === "CLU" || currentLine.speaker === "TRON" || currentLine.speaker === "RINZLER"
  const faceColor =
    currentLine.speaker === "CLU" ? "#ff8c00" :
    currentLine.speaker === "RINZLER" ? "#ff4444" :
    "#00f2ff"

  const speakerLabel: Record<string, string> = {
    CLU: "CLU_PROTOCOL",
    TRON: "user",
    SYSTEM: "ARENA_SYSTEM",
    RINZLER: "RINZLER_X",
    USER: "USER_COMBATANT",
  }

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
      {showFace && (
        <div className="mb-4 md:mb-6 relative">
          <div className="w-28 h-32 md:w-44 md:h-52">
            <CluFace isSpeaking={isTyping} color={faceColor} />
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

      <h2
        className="text-sm md:text-2xl font-black mb-2 md:mb-4 tracking-tighter tron-glow uppercase"
        style={{ color: speakerColor }}
      >
        {speakerLabel[currentLine.speaker] || currentLine.speaker}
      </h2>

      <div className="max-w-xs md:max-w-md min-h-14 md:min-h-24 mb-4 md:mb-6 px-2">
        <p
          className="text-[10px] md:text-sm leading-relaxed font-mono text-center"
          style={{ color: `${speakerColor}cc` }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">_</span>}
        </p>
      </div>

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

      <div className="flex gap-3 items-center">
        {showContinue && (
          <Button
            onClick={(e) => { e.stopPropagation(); handleAdvance() }}
            className="bg-transparent border border-primary/60 text-primary hover:bg-primary/10 px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-xs tracking-widest animate-pulse"
          >
            {isLastLine ? "ENTER THE ARENA" : "CONTINUE"}
          </Button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleSkipAll() }}
          className="text-[9px] md:text-[10px] text-primary/40 hover:text-primary/70 uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          <SkipForward className="w-3 h-3" />
          Skip
        </button>
      </div>

      <p className="absolute bottom-4 text-[8px] md:text-[9px] text-primary/30 uppercase tracking-widest md:hidden">
        Tap anywhere to continue
      </p>
    </div>
  )
}

// -- Mobile controls --
function ArenaTouchControls({
  onMove,
  onThrow,
  onShield,
  canThrow,
  canShield,
}: {
  onMove: (dir: Vec2) => void
  onThrow: () => void
  onShield: () => void
  canThrow: boolean
  canShield: boolean
}) {
  return (
    <div className="md:hidden fixed bottom-2 inset-x-0 z-50 flex items-end justify-between px-3" style={{ touchAction: "none" }}>
      {/* D-pad */}
      <div className="grid grid-cols-3 grid-rows-3 w-28 h-28 gap-0.5">
        <div />
        <button
          className="flex items-center justify-center bg-primary/10 border border-primary/30 active:bg-primary/30 transition-colors"
          onTouchStart={(e) => { e.preventDefault(); onMove({ x: 0, y: -1 }) }}
          aria-label="Move up"
        >
          <ChevronUp className="w-5 h-5 text-primary" />
        </button>
        <div />
        <button
          className="flex items-center justify-center bg-primary/10 border border-primary/30 active:bg-primary/30 transition-colors"
          onTouchStart={(e) => { e.preventDefault(); onMove({ x: -1, y: 0 }) }}
          aria-label="Move left"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>
        <div />
        <button
          className="flex items-center justify-center bg-primary/10 border border-primary/30 active:bg-primary/30 transition-colors"
          onTouchStart={(e) => { e.preventDefault(); onMove({ x: 1, y: 0 }) }}
          aria-label="Move right"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
        <div />
        <button
          className="flex items-center justify-center bg-primary/10 border border-primary/30 active:bg-primary/30 transition-colors"
          onTouchStart={(e) => { e.preventDefault(); onMove({ x: 0, y: 1 }) }}
          aria-label="Move down"
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </button>
        <div />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 mb-2">
        <button
          onTouchStart={(e) => { e.preventDefault(); onShield() }}
          disabled={!canShield}
          className={`w-14 h-14 flex items-center justify-center border transition-colors ${
            canShield
              ? "bg-primary/10 border-primary/50 active:bg-primary/30 text-primary"
              : "bg-primary/5 border-primary/10 text-primary/20"
          }`}
          aria-label="Shield"
        >
          <Shield className="w-6 h-6" />
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); onThrow() }}
          disabled={!canThrow}
          className={`w-14 h-14 flex items-center justify-center border transition-colors ${
            canThrow
              ? "bg-secondary/10 border-secondary/50 active:bg-secondary/30 text-secondary"
              : "bg-secondary/5 border-secondary/10 text-secondary/20"
          }`}
          aria-label="Throw disc"
        >
          <Crosshair className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

// -- HP bar --
function HPBar({ hp, maxHp, color, label, side }: { hp: number; maxHp: number; color: string; label: string; side: "left" | "right" }) {
  const pct = Math.max(0, hp / maxHp) * 100
  return (
    <div className={`flex flex-col gap-1 ${side === "right" ? "items-end" : "items-start"}`}>
      <span className="text-[8px] md:text-[10px] tracking-widest uppercase font-bold" style={{ color }}>{label}</span>
      <div className="w-24 md:w-36 h-2 md:h-3 border bg-black/60 relative overflow-hidden" style={{ borderColor: `${color}66` }}>
        <div
          className="absolute inset-y-0 transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
            [side === "right" ? "right" : "left"]: 0,
          }}
        />
      </div>
      <span className="text-[7px] md:text-[9px] font-mono" style={{ color: `${color}88` }}>{hp}/{maxHp}</span>
    </div>
  )
}

// -- Main component --
export function DiscWarsGame() {
  const arena = useArenaSize()
  const [gameState, setGameState] = useState<"START" | "DIALOGUE" | "PLAYING" | "RESULT">("START")
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([])
  const [dialogueCallback, setDialogueCallback] = useState<(() => void) | null>(null)
  const [round, setRound] = useState(1)
  const [winner, setWinner] = useState<"player" | "ai" | null>(null)
  const [totalWins, setTotalWins] = useState(0)
  const [totalLosses, setTotalLosses] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)

  // Game state refs for animation loop
  const playerRef = useRef<Combatant>({
    pos: { x: 80, y: 210 },
    hp: 5,
    maxHp: 5,
    lastThrow: 0,
    name: "USER",
    color: "#00f2ff",
    shieldActive: false,
    shieldCooldown: 0,
    invulnUntil: 0,
  })
  const aiRef = useRef<Combatant>({
    pos: { x: 420, y: 210 },
    hp: 5,
    maxHp: 5,
    lastThrow: 0,
    name: "PROGRAM",
    color: "#ff8c00",
    shieldActive: false,
    shieldCooldown: 0,
    invulnUntil: 0,
  })
  const discsRef = useRef<Disc[]>([])
  const keysRef = useRef<Set<string>>(new Set())
  const mobileDirRef = useRef<Vec2>({ x: 0, y: 0 })
  const mobileMovingRef = useRef(false)
  const aimRef = useRef<Vec2>({ x: 1, y: 0 })
  const frameRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameOverHandledRef = useRef(false)

  // State mirrors for React renders
  const [playerHP, setPlayerHP] = useState(5)
  const [aiHP, setAiHP] = useState(5)
  const [canThrow, setCanThrow] = useState(true)
  const [canShield, setCanShield] = useState(true)

  const speakerColors: Record<string, string> = useMemo(() => ({
    CLU: "#ff8c00",
    TRON: "#00f2ff",
    SYSTEM: "#00f2ff",
    RINZLER: "#ff4444",
    USER: "#00ff88",
  }), [])

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

  const initRound = useCallback((nextRound = 1) => {
    setWinner(null)
    setRound(nextRound)
    gameOverHandledRef.current = false

    const story = getDiscStoryForRound(nextRound)
    showDialogue(story.preRound, () => startCombat(nextRound))
  }, [showDialogue])

  const startCombat = useCallback((currentRound: number) => {
    playSound(440, "square", 0.1)
    setTimeout(() => playSound(880, "square", 0.1), 100)

    const aiHp = 3 + currentRound
    const playerHp = 5 + Math.floor(currentRound / 3)

    playerRef.current = {
      pos: { x: arena.w * 0.2, y: arena.h / 2 },
      hp: playerHp,
      maxHp: playerHp,
      lastThrow: 0,
      name: "USER",
      color: "#00f2ff",
      shieldActive: false,
      shieldCooldown: 0,
      invulnUntil: 0,
    }
    aiRef.current = {
      pos: { x: arena.w * 0.8, y: arena.h / 2 },
      hp: aiHp,
      maxHp: aiHp,
      lastThrow: 0,
      name: currentRound === 3 ? "RINZLER" : currentRound === 5 ? "CLU" : "PROGRAM",
      color: currentRound === 3 ? "#ff4444" : "#ff8c00",
      shieldActive: false,
      shieldCooldown: 0,
      invulnUntil: 0,
    }
    discsRef.current = []
    setPlayerHP(playerHp)
    setAiHP(aiHp)
    setCanThrow(true)
    setCanShield(true)
    setGameState("PLAYING")
  }, [arena])

  // -- Input handling --
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
      if (e.key === " " || e.key === "Enter") e.preventDefault()
    }
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  // Mouse aim tracking
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const p = playerRef.current.pos
      const dx = mx - p.x
      const dy = my - p.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 0) {
        aimRef.current = { x: dx / len, y: dy / len }
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    return () => canvas.removeEventListener("mousemove", handleMouseMove)
  }, [gameState])

  const throwDisc = useCallback((owner: "player" | "ai") => {
    const now = Date.now()
    const combatant = owner === "player" ? playerRef.current : aiRef.current
    if (now - combatant.lastThrow < THROW_COOLDOWN) return

    combatant.lastThrow = now

    let vel: Vec2
    if (owner === "player") {
      vel = { x: aimRef.current.x * DISC_SPEED, y: aimRef.current.y * DISC_SPEED }
      playSound(600, "triangle", 0.08, 0.12)
    } else {
      const target = playerRef.current.pos
      const dx = target.x - combatant.pos.x
      const dy = target.y - combatant.pos.y
      const len = Math.sqrt(dx * dx + dy * dy)
      // Add some randomness based on round
      const accuracy = Math.max(0.7, 1 - (1 / (round + 2)))
      const spread = (1 - accuracy) * 2
      vel = {
        x: ((dx / len) + (Math.random() - 0.5) * spread) * DISC_SPEED,
        y: ((dy / len) + (Math.random() - 0.5) * spread) * DISC_SPEED,
      }
      playSound(400, "sawtooth", 0.08, 0.08)
    }

    discsRef.current.push({
      pos: { x: combatant.pos.x, y: combatant.pos.y },
      vel,
      owner,
      bounces: 0,
      born: now,
      active: true,
    })
  }, [round])

  const activateShield = useCallback(() => {
    const now = Date.now()
    const p = playerRef.current
    if (now < p.shieldCooldown) return
    p.shieldActive = true
    p.shieldCooldown = now + 2500
    playSound(800, "sine", 0.15, 0.1)
    setTimeout(() => {
      p.shieldActive = false
    }, 600)
  }, [])

  // Mobile controls handlers
  const handleMobileMove = useCallback((dir: Vec2) => {
    mobileDirRef.current = dir
    mobileMovingRef.current = true
    // Auto-release after a short time
    setTimeout(() => {
      mobileMovingRef.current = false
    }, 200)
  }, [])

  const handleMobileThrow = useCallback(() => {
    // Aim toward AI
    const p = playerRef.current.pos
    const a = aiRef.current.pos
    const dx = a.x - p.x
    const dy = a.y - p.y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > 0) {
      aimRef.current = { x: dx / len, y: dy / len }
    }
    throwDisc("player")
  }, [throwDisc])

  // -- Game loop --
  useEffect(() => {
    if (gameState !== "PLAYING") return

    const loop = () => {
      const now = Date.now()
      const keys = keysRef.current
      const player = playerRef.current
      const ai = aiRef.current

      // Player movement
      let dx = 0, dy = 0
      if (keys.has("w") || keys.has("arrowup")) dy -= 1
      if (keys.has("s") || keys.has("arrowdown")) dy += 1
      if (keys.has("a") || keys.has("arrowleft")) dx -= 1
      if (keys.has("d") || keys.has("arrowright")) dx += 1

      // Mobile d-pad
      if (mobileMovingRef.current) {
        dx += mobileDirRef.current.x
        dy += mobileDirRef.current.y
      }

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy)
        player.pos.x = Math.max(PLAYER_RADIUS, Math.min(arena.w - PLAYER_RADIUS, player.pos.x + (dx / len) * PLAYER_SPEED))
        player.pos.y = Math.max(PLAYER_RADIUS, Math.min(arena.h - PLAYER_RADIUS, player.pos.y + (dy / len) * PLAYER_SPEED))
      }

      // Throw on space/click
      if (keys.has(" ") || keys.has("f")) {
        throwDisc("player")
      }

      // Shield on shift/e
      if (keys.has("shift") || keys.has("e")) {
        activateShield()
      }

      // Update canThrow / canShield for UI
      setCanThrow(now - player.lastThrow >= THROW_COOLDOWN)
      setCanShield(now >= player.shieldCooldown)

      // AI movement - chase/evade pattern
      const aiSpeed = AI_SPEED_BASE + round * AI_SPEED_PER_ROUND
      const toPlayer = {
        x: player.pos.x - ai.pos.x,
        y: player.pos.y - ai.pos.y,
      }
      const distToPlayer = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y)

      // Evade discs
      let evadeX = 0, evadeY = 0
      for (const disc of discsRef.current) {
        if (!disc.active || disc.owner !== "player") continue
        const distToDisc = Math.sqrt((disc.pos.x - ai.pos.x) ** 2 + (disc.pos.y - ai.pos.y) ** 2)
        if (distToDisc < 80) {
          evadeX -= (disc.pos.x - ai.pos.x) / distToDisc * 3
          evadeY -= (disc.pos.y - ai.pos.y) / distToDisc * 3
        }
      }

      // Mix chasing and evading
      let aiDx = 0, aiDy = 0
      if (distToPlayer > 150) {
        aiDx = (toPlayer.x / distToPlayer) + evadeX
        aiDy = (toPlayer.y / distToPlayer) + evadeY
      } else if (distToPlayer < 80) {
        aiDx = -(toPlayer.x / distToPlayer) + evadeX
        aiDy = -(toPlayer.y / distToPlayer) + evadeY
      } else {
        // Strafe
        aiDx = -(toPlayer.y / distToPlayer) * (Math.sin(now * 0.002) > 0 ? 1 : -1) + evadeX
        aiDy = (toPlayer.x / distToPlayer) * (Math.sin(now * 0.002) > 0 ? 1 : -1) + evadeY
      }

      const aiLen = Math.sqrt(aiDx * aiDx + aiDy * aiDy)
      if (aiLen > 0) {
        ai.pos.x = Math.max(PLAYER_RADIUS, Math.min(arena.w - PLAYER_RADIUS, ai.pos.x + (aiDx / aiLen) * aiSpeed))
        ai.pos.y = Math.max(PLAYER_RADIUS, Math.min(arena.h - PLAYER_RADIUS, ai.pos.y + (aiDy / aiLen) * aiSpeed))
      }

      // AI throw
      const throwChance = 0.015 + round * 0.005
      if (now - ai.lastThrow > THROW_COOLDOWN && Math.random() < throwChance) {
        throwDisc("ai")
      }

      // AI shield
      for (const disc of discsRef.current) {
        if (!disc.active || disc.owner !== "player") continue
        const distToAi = Math.sqrt((disc.pos.x - ai.pos.x) ** 2 + (disc.pos.y - ai.pos.y) ** 2)
        if (distToAi < 50 && now >= ai.shieldCooldown && Math.random() < 0.3 + round * 0.05) {
          ai.shieldActive = true
          ai.shieldCooldown = now + 2500
          setTimeout(() => { ai.shieldActive = false }, 600)
        }
      }

      // Update discs
      for (const disc of discsRef.current) {
        if (!disc.active) continue
        if (now - disc.born > DISC_LIFETIME) {
          disc.active = false
          continue
        }

        disc.pos.x += disc.vel.x
        disc.pos.y += disc.vel.y

        // Bounce off walls
        if (disc.pos.x <= DISC_RADIUS || disc.pos.x >= arena.w - DISC_RADIUS) {
          disc.vel.x *= -1
          disc.bounces++
          disc.pos.x = Math.max(DISC_RADIUS, Math.min(arena.w - DISC_RADIUS, disc.pos.x))
          playSound(300, "square", 0.05, 0.05)
        }
        if (disc.pos.y <= DISC_RADIUS || disc.pos.y >= arena.h - DISC_RADIUS) {
          disc.vel.y *= -1
          disc.bounces++
          disc.pos.y = Math.max(DISC_RADIUS, Math.min(arena.h - DISC_RADIUS, disc.pos.y))
          playSound(300, "square", 0.05, 0.05)
        }

        if (disc.bounces > MAX_BOUNCES) {
          disc.active = false
          continue
        }

        // Hit detection
        const target = disc.owner === "player" ? ai : player
        const hitDist = Math.sqrt((disc.pos.x - target.pos.x) ** 2 + (disc.pos.y - target.pos.y) ** 2)

        if (hitDist < PLAYER_RADIUS + DISC_RADIUS) {
          if (target.shieldActive) {
            // Reflect
            disc.vel.x *= -1.2
            disc.vel.y *= -1.2
            disc.owner = disc.owner === "player" ? "ai" : "player"
            playSound(1000, "sine", 0.1, 0.15)
          } else if (now > target.invulnUntil) {
            target.hp--
            target.invulnUntil = now + 500
            disc.active = false
            playSound(150, "sawtooth", 0.2, 0.2)

            if (disc.owner === "player") {
              setAiHP(target.hp)
            } else {
              setPlayerHP(target.hp)
            }
          }
        }
      }

      // Remove dead discs
      discsRef.current = discsRef.current.filter(d => d.active)

      // Check game over
      if ((player.hp <= 0 || ai.hp <= 0) && !gameOverHandledRef.current) {
        gameOverHandledRef.current = true
        const result: "player" | "ai" = ai.hp <= 0 ? "player" : "ai"
        handleGameOver(result)
        return
      }

      // Draw
      draw()

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState, arena, round, throwDisc, activateShield])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const player = playerRef.current
    const ai = aiRef.current

    ctx.clearRect(0, 0, arena.w, arena.h)

    // Arena floor grid
    ctx.strokeStyle = "rgba(0, 242, 255, 0.08)"
    ctx.lineWidth = 0.5
    const gridStep = 30
    for (let x = 0; x < arena.w; x += gridStep) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, arena.h)
      ctx.stroke()
    }
    for (let y = 0; y < arena.h; y += gridStep) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(arena.w, y)
      ctx.stroke()
    }

    // Center line
    ctx.strokeStyle = "rgba(0, 242, 255, 0.15)"
    ctx.setLineDash([4, 8])
    ctx.beginPath()
    ctx.moveTo(arena.w / 2, 0)
    ctx.lineTo(arena.w / 2, arena.h)
    ctx.stroke()
    ctx.setLineDash([])

    // Center hex
    const cx = arena.w / 2, cy = arena.h / 2, hexR = 25
    ctx.strokeStyle = "rgba(0, 242, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      const hx = cx + hexR * Math.cos(angle)
      const hy = cy + hexR * Math.sin(angle)
      if (i === 0) ctx.moveTo(hx, hy)
      else ctx.lineTo(hx, hy)
    }
    ctx.closePath()
    ctx.stroke()

    // Draw combatants
    const drawCombatant = (c: Combatant) => {
      const now = Date.now()
      const isHit = now < c.invulnUntil

      // Shield
      if (c.shieldActive) {
        ctx.beginPath()
        ctx.arc(c.pos.x, c.pos.y, PLAYER_RADIUS + 8, 0, Math.PI * 2)
        ctx.strokeStyle = `${c.color}88`
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.fillStyle = `${c.color}11`
        ctx.fill()
      }

      // Body glow
      ctx.beginPath()
      ctx.arc(c.pos.x, c.pos.y, PLAYER_RADIUS + 4, 0, Math.PI * 2)
      ctx.fillStyle = `${c.color}${isHit ? "08" : "15"}`
      ctx.fill()

      // Body
      ctx.beginPath()
      ctx.arc(c.pos.x, c.pos.y, PLAYER_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = isHit && Math.floor(now / 80) % 2 === 0 ? "transparent" : `${c.color}33`
      ctx.fill()
      ctx.strokeStyle = c.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Inner ring
      ctx.beginPath()
      ctx.arc(c.pos.x, c.pos.y, PLAYER_RADIUS * 0.5, 0, Math.PI * 2)
      ctx.strokeStyle = `${c.color}66`
      ctx.lineWidth = 1
      ctx.stroke()

      // Identity disc on back
      ctx.beginPath()
      ctx.arc(c.pos.x, c.pos.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = c.color
      ctx.fill()

      // Name label
      ctx.fillStyle = `${c.color}aa`
      ctx.font = "7px monospace"
      ctx.textAlign = "center"
      ctx.fillText(c.name, c.pos.x, c.pos.y - PLAYER_RADIUS - 6)
    }

    drawCombatant(player)
    drawCombatant(ai)

    // Draw aim line for player
    if (gameState === "PLAYING") {
      ctx.strokeStyle = "rgba(0, 242, 255, 0.2)"
      ctx.lineWidth = 1
      ctx.setLineDash([3, 6])
      ctx.beginPath()
      ctx.moveTo(player.pos.x, player.pos.y)
      ctx.lineTo(
        player.pos.x + aimRef.current.x * 60,
        player.pos.y + aimRef.current.y * 60
      )
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw discs
    for (const disc of discsRef.current) {
      if (!disc.active) continue
      const color = disc.owner === "player" ? "#00f2ff" : "#ff8c00"

      // Trail
      ctx.beginPath()
      ctx.arc(disc.pos.x, disc.pos.y, DISC_RADIUS + 3, 0, Math.PI * 2)
      ctx.fillStyle = `${color}22`
      ctx.fill()

      // Disc
      ctx.beginPath()
      ctx.arc(disc.pos.x, disc.pos.y, DISC_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = `${color}dd`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Inner ring
      ctx.beginPath()
      ctx.arc(disc.pos.x, disc.pos.y, DISC_RADIUS * 0.4, 0, Math.PI * 2)
      ctx.strokeStyle = `${color}88`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [arena, gameState])

  const handleGameOver = useCallback((result: "player" | "ai") => {
    setWinner(result)
    triggerGlitch()
    playSound(100, "sawtooth", 0.8, 0.3)

    const story = getDiscStoryForRound(round)
    const resultLines = result === "player" ? story.onPlayerWin : story.onPlayerLose

    if (result === "player") {
      setTotalWins(prev => prev + 1)
    } else {
      setTotalLosses(prev => prev + 1)
    }

    setTimeout(() => {
      showDialogue(resultLines, () => {
        setGameState("RESULT")
      })
    }, 600)
  }, [round, showDialogue])

  // Click to throw on desktop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameState !== "PLAYING") return
    const handler = (e: MouseEvent) => {
      e.preventDefault()
      throwDisc("player")
    }
    canvas.addEventListener("click", handler)
    return () => canvas.removeEventListener("click", handler)
  }, [gameState, throwDisc])

  const opponentNames: Record<number, string> = {
    1: "SENTRY",
    2: "GUARD",
    3: "RINZLER",
    4: "SHADOW",
    5: "CLU",
  }

  return (
    <div
      className={`flex flex-col items-center justify-start md:justify-center min-h-screen min-h-[100dvh] bg-black font-retro relative overflow-hidden text-foreground ${isGlitching ? "glitch-flash" : ""}`}
    >
      <div className="crt-overlay" />
      <div className="noise-overlay" />
      <div className="scanline" />

      {/* Header */}
      <div className="flex flex-col items-center z-10 pt-3 md:pt-0 md:mb-3 mb-2">
        <Link href="/" className="absolute top-3 left-3 md:top-6 md:left-6 z-20 flex items-center gap-1.5 text-primary/50 hover:text-primary transition-colors">
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-[7px] md:text-[9px] tracking-widest uppercase">Light Cycles</span>
        </Link>
        <h1 className="text-2xl md:text-5xl font-black italic tracking-tighter text-secondary filter drop-shadow-[0_0_8px_rgba(255,140,0,0.8)]">
          DISC WARS
        </h1>
        <div className="text-[6px] md:text-[8px] tracking-[0.4em] md:tracking-[0.8em] text-secondary/50 mt-0.5 md:mt-1 uppercase">
          Arena Combat Program
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between w-full px-4 md:px-0 mb-2 md:mb-3 z-10" style={{ maxWidth: arena.w }}>
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-secondary" />
          <span className="text-[8px] md:text-[10px] text-secondary/80 tracking-widest">RND {round}</span>
          <div className="w-px h-3 bg-secondary/20" />
          <span className="text-[8px] md:text-[10px] text-secondary/50">{totalWins}W / {totalLosses}L</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-secondary animate-pulse" />
          <span className="text-[7px] md:text-[9px] text-secondary/40 tracking-wider">ARENA ACTIVE</span>
        </div>
      </div>

      {/* HP Bars */}
      {gameState === "PLAYING" && (
        <div className="flex items-start justify-between w-full px-4 md:px-0 mb-2 z-10" style={{ maxWidth: arena.w }}>
          <HPBar hp={playerHP} maxHp={playerRef.current.maxHp} color="#00f2ff" label="USER" side="left" />
          <HPBar hp={aiHP} maxHp={aiRef.current.maxHp} color={aiRef.current.color} label={aiRef.current.name} side="right" />
        </div>
      )}

      {/* Arena */}
      <div className="relative disc-arena-border z-10" style={{ width: arena.w, height: arena.h }}>
        <canvas
          ref={canvasRef}
          width={arena.w}
          height={arena.h}
          className="block"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

        {/* START overlay */}
        {gameState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20 p-4">
            <div className="mb-3 md:mb-5 relative">
              <Crosshair className="w-12 h-12 md:w-20 md:h-20 text-secondary disc-spin" />
            </div>
            <div className="text-center mb-3 md:mb-5">
              <p className="text-secondary text-[8px] md:text-xs mb-1 tracking-wider">WASD/ARROWS: MOVE | SPACE/CLICK: THROW</p>
              <p className="text-secondary/60 text-[7px] md:text-[10px] tracking-wider">E/SHIFT: SHIELD | MOUSE: AIM</p>
              <p className="text-secondary/40 text-[7px] md:text-[10px] tracking-wider mt-1 md:hidden">MOBILE: D-PAD + ACTION BUTTONS</p>
            </div>
            <p className="text-secondary/60 text-[8px] md:text-[10px] mb-4 md:mb-6 text-center max-w-xs leading-relaxed">
              The Games pit program against program in mortal disc combat. Your identity disc is your weapon and your life. Survive the arena.
            </p>
            <Button
              onClick={() => initRound(1)}
              className="bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-black transition-all px-5 py-3 md:px-8 md:py-6 text-xs md:text-xl tracking-widest"
            >
              ENTER THE ARENA
            </Button>
          </div>
        )}

        {/* DIALOGUE overlay */}
        {gameState === "DIALOGUE" && dialogueLines.length > 0 && (
          <DialogueBox
            lines={dialogueLines}
            onComplete={() => { if (dialogueCallback) dialogueCallback() }}
            speakerColors={speakerColors}
          />
        )}

        {/* RESULT overlay */}
        {gameState === "RESULT" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-20 p-4">
            <Trophy className={`w-8 h-8 md:w-14 md:h-14 mb-2 md:mb-4 ${winner === "player" ? "text-primary" : "text-secondary"}`} />
            <h2 className={`text-lg md:text-3xl font-black mb-2 ${winner === "player" ? "text-primary" : "text-secondary"} tron-glow tracking-tighter`}>
              {winner === "player" ? "VICTORIOUS" : "DEREZZED"}
            </h2>
            <p className="text-[8px] md:text-[10px] text-foreground/40 mb-3 md:mb-5 tracking-wider text-center">
              {winner === "player"
                ? `${opponentNames[round] || "PROGRAM"} eliminated. ${round >= 5 ? "The arena is free." : "CLU sends his next gladiator."}`
                : "Your disc has been shattered. The arena demands a rematch."}
            </p>
            <div className="flex gap-2 md:gap-3">
              <Button
                onClick={() => initRound(1)}
                variant="outline"
                className="border-secondary/40 text-secondary/60 hover:text-secondary text-[9px] md:text-sm px-3 py-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                RESTART
              </Button>
              {winner === "player" && (
                <Button
                  onClick={() => initRound(round + 1)}
                  className="bg-secondary text-black hover:bg-secondary/80 px-4 py-2 md:px-6 md:py-3 text-[9px] md:text-sm font-bold tracking-widest"
                >
                  {round >= 5 ? "ENDLESS MODE" : `ROUND ${round + 1}`}
                </Button>
              )}
              {winner !== "player" && (
                <Button
                  onClick={() => initRound(round)}
                  className="bg-secondary text-black hover:bg-secondary/80 px-4 py-2 md:px-6 md:py-3 text-[9px] md:text-sm font-bold tracking-widest"
                >
                  RETRY ROUND {round}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls hint below arena */}
      {gameState === "PLAYING" && (
        <div className="mt-2 md:mt-4 flex gap-4 md:gap-8 z-10">
          <div className="flex items-center gap-1.5">
            <Crosshair className={`w-3 h-3 ${canThrow ? "text-secondary" : "text-secondary/20"}`} />
            <span className={`text-[7px] md:text-[9px] tracking-wider ${canThrow ? "text-secondary/70" : "text-secondary/20"}`}>
              {canThrow ? "DISC READY" : "RECHARGING"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className={`w-3 h-3 ${canShield ? "text-primary" : "text-primary/20"}`} />
            <span className={`text-[7px] md:text-[9px] tracking-wider ${canShield ? "text-primary/70" : "text-primary/20"}`}>
              {canShield ? "SHIELD READY" : "COOLDOWN"}
            </span>
          </div>
        </div>
      )}

      {/* Player labels below arena */}
      <div className="mt-2 md:mt-6 flex gap-6 md:gap-16 z-10">
        <div className="flex flex-col items-center gap-1 p-2 border-b-2 border-primary">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-primary font-black tracking-widest text-[9px] md:text-base">USER</span>
          </div>
          <div className="flex gap-0.5">
            {[...Array(Math.min(totalWins, 5))].map((_, i) => (
              <Shield key={i} className="w-2 h-2 md:w-3 md:h-3 text-primary/60" />
            ))}
            {totalWins === 0 && <span className="text-[7px] text-primary/30 tracking-wider">NO WINS</span>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 border-b-2 border-secondary">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-secondary" />
            <span className="text-secondary font-black tracking-widest text-[9px] md:text-base">{opponentNames[round] || "PROGRAM"}</span>
          </div>
          <span className="text-[7px] md:text-[9px] text-secondary/60 font-bold uppercase tracking-widest">
            {round <= 2 ? "Standard" : round <= 4 ? "Elite" : "Champion"} Class
          </span>
        </div>
      </div>

      {/* Mobile controls */}
      {gameState === "PLAYING" && (
        <ArenaTouchControls
          onMove={handleMobileMove}
          onThrow={handleMobileThrow}
          onShield={activateShield}
          canThrow={canThrow}
          canShield={canShield}
        />
      )}

      {/* Bottom status */}
      <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 items-center gap-3 text-[7px] md:text-[10px] text-secondary/40 uppercase tracking-[0.2em] hidden md:flex">
        <div className="animate-pulse w-1.5 h-1.5 md:w-2 md:h-2 bg-secondary rounded-full" />
        Arena Status: Optimal
      </div>
    </div>
  )
}
