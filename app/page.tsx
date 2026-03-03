"use client"

import { useState, Suspense, lazy } from "react"

const EnhancedTronIntro = lazy(() => import("@/components/tron-intro-enhanced"))
const TronHome = lazy(() => import("@/components/tron-home"))
const TronAbout = lazy(() => import("@/components/tron-about"))
const TronModes = lazy(() => import("@/components/tron-modes"))
const TronGame = lazy(() => import("@/components/tron-game").then(m => ({ default: m.TronGame })))

type AppScreen = "opening" | "home" | "play" | "disc-wars" | "modes" | "about"

function LoadingScreen() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-cyan-400 font-mono text-lg animate-pulse">TRON</div>
    </div>
  )
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("opening")

  return (
    <main className="relative w-full h-screen">
      <Suspense fallback={<LoadingScreen />}>
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

        {(screen === "play" || screen === "disc-wars") && (
          <TronGame />
        )}
      </Suspense>
    </main>
  )
}
