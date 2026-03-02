"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Zap, Shield, Trophy } from "lucide-react"

export type GameMode = "3v3" | "5v5"
export type Difficulty = "arcade" | "standard" | "legacy"

export interface GameSettings {
  mode: GameMode
  difficulty: Difficulty
  environment: "topLevel" | "basement" | "mixed"
}

interface LevelSelectProps {
  onStart: (settings: GameSettings) => void
  onCancel: () => void
}

export function LevelSelect({ onStart, onCancel }: LevelSelectProps) {
  const [mode, setMode] = useState<GameMode>("3v3")
  const [difficulty, setDifficulty] = useState<Difficulty>("standard")
  const [environment, setEnvironment] = useState<"topLevel" | "basement" | "mixed">("topLevel")

  const handleStart = () => {
    onStart({ mode, difficulty, environment })
  }

  const difficultyDescriptions = {
    arcade: "AI plays safer, larger pathways, power-ups spawn frequently",
    standard: "Balanced AI, varied terrain, moderate boost frequency",
    legacy: "Aggressive AI, tight corners, rare power-ups, faster game speed",
  }

  const environmentDescriptions = {
    topLevel: "Bright neon arena with smooth pathways and open space",
    basement: "Dark underground tunnels with tight passages and hazards",
    mixed: "Multiple levels - transition between bright and dark areas",
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-gradient-to-b from-slate-950 to-black border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/40 to-orange-900/40 p-6 border-b border-cyan-500/30">
          <h1 className="text-3xl font-bold text-cyan-400 text-center mb-2">LIGHTCYCLE ARENA</h1>
          <p className="text-center text-cyan-300/80 text-sm">Select your game parameters</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Game Mode Selection */}
          <div>
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> GAME MODE
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(["3v3", "5v5"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === m
                      ? "border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-400/30"
                      : "border-cyan-600/30 bg-slate-900/40 hover:border-cyan-500/60"
                  }`}
                >
                  <div className="text-2xl font-bold text-cyan-300">{m}</div>
                  <div className="text-xs text-cyan-300/60 mt-1">
                    {m === "3v3" ? "6 Players" : "10 Players"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" /> DIFFICULTY
            </h2>
            <div className="space-y-3">
              {(["arcade", "standard", "legacy"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    difficulty === d
                      ? "border-orange-400 bg-orange-900/20 shadow-lg shadow-orange-400/30"
                      : "border-orange-600/30 bg-slate-900/40 hover:border-orange-500/60"
                  }`}
                >
                  <div className="font-bold text-orange-300 capitalize">{d}</div>
                  <div className="text-xs text-orange-300/60 mt-1">{difficultyDescriptions[d]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Environment Selection */}
          <div>
            <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" /> ENVIRONMENT
            </h2>
            <div className="space-y-3">
              {(["topLevel", "basement", "mixed"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEnvironment(e)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    environment === e
                      ? "border-purple-400 bg-purple-900/20 shadow-lg shadow-purple-400/30"
                      : "border-purple-600/30 bg-slate-900/40 hover:border-purple-500/60"
                  }`}
                >
                  <div className="font-bold text-purple-300 capitalize">
                    {e === "topLevel" ? "Top Level" : e === "basement" ? "Basement" : "Mixed Levels"}
                  </div>
                  <div className="text-xs text-purple-300/60 mt-1">{environmentDescriptions[e]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 border-t border-cyan-500/30 flex gap-4 justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-cyan-600/50 text-cyan-300 hover:bg-cyan-900/20"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleStart}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold"
          >
            <Trophy className="w-4 h-4 mr-2" /> START GAME
          </Button>
        </div>
      </Card>
    </div>
  )
}
