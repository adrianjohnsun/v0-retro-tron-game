"use client"

import { useState, useRef } from "react"
import TronOpening from "@/components/tron-opening"
import TronLogo from "@/components/tron-logo"
import TronHome from "@/components/tron-home"
import TronAbout from "@/components/tron-about"
import TronModes from "@/components/tron-modes"
import { TronGame } from "@/components/tron-game"

type AppScreen = "opening" | "logo" | "home" | "play" | "disc-wars" | "modes" | "about"

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("opening")
  const audioRef = useRef<HTMLAudioElement>(null)

  return (
    <main className="relative">
      {screen === "opening" && (
        <TronOpening onComplete={() => setScreen("logo")} />
      )}

      {screen === "logo" && (
        <TronLogo onComplete={() => setScreen("home")} audioRef={audioRef} />
      )}

      {screen === "home" && (
        <TronHome
          onNavigate={(page) => {
            if (page === "play") setScreen("play")
            else setScreen(page)
          }}
        />
      )}

      {screen === "about" && (
        <TronAbout onBack={() => setScreen("home")} />
      )}

      {screen === "modes" && (
        <TronModes
          onBack={() => setScreen("home")}
          onSelectMode={(mode) => {
            if (mode === "disc-wars") setScreen("disc-wars")
            else setScreen("play")
          }}
        />
      )}

      {/* Your real game -- Light Cycle mode */}
      {(screen === "play" || screen === "disc-wars") && (
        <TronGame />
      )}
    </main>
  )
}
