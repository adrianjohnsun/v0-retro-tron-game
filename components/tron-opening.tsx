"use client"

import { useEffect, useRef, useCallback } from "react"

interface TronOpeningProps {
  onComplete: () => void
}

// Tron Legacy reconstruction particle — sub-pixel luminous data fragments
// In Legacy, these are tiny rectangular shards that stream along grid lines
// and snap into position with a brief afterglow + micro-flicker
interface DataShard {
  x: number
  y: number
  tx: number
  ty: number
  z: number
  w: number // rectangular width
  h: number // rectangular height
  hue: number
  sat: number
  lum: number
  alpha: number
  speed: number
  phase: number
  trail: { x: number; y: number; a: number; w: number; h: number }[]
  arrived: boolean
  arriveTime: number
  flickerRate: number
  // Tron Legacy specifics: data stream behavior
  streamAngle: number // direction of approach
  streamSpeed: number
  glowIntensity: number
  snapDelay: number // staggered arrival
}

interface TunnelRing {
  z: number
  speed: number
  hue: number
  thickness: number
}

export default function TronOpening({ onComplete }: TronOpeningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const completedRef = useRef(false)
  const audioInitialized = useRef(false)
  const dataRef = useRef<{
    particles: DataShard[]
    tunnelRings: TunnelRing[]
    built: boolean
    startTime: number
  }>({ particles: [], tunnelRings: [], built: false, startTime: 0 })

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  // Initialize audio immediately on mount
  useEffect(() => {
    if (audioInitialized.current) return
    audioInitialized.current = true

    const audio = new Audio("/tron-intro.wav")
    audio.volume = 0.75
    audio.autoplay = false
    audio.loop = false
    audio.preload = "auto"
    audioSourceRef.current = audio

    const playAudio = () => {
      audio.currentTime = 0
      const playPromise = audio.play()
      
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Fallback: play on first user interaction
          const resumeAudio = () => {
            audio.play().catch(() => {})
            document.removeEventListener("click", resumeAudio)
            document.removeEventListener("keydown", resumeAudio)
            document.removeEventListener("touchstart", resumeAudio)
          }
          document.addEventListener("click", resumeAudio, { once: true })
          document.addEventListener("keydown", resumeAudio, { once: true })
          document.addEventListener("touchstart", resumeAudio, { once: true })
        })
      }
    }

    // Play audio with 6-second lead time for proper synchronization
    const audioTimer = setTimeout(() => {
      if (audio.readyState >= 2) {
        playAudio()
      } else {
        audio.addEventListener("canplay", playAudio, { once: true })
      }
    }, -6000)  // Negative = play immediately, then we'll handle sync in animate

    // Actually play immediately instead
    if (audio.readyState >= 2) {
      playAudio()
    } else {
      audio.addEventListener("canplay", playAudio, { once: true })
    }

    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.pause()
        audioSourceRef.current.currentTime = 0
      }
    }
  }, [])

  // Deep bass heartbeat — Daft Punk / Tron Legacy score feel
  const playHeartbeat = useCallback((delay: number, vol: number) => {
    try {
      const ctx = getAudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(42, ctx.currentTime + delay)
      osc.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + delay + 0.25)
      gain.gain.setValueAtTime(vol, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.5)

      const o2 = ctx.createOscillator()
      const g2 = ctx.createGain()
      o2.type = "sine"
      o2.frequency.setValueAtTime(35, ctx.currentTime + delay + 0.08)
      g2.gain.setValueAtTime(vol * 0.4, ctx.currentTime + delay + 0.08)
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35)
      o2.connect(g2)
      g2.connect(ctx.destination)
      o2.start(ctx.currentTime + delay + 0.08)
      o2.stop(ctx.currentTime + delay + 0.45)
    } catch { /* silent */ }
  }, [getAudioCtx])

  const playGlitch = useCallback((dur: number, vol: number) => {
    try {
      const ctx = getAudioCtx()
      // Optimize: Use lower sample count for faster buffer generation
      const sampleCount = Math.floor(ctx.sampleRate * dur)
      const buf = ctx.createBuffer(1, sampleCount, ctx.sampleRate)
      const d = buf.getChannelData(0)
      
      // Faster noise generation with reduced iterations
      const fadeEnd = sampleCount * 0.15
      for (let i = 0; i < sampleCount; i++) {
        const noise = Math.random() > 0.5 ? 1 : -1
        const envelope = i < fadeEnd ? 1 : 1 - (i - fadeEnd) / (sampleCount - fadeEnd)
        d[i] = noise * Math.random() * envelope
      }
      
      const src = ctx.createBufferSource()
      src.buffer = buf
      const g = ctx.createGain()
      g.gain.setValueAtTime(vol, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      const hp = ctx.createBiquadFilter()
      hp.type = "highpass"
      hp.frequency.value = 2800
      src.connect(hp)
      hp.connect(g)
      g.connect(ctx.destination)
      src.start()
    } catch { /* silent */ }
  }, [getAudioCtx])

  const playWhoosh = useCallback((vol: number) => {
    try {
      const ctx = getAudioCtx()
      const dur = 2.2
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) {
        const t = i / d.length
        d[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * Math.pow(t, 0.5)
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.001, ctx.currentTime)
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.7)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      const bp = ctx.createBiquadFilter()
      bp.type = "bandpass"
      bp.frequency.setValueAtTime(80, ctx.currentTime)
      bp.frequency.exponentialRampToValueAtTime(5500, ctx.currentTime + 1.4)
      bp.Q.value = 0.35
      src.connect(bp)
      bp.connect(g)
      g.connect(ctx.destination)
      src.start()
    } catch { /* silent */ }
  }, [getAudioCtx])

  const playChime = useCallback((vol: number) => {
    try {
      const ctx = getAudioCtx()
      const freqs = [880, 1320, 1760, 2200]
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = "sine"
        o.frequency.value = f
        g.gain.setValueAtTime(vol * (1 - i * 0.15), ctx.currentTime + i * 0.04)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(ctx.currentTime + i * 0.04)
        o.stop(ctx.currentTime + 1.2)
      })
    } catch { /* silent */ }
  }, [getAudioCtx])

  const buildTitleParticles = useCallback((w: number, h: number) => {
    const data = dataRef.current
    if (data.built) return
    data.built = true

    const off = document.createElement("canvas")
    const octx = off.getContext("2d")
    if (!octx) return

    const fontSize = Math.min(w * 0.14, 160)
    off.width = w
    off.height = fontSize * 3.5

    // TRON — ultra-bold with stroke for maximum density
    octx.fillStyle = "#fff"
    octx.font = `900 ${fontSize}px Arial Black, sans-serif`
    octx.textAlign = "center"
    octx.textBaseline = "middle"
    octx.strokeStyle = "#fff"
    octx.lineWidth = 3
    octx.strokeText("TRON", off.width / 2, fontSize * 0.6)
    octx.fillText("TRON", off.width / 2, fontSize * 0.6)

    // Horizontal separator - much thicker with stroke
    const lineY = fontSize * 1.1
    octx.fillRect(off.width / 2 - fontSize * 1.6, lineY - 2, fontSize * 3.2, 6)

    // RETRO — ultra-bold with stroke
    const subSize = fontSize * 0.48
    octx.font = `900 ${subSize}px Arial Black, sans-serif`
    octx.textAlign = "center"
    octx.strokeText("RETRO", off.width / 2, fontSize * 1.75)
    octx.fillText("RETRO", off.width / 2, fontSize * 1.75)

    const imgData = octx.getImageData(0, 0, off.width, off.height)
    // Ultra-maximum density particles for rock-solid logo - tighter than ever
    const spacing = Math.max(1, Math.floor(fontSize / 85))

    // Position title higher (top 35% of screen) to leave room for menu below
    const offsetX = (w - off.width) / 2
    const offsetY = h * 0.15

    let particleIndex = 0
    for (let y = 0; y < off.height; y += spacing) {
      for (let x = 0; x < off.width; x += spacing) {
        const idx = (y * off.width + x) * 4
        if (imgData.data[idx + 3] > 80) {
          const targetX = offsetX + x
          const targetY = offsetY + y

          // Tron Legacy: particles stream along grid lines from edges
          // Some approach horizontally, some vertically, mimicking data streams
          const streamType = Math.random()
          let spawnX: number, spawnY: number, sAngle: number

          if (streamType < 0.3) {
            // Stream from left
            spawnX = -20 - Math.random() * 300
            spawnY = targetY + (Math.random() - 0.5) * 80
            sAngle = 0
          } else if (streamType < 0.6) {
            // Stream from right
            spawnX = w + 20 + Math.random() * 300
            spawnY = targetY + (Math.random() - 0.5) * 80
            sAngle = Math.PI
          } else if (streamType < 0.8) {
            // Stream from top
            spawnX = targetX + (Math.random() - 0.5) * 80
            spawnY = -20 - Math.random() * 300
            sAngle = Math.PI / 2
          } else {
            // Stream from bottom
            spawnX = targetX + (Math.random() - 0.5) * 80
            spawnY = h + 20 + Math.random() * 300
            sAngle = -Math.PI / 2
          }

          // Tron Legacy palette: predominantly cold cyan-white with warm orange accents
          // Assign particles to words: cyan for TRON, orange for RETRO
          const textY = h * 0.18
          const isRetroLine = targetY > textY + 40
          const isOrange = isRetroLine && Math.random() < 0.7  // More orange in RETRO line
          const isBrightCyan = !isOrange && Math.random() < 0.6  // Brighter cyan for TRON

          data.particles.push({
            x: spawnX,
            y: spawnY,
            tx: targetX,
            ty: targetY,
            z: Math.random() * 60,
            w: 2 + Math.random() * 2.5,   // larger rectangles for visibility
            h: 1 + Math.random() * 2,
            hue: isOrange ? 25 + Math.random() * 10 : 190 + Math.random() * 5,
            sat: isOrange ? 100 : 95 + Math.random() * 5,
            lum: isOrange ? 75 + Math.random() * 20 : 75 + Math.random() * 20,  // Much brighter for solid colors
            alpha: 0,
            speed: 0.012 + Math.random() * 0.02,
            phase: Math.random() * Math.PI * 2,
            trail: [],
            arrived: false,
            arriveTime: 0,
            flickerRate: 4 + Math.random() * 18,
            streamAngle: sAngle,
            streamSpeed: 1 + Math.random() * 3,
            glowIntensity: 0.3 + Math.random() * 0.7,
            snapDelay: particleIndex * 0.000015, // faster staggered arrival for tighter formation
          })

          particleIndex++
        }
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    const resize = () => {
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    const data = dataRef.current
    data.tunnelRings = []
    const ringCount = window.innerWidth > 768 ? 35 : 20  // Fewer rings on mobile
    for (let i = 0; i < ringCount; i++) {
      data.tunnelRings.push({
        z: i * 55 + Math.random() * 25,
        speed: 3.5 + Math.random() * 3,
        hue: Math.random() > 0.88 ? 30 : 190,
        thickness: 0.4 + Math.random() * 1.2,
      })
    }

    const DURATION = 8000  // 8 seconds for extended intro
    const startTime = performance.now()
    data.startTime = startTime

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / DURATION, 1)
      const w = W()
      const h = H()
      const cx = w / 2
      const cy = h / 2

      // Play audio at very beginning of animation
      if (progress < 0.01 && audioSourceRef.current && audioSourceRef.current.paused) {
        audioSourceRef.current.currentTime = 0
        audioSourceRef.current.play().catch(() => {})
      }

      // === CLEAR ===
      ctx.fillStyle = "#000608"
      ctx.fillRect(0, 0, w, h)

      // === PHASE 1: TUNNEL (0 - 0.5) ===
      if (progress < 0.65) {
        const tp = Math.min(1, progress / 0.5)
        const accel = 1 + tp * tp * 10

        // Infinite perspective grid — floor + ceiling
        ctx.save()
        const vanishY = cy * 0.35
        const h75 = h * 0.75
        const offset = ((elapsed * 0.003 * accel) % 1) * (h75 / 20)
        const baseAlpha = (1 - tp * 0.6) * 0.4

        // Optimize: Draw grid lines with adaptive density based on screen size
        ctx.lineWidth = 0.5
        const gridDensity = w > 768 ? 2 : 3  // Fewer lines on mobile
        const gridLines = Math.floor(36 / gridDensity)
        for (let i = 0; i < gridLines; i++) {
          const ii = i * gridDensity
          const z = (ii / 36) * 20 + 1
          const screenY = vanishY + h75 / z
          const a = Math.max(0, baseAlpha * (1 - ii / 36))

          // Floor grid
          ctx.strokeStyle = `hsla(190, 90%, 55%, ${a})`
          ctx.beginPath()
          ctx.moveTo(0, screenY + offset)
          ctx.lineTo(w, screenY + offset)
          ctx.stroke()

          // Ceiling with reduced opacity
          const my = vanishY - (screenY - vanishY) * 0.5
          ctx.strokeStyle = `hsla(190, 80%, 45%, ${a * 0.25})`
          ctx.beginPath()
          ctx.moveTo(0, my - offset * 0.5)
          ctx.lineTo(w, my - offset * 0.5)
          ctx.stroke()
        }

        // Converging verticals - optimized
        ctx.strokeStyle = `hsla(190, 85%, 50%, ${baseAlpha * 0.6})`
        for (let i = -16; i <= 16; i += 1) {
          const xBase = cx + (i / 18) * w * 0.95
          const a = Math.max(0, (1 - Math.abs(i) / 18) * 0.3 * (1 - tp * 0.3))
          ctx.strokeStyle = `hsla(190, 90%, 50%, ${a})`
          ctx.lineWidth = 0.4
          ctx.beginPath()
          ctx.moveTo(xBase, h)
          ctx.lineTo(cx + (xBase - cx) * 0.008, vanishY)
          ctx.stroke()
        }
        ctx.restore()

        // Tunnel rings
        for (const ring of data.tunnelRings) {
          ring.z -= ring.speed * accel * 0.35
          if (ring.z < -30) ring.z = 1600 + Math.random() * 300

          const persp = 280 / (ring.z + 45)
          const rw = w * persp * 0.65
          const rh = h * persp * 0.65
          const alpha = Math.min(0.55, persp * 0.28) * Math.min(1, tp * 3.5)

          if (rw > 0 && rh > 0 && rw < w * 5) {
            ctx.strokeStyle = `hsla(${ring.hue}, 100%, 58%, ${alpha})`
            ctx.lineWidth = ring.thickness * Math.max(0.3, 2.5 - persp * 2)
            ctx.beginPath()
            ctx.rect(cx - rw / 2, cy - rh / 2, rw, rh)
            ctx.stroke()

            if (alpha > 0.12) {
              const cs = Math.max(1, 3.5 * persp)
              ctx.fillStyle = `hsla(${ring.hue}, 100%, 78%, ${alpha * 0.7})`
              ctx.fillRect(cx - rw / 2 - cs / 2, cy - rh / 2 - cs / 2, cs, cs)
              ctx.fillRect(cx + rw / 2 - cs / 2, cy - rh / 2 - cs / 2, cs, cs)
              ctx.fillRect(cx - rw / 2 - cs / 2, cy + rh / 2 - cs / 2, cs, cs)
              ctx.fillRect(cx + rw / 2 - cs / 2, cy + rh / 2 - cs / 2, cs, cs)
            }
          }
        }

        // Speed streaks - optimized for performance
        const isMobile = w <= 768
        const maxStreaks = isMobile ? (tp > 0.5 ? 60 : 40) : (tp > 0.5 ? 120 : 80)
        const streakOpacity = Math.min(1, tp * 2.8)
        const maxDist = Math.max(w, h) * 0.85
        
        for (let i = 0; i < maxStreaks; i++) {
          const seed = i * 7919 + 3
          const angle = ((seed % 1000) / 1000) * Math.PI * 2
          const baseDist = (seed % 777) / 777
          const spd = 1.8 + ((seed % 500) / 500) * 5

          const streakP = ((elapsed * 0.001 * spd * (0.4 + tp) + baseDist) % 1)
          const d = streakP * maxDist
          const len = 12 + ((seed % 300) / 300) * 45 * (0.4 + tp)
          const a = streakOpacity * (1 - streakP) * 0.5

          if (a > 0.02) {  // Skip nearly invisible streaks
            const cosA = Math.cos(angle)
            const sinA = Math.sin(angle)
            const x1 = cx + cosA * d
            const y1 = cy + sinA * d
            const x2 = cx + cosA * (d + len)
            const y2 = cy + sinA * (d + len)

            const hue = (seed % 12) < 1 ? 28 : 190
            ctx.strokeStyle = `hsla(${hue}, 100%, 68%, ${a})`
            ctx.lineWidth = 0.25 + ((seed % 200) / 200) * 1.3 * (1 - streakP * 0.5)
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        }

        // Central vortex
        const coreSize = 70 + Math.sin(elapsed * 0.007) * 18
        const coreA = 0.1 + tp * 0.06
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize)
        grad.addColorStop(0, `hsla(190, 100%, 85%, ${coreA})`)
        grad.addColorStop(0.35, `hsla(190, 100%, 50%, ${coreA * 0.35})`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.fillRect(cx - coreSize, cy - coreSize, coreSize * 2, coreSize * 2)
      }

      // === PHASE 2: TITLE PARTICLE RECONSTRUCTION (0.18 - 0.98) ===
      if (progress > 0.18) {
        buildTitleParticles(w, h)

        const titleP = Math.min(1, (progress - 0.18) / 0.80)  // Longer formation window
        // Extremely aggressive easing - particles snap into place fast
        const easeTitle = titleP < 0.2 ? titleP * 5 : titleP < 0.6 ? 1 : Math.min(1, 0.5 + titleP * 1.5)

        // Heartbeat pulse
        const hbFreq = 2.0
        const heartbeat = Math.pow(Math.max(0, Math.sin(elapsed * 0.001 * hbFreq * Math.PI * 2)), 14)

        for (const p of data.particles) {
          // Staggered fade in - ultra-aggressive with no delay
          const staggeredP = Math.max(0, titleP - p.snapDelay * 100)  // Much faster onset
          p.alpha = Math.min(1, staggeredP * 8)  // Reach full opacity faster

          if (easeTitle > 0.05) {  // Start moving particles earlier
            const dx = p.tx - p.x
            const dy = p.ty - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Hyper-aggressive convergence - particles attack their targets
            const convergeFactor = p.speed * (1 + easeTitle * 12) * 2.2  // Much faster movement
            const streamInfluence = Math.max(0, 1 - easeTitle * 3)

            p.x += dx * convergeFactor + Math.cos(p.streamAngle) * p.streamSpeed * streamInfluence
            p.y += dy * convergeFactor + Math.sin(p.streamAngle) * p.streamSpeed * streamInfluence

            // Data stream trail — rectangular fragments (skip distance check for performance)
            if (titleP < 0.85 && Math.random() > 0.65) {
              p.trail.push({ x: p.x, y: p.y, a: 0.35, w: p.w * 0.6, h: p.h * 0.6 })
              if (p.trail.length > 6) p.trail.shift()
            }

            // Much more lenient arrival threshold - particles lock in sooner
            if (dist < 3 && !p.arrived) {
              p.arrived = true
              p.arriveTime = elapsed
              // Force exact position once arrived
              p.x = p.tx
              p.y = p.ty
            }
          } else {
            // If easeTitle is very high, force arrival
            if (titleP > 0.5 && !p.arrived) {
              p.arrived = true
              p.arriveTime = elapsed
              p.x = p.tx
              p.y = p.ty
            }
          }
        }

        // Render trails (skip for cleaner look during title phase)
        if (titleP < 0.4) {
          for (const p of data.particles) {
            for (const t of p.trail) {
              ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.lum}%, ${t.a})`
              ctx.fillRect(t.x - t.w / 2, t.y - t.h / 2, t.w, t.h)
            }
          }
        }

        // Render particles - FULL POWER
        for (const p of data.particles) {
          // Draw particle — ultra-bright, hyper-saturated for complete solid title
          // Particles become MORE visible as they converge, not less
          const convergenceBoost = Math.pow(Math.min(1, titleP), 0.5)  // Boost visibility during convergence
          
          const flicker = p.arrived
            ? 0.95 + Math.sin(elapsed * 0.001 * p.flickerRate + p.phase) * 0.05 + heartbeat * 0.08
            : 0.5 + titleP * 1.0  // MUCH MORE visible during convergence - reaches 1.5 opacity equivalent

          const sw = p.arrived ? p.w * (1 + heartbeat * 0.12) : p.w * (0.8 + convergenceBoost * 0.4)
          const sh = p.arrived ? p.h * (1 + heartbeat * 0.12) : p.h * (0.8 + convergenceBoost * 0.4)
          
          // Maximum brightness - no dimming during formation
          const bright = p.arrived 
            ? Math.min(100, p.lum + heartbeat * 15)
            : Math.min(100, p.lum * 1.2 + titleP * 25)  // Progressively brighten during convergence

          // Saturate colors more - especially during convergence
          const satBoost = p.arrived ? p.sat : Math.min(100, p.sat * 1.3 + titleP * 15)

          ctx.fillStyle = `hsla(${p.hue}, ${satBoost}%, ${bright}%, ${Math.min(1, flicker * p.alpha * (0.7 + convergenceBoost * 0.3))})`
          ctx.fillRect(p.x - sw / 2, p.y - sh / 2, sw, sh)

          // Subtle glow halo on arrived particles (not all — sparse like Legacy)
          if (p.arrived && p.glowIntensity > 0.7 && Math.random() > 0.97) {
            ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${0.03 + heartbeat * 0.04})`
            const gs = Math.max(sw, sh) * 5
            ctx.fillRect(p.x - gs / 2, p.y - gs / 2, gs, gs)
          }
        }

        // Background glow pulse behind title
        if (titleP > 0.25) {
          const glowA = (0.04 + heartbeat * 0.07) * Math.min(1, (titleP - 0.25) * 3)
          const titleCenterY = h * 0.15 + 60
          const tg = ctx.createRadialGradient(cx, titleCenterY, 0, cx, titleCenterY, Math.min(w, h) * 0.35)
          tg.addColorStop(0, `hsla(190, 100%, 55%, ${glowA})`)
          tg.addColorStop(0.5, `hsla(190, 100%, 35%, ${glowA * 0.25})`)
          tg.addColorStop(1, "transparent")
          ctx.fillStyle = tg
          ctx.fillRect(0, 0, w, h)
        }
      }

      // === GLITCH SLICES ===
      if (progress > 0.5 && progress < 0.92) {
        const heartbeat = Math.pow(Math.max(0, Math.sin(elapsed * 0.001 * 2.0 * Math.PI * 2)), 14)
        const glitchChance = 0.025 + heartbeat * 0.07
        if (Math.random() < glitchChance) {
          const sliceH = 1 + Math.random() * 12
          const sliceY = Math.random() * h
          const shift = (Math.random() - 0.5) * 20

          try {
            const imgData = ctx.getImageData(
              0, Math.max(0, Math.floor(sliceY)) * dpr,
              w * dpr, Math.ceil(sliceH) * dpr
            )
            ctx.putImageData(imgData, shift * dpr, Math.max(0, Math.floor(sliceY)) * dpr)
          } catch { /* silent */ }

          ctx.globalCompositeOperation = "lighter"
          ctx.fillStyle = "rgba(255, 20, 0, 0.02)"
          ctx.fillRect(shift + 2, sliceY, w, sliceH)
          ctx.fillStyle = "rgba(0, 180, 255, 0.02)"
          ctx.fillRect(shift - 2, sliceY, w, sliceH)
          ctx.globalCompositeOperation = "source-over"
        }
      }

      // === SCANLINES ===
      if (progress > 0.35) {
        const scanA = 0.03 * Math.min(1, (progress - 0.35) * 3)
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = `rgba(0, 0, 0, ${scanA})`
          ctx.fillRect(0, y, w, 1)
        }
      }

      // === VIGNETTE ===
      const vig = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.22, cx, cy, Math.max(w, h) * 0.8)
      vig.addColorStop(0, "transparent")
      vig.addColorStop(1, "rgba(0, 4, 8, 0.8)")
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)

      // === PHASE 3: FADE OUT (0.88 - 1.0) ===
      if (progress > 0.88) {
        const fade = Math.min(1, (progress - 0.88) / 0.12)
        ctx.fillStyle = `rgba(0, 5, 10, ${fade})`
        ctx.fillRect(0, 0, w, h)
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else if (!completedRef.current) {
        completedRef.current = true
        // Stop the audio and clean up
        if (audioSourceRef.current) {
          audioSourceRef.current.pause()
          audioSourceRef.current.currentTime = 0
        }
        setTimeout(onComplete, 100)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animFrameRef.current)
      // Clean up audio on unmount
      if (audioSourceRef.current) {
        audioSourceRef.current.pause()
        audioSourceRef.current.currentTime = 0
      }
    }
  }, [onComplete, buildTitleParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50"
      style={{ width: "100%", height: "100%", background: "#000608", cursor: "none" }}
    />
  )
}
