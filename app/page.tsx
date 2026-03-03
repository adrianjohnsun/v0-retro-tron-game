"use client"

import { useState } from "react"
import EnhancedTronIntro from "@/components/tron-intro-enhanced"
import TronHome from "@/components/tron-home"
import TronAbout from "@/components/tron-about"
import TronModes from "@/components/tron-modes"
import { TronGame } from "@/components/tron-game"

type AppScreen = "opening" | "home" | "play" | "disc-wars" | "modes" | "about"

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("opening")

  return (
    <main className="relative">
      {screen === "opening" && (
        <EnhancedTronIntro onComplete={() => setScreen("home")} use3D={true} />
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
