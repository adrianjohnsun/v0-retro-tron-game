"use client"

import { useState, Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamic imports for all components to optimize initial load
const EnhancedTronIntro = dynamic(() => import("@/components/tron-intro-enhanced"), { ssr: false })
const TronHome = dynamic(() => import("@/components/tron-home"), { ssr: false })
const TronAbout = dynamic(() => import("@/components/tron-about"), { ssr: false })
const TronModes = dynamic(() => import("@/components/tron-modes"), { ssr: false })
const TronGame = dynamic(() => import("@/components/tron-game").then(m => ({ default: m.TronGame })), { ssr: false })

type AppScreen = "opening" | "home" | "play" | "disc-wars" | "modes" | "about"

function LoadingFallback() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-cyan-400 font-mono text-sm animate-pulse">Loading...</div>
    </div>
  )
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("opening")

  return (
    <main className="relative">
      {screen === "opening" && (
        <EnhancedTronIntro onComplete={() => setScreen("home")} use3D={true} />
      )}

      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </main>
  )
}
