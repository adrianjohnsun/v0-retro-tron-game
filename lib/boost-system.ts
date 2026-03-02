export type BoostType = "speed" | "shield" | "slow"

export interface Boost {
  x: number
  y: number
  type: BoostType
  spawnTime: number
  duration: number
  isActive: boolean
}

export interface BoostState {
  boosts: Boost[]
  activeBoostTimers: Record<string, number> // "playerId" -> end time
}

export const BOOST_CONFIG = {
  speed: {
    duration: 3000, // 3 seconds
    effect: 1.8, // 1.8x speed multiplier
    spawnWeight: 0.4,
    color: "rgba(255, 200, 0, 0.9)",
  },
  shield: {
    duration: 4000, // 4 seconds
    effect: 1, // Prevents one collision
    spawnWeight: 0.3,
    color: "rgba(0, 255, 150, 0.9)",
  },
  slow: {
    duration: 2000, // 2 seconds
    effect: 0.5, // 0.5x enemy speed
    spawnWeight: 0.3,
    color: "rgba(100, 200, 255, 0.9)",
  },
}

export function generateBoosts(gridSize: number, count: number, difficulty: "arcade" | "standard" | "legacy"): Boost[] {
  const boosts: Boost[] = []
  const difficultySpawnRates = {
    arcade: 0.8,
    standard: 0.5,
    legacy: 0.2,
  }

  const spawnCount = Math.floor(count * difficultySpawnRates[difficulty])

  for (let i = 0; i < spawnCount; i++) {
    const rand = Math.random()
    let type: BoostType

    // Weighted random selection
    if (rand < BOOST_CONFIG.speed.spawnWeight) {
      type = "speed"
    } else if (rand < BOOST_CONFIG.speed.spawnWeight + BOOST_CONFIG.shield.spawnWeight) {
      type = "shield"
    } else {
      type = "slow"
    }

    boosts.push({
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
      type,
      spawnTime: Date.now(),
      duration: BOOST_CONFIG[type].duration,
      isActive: true,
    })
  }

  return boosts
}

export function activateBoost(
  playerId: number,
  boostType: BoostType,
  state: BoostState
): { speedMultiplier: number; hasShield: boolean } {
  const config = BOOST_CONFIG[boostType]
  const endTime = Date.now() + config.duration
  const key = `${playerId}-${boostType}`

  const result = {
    speedMultiplier: boostType === "speed" ? config.effect : 1,
    hasShield: boostType === "shield",
  }

  // Store the boost effect time
  state.activeBoostTimers[key] = endTime

  return result
}

export function updateBoosts(state: BoostState, gridSize: number, difficulty: "arcade" | "standard" | "legacy"): BoostState {
  const now = Date.now()

  // Remove expired boosts
  state.boosts = state.boosts.filter((boost) => {
    return now - boost.spawnTime < 15000 // Boosts disappear after 15 seconds if not taken
  })

  // Remove expired boost timers
  Object.keys(state.activeBoostTimers).forEach((key) => {
    if (now > state.activeBoostTimers[key]) {
      delete state.activeBoostTimers[key]
    }
  })

  // Spawn new boosts periodically based on difficulty
  const spawnRate = {
    arcade: 3000, // Every 3 seconds
    standard: 4000, // Every 4 seconds
    legacy: 6000, // Every 6 seconds
  }[difficulty]

  if (state.boosts.length < 8 && Math.random() < 0.05) {
    const type = Math.random() < 0.4 ? "speed" : Math.random() < 0.7 ? "shield" : "slow"
    state.boosts.push({
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
      type,
      spawnTime: now,
      duration: BOOST_CONFIG[type].duration,
      isActive: true,
    })
  }

  return state
}

export function getBoostEffect(
  playerId: number,
  boostType: BoostType,
  state: BoostState
): { isActive: boolean; multiplier: number } {
  const key = `${playerId}-${boostType}`
  const endTime = state.activeBoostTimers[key]

  if (!endTime || Date.now() > endTime) {
    return { isActive: false, multiplier: 1 }
  }

  const config = BOOST_CONFIG[boostType]
  return {
    isActive: true,
    multiplier: boostType === "speed" ? config.effect : 1,
  }
}

export function removeBoostAtPosition(state: BoostState, x: number, y: number): BoostType | null {
  const index = state.boosts.findIndex((b) => b.x === x && b.y === y)
  if (index !== -1) {
    const boostType = state.boosts[index].type
    state.boosts.splice(index, 1)
    return boostType
  }
  return null
}
