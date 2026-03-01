/**
 * Daft Punk-inspired retro synth soundtrack engine
 * Uses Web Audio API to generate procedural electronic music
 * Tracks: "the-grid" (menu/dialogue), "derezzed" (light cycles), "arena" (disc wars)
 */

type TrackName = "the-grid" | "derezzed" | "arena" | "end-of-line"

interface ScheduledNode {
  osc?: OscillatorNode
  gain?: GainNode
  stopTime: number
}

class SoundtrackEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private currentTrack: TrackName | null = null
  private isPlaying = false
  private scheduledNodes: ScheduledNode[] = []
  private loopTimer: ReturnType<typeof setTimeout> | null = null
  private _volume = 0.35
  private beatIndex = 0
  private bpm = 120

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this._volume
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume()
    }
    return this.ctx
  }

  get volume(): number {
    return this._volume
  }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this._volume, this.getCtx().currentTime, 0.05)
    }
  }

  get playing(): boolean {
    return this.isPlaying
  }

  get track(): TrackName | null {
    return this.currentTrack
  }

  // Create a filtered oscillator
  private synth(
    freq: number,
    type: OscillatorType,
    startTime: number,
    duration: number,
    volume: number,
    filterFreq?: number,
    filterQ?: number,
    attack = 0.01,
    release = 0.08,
  ) {
    const ctx = this.getCtx()
    if (!this.masterGain) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)

    // ADSR-like envelope
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(volume, startTime + attack)
    gain.gain.setValueAtTime(volume, startTime + duration - release)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    osc.connect(gain)

    if (filterFreq) {
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(filterFreq, startTime)
      if (filterQ) filter.Q.setValueAtTime(filterQ, startTime)
      gain.connect(filter)
      filter.connect(this.masterGain)
    } else {
      gain.connect(this.masterGain)
    }

    osc.start(startTime)
    osc.stop(startTime + duration + 0.01)

    this.scheduledNodes.push({ osc, gain, stopTime: startTime + duration + 0.01 })
  }

  // Bass kick drum via oscillator
  private kick(startTime: number, volume = 0.3) {
    const ctx = this.getCtx()
    if (!this.masterGain) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(150, startTime)
    osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.15)
    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2)
    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start(startTime)
    osc.stop(startTime + 0.21)
    this.scheduledNodes.push({ osc, gain, stopTime: startTime + 0.21 })
  }

  // Hi-hat via noise approximation
  private hihat(startTime: number, volume = 0.06, long = false) {
    const ctx = this.getCtx()
    if (!this.masterGain) return

    const dur = long ? 0.12 : 0.04
    // Use high-frequency square wave as a cheap noise stand-in
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    osc.type = "square"
    osc.frequency.setValueAtTime(8000 + Math.random() * 2000, startTime)
    filter.type = "highpass"
    filter.frequency.setValueAtTime(7000, startTime)
    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain!)
    osc.start(startTime)
    osc.stop(startTime + dur + 0.01)
    this.scheduledNodes.push({ osc, gain, stopTime: startTime + dur + 0.01 })
  }

  // Snare hit
  private snare(startTime: number, volume = 0.12) {
    const ctx = this.getCtx()
    if (!this.masterGain) return

    // Tonal part
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(200, startTime)
    osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.08)
    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.1)
    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start(startTime)
    osc.stop(startTime + 0.11)

    // Noise part
    this.hihat(startTime, volume * 0.7, true)
    this.scheduledNodes.push({ osc, gain, stopTime: startTime + 0.11 })
  }

  // ========== TRACK: THE GRID ==========
  // Ambient, atmospheric - like "The Grid" / "Solar Sailer"
  private scheduleTheGrid() {
    const ctx = this.getCtx()
    const now = ctx.currentTime + 0.05
    const beatLen = 60 / 80 // 80 BPM slow
    const barLen = beatLen * 4

    // Ambient pad - slow evolving chord
    const padChords = [
      [130.81, 164.81, 196.00], // C3, E3, G3
      [116.54, 146.83, 174.61], // Bb2, D3, F3
      [110.00, 138.59, 164.81], // A2, C#3, E3
      [123.47, 155.56, 185.00], // B2, Eb3, F#3
    ]

    const chordIdx = this.beatIndex % padChords.length
    const chord = padChords[chordIdx]

    // Pad layer
    for (const freq of chord) {
      this.synth(freq, "sine", now, barLen * 0.95, 0.06, 600, 1, 0.3, 0.5)
      this.synth(freq * 2, "sine", now, barLen * 0.95, 0.025, 800, 1, 0.5, 0.6)
    }

    // Slow arpeggiated high notes
    const arpNotes = [523.25, 659.25, 783.99, 659.25, 523.25, 392.00, 329.63, 392.00]
    for (let i = 0; i < 8; i++) {
      const noteTime = now + i * (barLen / 8)
      this.synth(arpNotes[i], "sine", noteTime, beatLen * 0.8, 0.03, 2000, 2, 0.05, 0.3)
    }

    // Occasional deep pulse
    if (this.beatIndex % 2 === 0) {
      this.synth(65.41, "sine", now, barLen * 0.5, 0.1, 200, 1, 0.1, 0.3)
    }

    this.beatIndex++

    this.loopTimer = setTimeout(() => {
      if (this.isPlaying && this.currentTrack === "the-grid") {
        this.scheduleTheGrid()
      }
    }, barLen * 1000 * 0.85)
  }

  // ========== TRACK: DEREZZED ==========
  // Aggressive, driving - like "Derezzed" / "The Game Has Changed"
  private scheduleDerezzed() {
    const ctx = this.getCtx()
    const now = ctx.currentTime + 0.05
    this.bpm = 130
    const beatLen = 60 / this.bpm
    const barLen = beatLen * 4
    const sixteenth = beatLen / 4

    // Bass line - iconic Derezzed-style pattern
    const bassPatterns = [
      [65.41, 65.41, 0, 65.41, 0, 65.41, 82.41, 0, 65.41, 0, 65.41, 0, 73.42, 0, 65.41, 0],
      [58.27, 58.27, 0, 58.27, 0, 58.27, 73.42, 0, 58.27, 0, 65.41, 0, 58.27, 0, 48.99, 0],
      [55.00, 55.00, 0, 55.00, 0, 55.00, 65.41, 0, 55.00, 0, 55.00, 0, 61.74, 0, 55.00, 0],
      [65.41, 65.41, 0, 73.42, 0, 82.41, 0, 73.42, 65.41, 0, 58.27, 0, 55.00, 0, 58.27, 0],
    ]

    const bassLine = bassPatterns[this.beatIndex % bassPatterns.length]

    for (let i = 0; i < 16; i++) {
      const noteTime = now + i * sixteenth
      if (bassLine[i] > 0) {
        this.synth(bassLine[i], "sawtooth", noteTime, sixteenth * 0.8, 0.12, 400, 4, 0.005, 0.02)
        // Sub bass
        this.synth(bassLine[i] / 2, "sine", noteTime, sixteenth * 0.9, 0.08, 150, 1, 0.01, 0.05)
      }
    }

    // Drum pattern - four on the floor with syncopation
    for (let beat = 0; beat < 4; beat++) {
      const t = now + beat * beatLen
      // Kick on every beat
      this.kick(t, 0.25)
      // Open hihat on off-beats
      this.hihat(t + beatLen * 0.5, 0.05, true)
      // Closed hihats on 8ths
      this.hihat(t, 0.03)
      this.hihat(t + beatLen * 0.25, 0.02)
      this.hihat(t + beatLen * 0.75, 0.02)
    }
    // Snare on 2 and 4
    this.snare(now + beatLen * 1, 0.1)
    this.snare(now + beatLen * 3, 0.1)

    // Stab chord every 2 bars
    if (this.beatIndex % 2 === 0) {
      const stabChords = [
        [261.63, 329.63, 392.00],
        [233.08, 293.66, 349.23],
        [220.00, 277.18, 329.63],
        [246.94, 311.13, 369.99],
      ]
      const stab = stabChords[Math.floor(this.beatIndex / 2) % stabChords.length]
      for (const freq of stab) {
        this.synth(freq, "square", now, sixteenth * 2, 0.04, 1500, 3, 0.005, 0.05)
      }
    }

    // Lead melody riff every 4 bars
    if (this.beatIndex % 4 === 2) {
      const melodies = [
        [523.25, 0, 659.25, 0, 523.25, 0, 392.00, 0, 440.00, 0, 523.25, 0, 0, 0, 0, 0],
        [659.25, 0, 0, 783.99, 0, 659.25, 0, 0, 523.25, 0, 440.00, 0, 523.25, 0, 0, 0],
      ]
      const melody = melodies[Math.floor(this.beatIndex / 4) % melodies.length]
      for (let i = 0; i < 16; i++) {
        if (melody[i] > 0) {
          const t = now + i * sixteenth
          this.synth(melody[i], "square", t, sixteenth * 1.5, 0.035, 3000, 2, 0.005, 0.1)
        }
      }
    }

    this.beatIndex++

    this.loopTimer = setTimeout(() => {
      if (this.isPlaying && this.currentTrack === "derezzed") {
        this.scheduleDerezzed()
      }
    }, barLen * 1000 * 0.85)
  }

  // ========== TRACK: ARENA ==========
  // Intense, heavy - like "Rinzler" / "Disc Wars"
  private scheduleArena() {
    const ctx = this.getCtx()
    const now = ctx.currentTime + 0.05
    this.bpm = 140
    const beatLen = 60 / this.bpm
    const barLen = beatLen * 4
    const sixteenth = beatLen / 4

    // Dark, aggressive bass
    const bassPatterns = [
      [55.00, 55.00, 0, 55.00, 73.42, 0, 55.00, 0, 55.00, 82.41, 0, 55.00, 0, 0, 55.00, 0],
      [49.00, 49.00, 0, 49.00, 65.41, 0, 49.00, 0, 55.00, 0, 49.00, 0, 61.74, 0, 49.00, 0],
      [41.20, 41.20, 0, 41.20, 55.00, 0, 41.20, 0, 49.00, 0, 41.20, 0, 49.00, 55.00, 0, 41.20],
      [55.00, 0, 49.00, 0, 55.00, 61.74, 0, 55.00, 49.00, 0, 41.20, 0, 49.00, 0, 55.00, 0],
    ]

    const bassLine = bassPatterns[this.beatIndex % bassPatterns.length]

    for (let i = 0; i < 16; i++) {
      const noteTime = now + i * sixteenth
      if (bassLine[i] > 0) {
        this.synth(bassLine[i], "sawtooth", noteTime, sixteenth * 0.7, 0.14, 350, 6, 0.003, 0.02)
        this.synth(bassLine[i] * 0.5, "sine", noteTime, sixteenth * 0.9, 0.1, 120, 1, 0.01, 0.05)
        // Distortion layer
        this.synth(bassLine[i] * 1.005, "square", noteTime, sixteenth * 0.5, 0.03, 300, 8, 0.003, 0.02)
      }
    }

    // Harder drums
    for (let beat = 0; beat < 4; beat++) {
      const t = now + beat * beatLen
      this.kick(t, 0.3)
      this.hihat(t, 0.04)
      this.hihat(t + sixteenth, 0.02)
      this.hihat(t + sixteenth * 2, 0.04, beat % 2 === 1)
      this.hihat(t + sixteenth * 3, 0.02)
    }
    this.snare(now + beatLen, 0.13)
    this.snare(now + beatLen * 3, 0.13)
    // Ghost snare
    if (this.beatIndex % 2 === 1) {
      this.snare(now + beatLen * 2.75, 0.06)
    }

    // Dark stab
    if (this.beatIndex % 2 === 0) {
      const stabs = [
        [110.00, 164.81, 220.00],
        [98.00, 146.83, 196.00],
        [82.41, 123.47, 164.81],
        [92.50, 138.59, 185.00],
      ]
      const stab = stabs[Math.floor(this.beatIndex / 2) % stabs.length]
      for (const freq of stab) {
        this.synth(freq, "sawtooth", now + beatLen * 0.5, sixteenth * 3, 0.05, 1200, 5, 0.003, 0.1)
      }
    }

    // Alarm-style high synth every 8 bars
    if (this.beatIndex % 8 === 4) {
      const alarm = [880, 0, 880, 0, 1046.5, 0, 880, 0, 783.99, 0, 0, 0, 783.99, 0, 659.25, 0]
      for (let i = 0; i < 16; i++) {
        if (alarm[i] > 0) {
          this.synth(alarm[i], "square", now + i * sixteenth, sixteenth * 0.8, 0.025, 4000, 3, 0.003, 0.05)
        }
      }
    }

    this.beatIndex++

    this.loopTimer = setTimeout(() => {
      if (this.isPlaying && this.currentTrack === "arena") {
        this.scheduleArena()
      }
    }, barLen * 1000 * 0.85)
  }

  // ========== TRACK: END OF LINE ==========
  // Victory / result screen - euphoric synth
  private scheduleEndOfLine() {
    const ctx = this.getCtx()
    const now = ctx.currentTime + 0.05
    this.bpm = 118
    const beatLen = 60 / this.bpm
    const barLen = beatLen * 4

    // Uplifting pad
    const chords = [
      [261.63, 329.63, 392.00, 523.25],
      [293.66, 369.99, 440.00, 587.33],
      [329.63, 415.30, 493.88, 659.25],
      [261.63, 329.63, 392.00, 523.25],
    ]

    const chord = chords[this.beatIndex % chords.length]
    for (const freq of chord) {
      this.synth(freq, "sine", now, barLen * 0.9, 0.04, 1500, 1, 0.2, 0.4)
      this.synth(freq, "triangle", now + 0.1, barLen * 0.85, 0.025, 2000, 1, 0.3, 0.3)
    }

    // Light kick
    for (let beat = 0; beat < 4; beat++) {
      this.kick(now + beat * beatLen, 0.15)
      this.hihat(now + beat * beatLen + beatLen * 0.5, 0.03)
    }

    // Ascending arp
    const arpNotes = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]
    for (let i = 0; i < 8; i++) {
      const idx = (i + this.beatIndex * 3) % arpNotes.length
      this.synth(arpNotes[idx], "sine", now + i * (barLen / 8), beatLen * 0.6, 0.025, 3000, 2, 0.02, 0.2)
    }

    this.beatIndex++

    this.loopTimer = setTimeout(() => {
      if (this.isPlaying && this.currentTrack === "end-of-line") {
        this.scheduleEndOfLine()
      }
    }, barLen * 1000 * 0.85)
  }

  // ========== PUBLIC API ==========

  play(track: TrackName) {
    // If already playing this track, just ensure it's running
    if (this.isPlaying && this.currentTrack === track) return

    this.stop()
    this.getCtx() // ensure context is ready
    this.currentTrack = track
    this.isPlaying = true
    this.beatIndex = 0

    switch (track) {
      case "the-grid":
        this.scheduleTheGrid()
        break
      case "derezzed":
        this.scheduleDerezzed()
        break
      case "arena":
        this.scheduleArena()
        break
      case "end-of-line":
        this.scheduleEndOfLine()
        break
    }
  }

  stop() {
    this.isPlaying = false
    this.currentTrack = null

    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
      this.loopTimer = null
    }

    // Stop all scheduled nodes
    const ctx = this.ctx
    if (ctx) {
      for (const node of this.scheduledNodes) {
        try {
          if (node.gain) {
            node.gain.gain.cancelScheduledValues(ctx.currentTime)
            node.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
          }
          if (node.osc) {
            node.osc.stop(ctx.currentTime + 0.05)
          }
        } catch {
          // already stopped
        }
      }
    }
    this.scheduledNodes = []
    this.beatIndex = 0
  }

  // Transition smoothly to a new track
  crossfadeTo(track: TrackName) {
    if (this.currentTrack === track && this.isPlaying) return
    // Quick fade out then start new
    const oldVol = this._volume
    this.volume = 0
    setTimeout(() => {
      this.stop()
      this.volume = oldVol
      this.play(track)
    }, 100)
  }

  dispose() {
    this.stop()
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
      this.masterGain = null
    }
  }
}

// Singleton instance
let instance: SoundtrackEngine | null = null

export function getSoundtrack(): SoundtrackEngine {
  if (!instance) {
    instance = new SoundtrackEngine()
  }
  return instance
}

export type { TrackName }
