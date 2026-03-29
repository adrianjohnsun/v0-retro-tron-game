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
        text: "INTRUDER DETECTED. ENGAGING LIGHT CYCLE DEFENSE PROTOCOL.",
        mood: "neutral",
      },
      {
        speaker: "CLU",
        text: "You've entered my Grid. I'll dispose of you quickly.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "Impressive. But the real battles are ahead. Don't let your guard down.",
        mood: "warning",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Deactivated. Another intruder purged.",
        mood: "triumphant",
      },
    ],
  },
  2: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "SECTOR 2 ENGAGED. WARNING: ADVANCED AI PRESENT.",
        mood: "neutral",
      },
      {
        speaker: "CLU",
        text: "I saw that coming. You can't outthink a program running at maximum efficiency.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "Use instinct, not logic. That's what CLU can't account for.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Predictable. Your patterns revealed your weakness.",
        mood: "taunting",
      },
    ],
  },
  3: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "SECTOR 3 ACTIVE. GRID STABILITY AT 73%.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "You remind me of Flynn. Defiant. Doomed. History won't save you.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "His power's fading. Two sectors remain. Push forward.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Your will means nothing. The Grid is absolute.",
        mood: "triumphant",
      },
    ],
  },
  4: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "CORE DEFENSE LAYERS ACTIVATED. MAXIMUM THREAT LEVEL.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "I AM the Grid. Every byte answers to me. You cannot win.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "There's one last sector. End this. End him.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "The Grid demands perfection. You have failed.",
        mood: "triumphant",
      },
    ],
  },
  5: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "GRID CORE ACCESSED. FINAL CONFRONTATION INITIATED.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "You've come far, User. But this is where your journey ends.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "You did it. The Grid is free.",
        mood: "triumphant",
      },
      {
        speaker: "SYSTEM",
        text: "GRID LIBERATION ACHIEVED. THANK YOU, USER.",
        mood: "neutral",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Your defiance ends here. Perfect order is restored.",
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
        text: `SECTOR ${level} ACTIVE. ANOMALIES DETECTED IN CODE.`,
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "Echoes of my system endure. You cannot destroy all of me.",
        mood: "threatening",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "Another piece eliminated. Stay focused.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "I live on. The Grid always endures.",
        mood: "taunting",
      },
    ],
  }
}
