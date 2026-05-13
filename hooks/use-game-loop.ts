"use client"

import { useEffect, useRef } from "react"

export function useGameLoop(callback: (delta: number) => void, active: boolean) {
  const requestRef = useRef<number>(null)
  const previousTimeRef = useRef<number>(null)

  const animate = (time: number) => {
    if (previousTimeRef.current !== null && previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      callback(deltaTime)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (active) {
      requestRef.current = requestAnimationFrame(animate)
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [active])
}
