export interface DialogueLine {
  speaker: "CLU" | "TRON" | "SYSTEM" | "USER"
  text: string
  mood?: "threatening" | "taunting" | "desperate" | "calm" | "warning" | "triumphant" | "neutral"
}

export interface LevelStory {
  preMatch: DialogueLine[]
  onPlayerWin: DialogueLine[]
  onPlayerLose: DialogueLine[]
}

export const STORY: Record<number, LevelStory> = {
  1: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "PROGRAM DETECTED. INITIALIZING LIGHT CYCLE COMBAT.",
        mood: "neutral",
      },
      {
        speaker: "CLU",
        text: "Welcome to the Grid, User. Let's see how long you last.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "Good. But CLU won't underestimate you again. Stay sharp.",
        mood: "warning",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Derezzed. The system corrects itself.",
        mood: "triumphant",
      },
    ],
  },
  2: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "SECTOR 2 LOADED. THREAT LEVEL: ELEVATED.",
        mood: "neutral",
      },
      {
        speaker: "CLU",
        text: "You're predictable, User. I'm learning your every move.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "CLU can't predict chaos. Keep going.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Chaos falls to order. Always.",
        mood: "taunting",
      },
    ],
  },
  3: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "SECTOR 3 UNSTABLE. GRID INTEGRITY DECLINING.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "You fight like Flynn did. Reckless. You'll end the same way.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "He's weakening. One more sector.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Flynn's legacy dies with you.",
        mood: "triumphant",
      },
    ],
  },
  4: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "ADVANCED PURSUIT PROTOCOLS ACTIVATED.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "I will not fail. Not for you. Not for anyone.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "He's fragmenting. One final sector.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Perfection endures. You are deleted.",
        mood: "triumphant",
      },
    ],
  },
  5: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "GRID CORE DETECTED. FINAL SECTOR INITIALIZED.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "I am the Grid. No one has ever reached this far.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "The Grid is free. You've done what Flynn always believed.",
        mood: "triumphant",
      },
      {
        speaker: "SYSTEM",
        text: "GRID LIBERATED. WELCOME TO THE NEW GRID.",
        mood: "neutral",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Perfection endures. The Grid remains.",
        mood: "triumphant",
      },
    ],
  },
}

// Fallback for levels beyond 5
export function getStoryForLevel(level: number): LevelStory {
  if (STORY[level]) return STORY[level]

  // For endless mode beyond level 5
  return {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: `SECTOR ${level} ANOMALY. FRAGMENTS DETECTED.`,
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "My code persists. This echo will not rest.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "Another fragment purged.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Even echoes can derez a User.",
        mood: "taunting",
      },
    ],
  }
}
