"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Volume2, VolumeX, Music } from "lucide-react"
import { getSoundtrack, type TrackName } from "@/lib/soundtrack"

interface MusicControlsProps {
  track: TrackName
  accentColor?: string
  autoPlay?: boolean
}

export function MusicControls({ track, accentColor = "#00f2ff", autoPlay = false }: MusicControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const [showSlider, setShowSlider] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const togglePlay = useCallback(() => {
    const st = getSoundtrack()
    if (st.playing) {
      st.stop()
      setIsPlaying(false)
    } else {
      st.play(track)
      setIsPlaying(true)
    }
    setHasInteracted(true)
  }, [track])

  // Auto-start on first user interaction if autoPlay
  useEffect(() => {
    if (!autoPlay || hasInteracted) return

    const handler = () => {
      const st = getSoundtrack()
      if (!st.playing) {
        st.play(track)
        setIsPlaying(true)
      }
      setHasInteracted(true)
      window.removeEventListener("click", handler)
      window.removeEventListener("keydown", handler)
      window.removeEventListener("touchstart", handler)
    }

    window.addEventListener("click", handler, { once: true })
    window.addEventListener("keydown", handler, { once: true })
    window.addEventListener("touchstart", handler, { once: true })

    return () => {
      window.removeEventListener("click", handler)
      window.removeEventListener("keydown", handler)
      window.removeEventListener("touchstart", handler)
    }
  }, [autoPlay, hasInteracted, track])

  // Switch track when prop changes
  useEffect(() => {
    const st = getSoundtrack()
    if (st.playing && st.track !== track) {
      st.crossfadeTo(track)
    }
  }, [track])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      getSoundtrack().stop()
    }
  }, [])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    getSoundtrack().volume = v
  }

  return (
    <div
      className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-50 flex items-center gap-1.5"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Volume slider - show on hover or mobile tap */}
      {showSlider && isPlaying && (
        <div className="flex items-center gap-1.5 bg-black/80 border px-2 py-1.5 backdrop-blur-sm" style={{ borderColor: `${accentColor}33` }}>
          <VolumeX className="w-2.5 h-2.5 flex-shrink-0" style={{ color: `${accentColor}66` }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 md:w-20 h-1 appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-runnable-track]:rounded-none
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
              [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:mt-[-3px]
              [&::-moz-range-track]:h-[2px] [&::-moz-range-track]:rounded-none
              [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0"
            style={{
              // @ts-expect-error CSS custom properties
              "--tw-slider-track": accentColor,
              // Inline styles for track/thumb colors
              accentColor: accentColor,
            }}
            aria-label="Volume"
          />
          <Volume2 className="w-2.5 h-2.5 flex-shrink-0" style={{ color: `${accentColor}66` }} />
        </div>
      )}

      {/* Play/pause button */}
      <button
        onClick={togglePlay}
        className="group flex items-center gap-1.5 border px-2.5 py-1.5 md:px-3 md:py-2 transition-all hover:scale-105"
        style={{
          borderColor: isPlaying ? `${accentColor}55` : `${accentColor}22`,
          backgroundColor: isPlaying ? `${accentColor}0d` : "rgba(0,0,0,0.6)",
        }}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <>
            {/* Animated bars */}
            <div className="flex items-end gap-[2px] h-3">
              <div
                className="w-[2px] animate-pulse"
                style={{ backgroundColor: accentColor, height: "60%", animationDuration: "0.4s" }}
              />
              <div
                className="w-[2px] animate-pulse"
                style={{ backgroundColor: accentColor, height: "100%", animationDuration: "0.6s" }}
              />
              <div
                className="w-[2px] animate-pulse"
                style={{ backgroundColor: accentColor, height: "40%", animationDuration: "0.5s" }}
              />
              <div
                className="w-[2px] animate-pulse"
                style={{ backgroundColor: accentColor, height: "80%", animationDuration: "0.35s" }}
              />
            </div>
            <span className="text-[7px] md:text-[8px] tracking-[0.15em] uppercase" style={{ color: `${accentColor}88` }}>
              SND:ON
            </span>
          </>
        ) : (
          <>
            <Music className="w-3 h-3" style={{ color: `${accentColor}55` }} />
            <span className="text-[7px] md:text-[8px] tracking-[0.15em] uppercase" style={{ color: `${accentColor}55` }}>
              SND:OFF
            </span>
          </>
        )}
      </button>
    </div>
  )
}
