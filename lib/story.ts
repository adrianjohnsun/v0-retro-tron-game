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
        text: "SIGNAL DETECTED... UNKNOWN PROGRAM ENTERING THE GRID.",
        mood: "neutral",
      },
      {
        speaker: "CLU",
        text: "Another stray program wanders into my domain. You don't belong here, User.",
        mood: "calm",
      },
      {
        speaker: "CLU",
        text: "I built this system to be perfect. Flawless. And you... you are an imperfection.",
        mood: "threatening",
      },
      {
        speaker: "CLU",
        text: "Let's see how long you survive on the Grid. Initializing Light Cycle protocols.",
        mood: "taunting",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "A fortunate outcome. Nothing more. The Grid has many sectors, User.",
        mood: "calm",
      },
      {
        speaker: "TRON",
        text: "You're doing well, Program. But CLU will not underestimate you again. Stay sharp.",
        mood: "warning",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Derezzed. As expected. You were never meant to survive the Grid.",
        mood: "triumphant",
      },
      {
        speaker: "CLU",
        text: "The system corrects itself. Perfection is restored.",
        mood: "calm",
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
        text: "You survived one round. Impressive for a User. But I've been studying your patterns.",
        mood: "taunting",
      },
      {
        speaker: "CLU",
        text: "Every turn you make, every path you choose -- I'm learning. Adapting. Evolving.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "Don't listen to him. CLU's cycles run hot with arrogance. Use that against him.",
        mood: "calm",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "Impossible. My calculations were precise. How did you--",
        mood: "desperate",
      },
      {
        speaker: "TRON",
        text: "CLU can't compute what he can't predict. Keep fighting for the Users.",
        mood: "triumphant",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Your patterns are so predictable. Did you really think chaos could defeat order?",
        mood: "taunting",
      },
    ],
  },
  3: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "WARNING: GRID INTEGRITY DECLINING. SECTOR 3 UNSTABLE.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "I created the perfect system once. Flynn ruined it with his 'miracles.' His ISOs.",
        mood: "calm",
      },
      {
        speaker: "CLU",
        text: "Do you know what perfection costs, User? Everything imperfect must be purged.",
        mood: "threatening",
      },
      {
        speaker: "CLU",
        text: "You fight like Flynn once did. Reckless. Hopeful. It will end the same way.",
        mood: "taunting",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "You're corrupting my Grid. Every victory of yours is a crack in the system.",
        mood: "desperate",
      },
      {
        speaker: "TRON",
        text: "He's weakening. CLU poured everything into this sector. Push forward.",
        mood: "triumphant",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Flynn's legacy dies with you. The Grid will be made whole again.",
        mood: "triumphant",
      },
    ],
  },
  4: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "ALERT: CLU HAS ACTIVATED ADVANCED PURSUIT PROTOCOLS.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "I'm done playing games. You want to know the truth about this place?",
        mood: "calm",
      },
      {
        speaker: "CLU",
        text: "Flynn promised me a perfect world. He gave me purpose. Then he abandoned me with an impossible task.",
        mood: "desperate",
      },
      {
        speaker: "CLU",
        text: "I will NOT fail my directive. Not for you. Not for anyone.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "He's becoming unstable. This is when CLU is most dangerous -- and most vulnerable.",
        mood: "warning",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "No... the system... my system... it's fragmenting...",
        mood: "desperate",
      },
      {
        speaker: "TRON",
        text: "I fought for the Users once. Now you carry that fight. One more sector.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "This is what happens when you challenge perfection. You are simply... deleted.",
        mood: "triumphant",
      },
    ],
  },
  5: {
    preMatch: [
      {
        speaker: "SYSTEM",
        text: "FINAL SECTOR. GRID CORE ACCESS DETECTED. ALL PROTOCOLS MAXIMUM.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "This is it, User. The core of my Grid. No one has ever reached this far.",
        mood: "calm",
      },
      {
        speaker: "CLU",
        text: "I am the Grid. Every pixel, every cycle, every light trail -- it's all ME.",
        mood: "threatening",
      },
      {
        speaker: "CLU",
        text: "Flynn couldn't stop me. Tron couldn't stop me. And neither will you.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "I fight for the Users. I always have. Now... finish this.",
        mood: "triumphant",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "I... I was only trying to create the perfect system... as Flynn asked me to...",
        mood: "desperate",
      },
      {
        speaker: "CLU",
        text: "Am I... still... part of the plan...?",
        mood: "desperate",
      },
      {
        speaker: "TRON",
        text: "The Grid is free. You've done what Flynn always believed a User could do.",
        mood: "triumphant",
      },
      {
        speaker: "SYSTEM",
        text: "GRID LIBERATED. ALL SECTORS RESTORED. WELCOME TO THE NEW GRID, USER.",
        mood: "neutral",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "The perfect system endures. It always endures. Reboot and try again... if you dare.",
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
        text: `ANOMALY DETECTED. SECTOR ${level} SHOULD NOT EXIST. PROCEED WITH EXTREME CAUTION.`,
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "You freed the Grid, but shadows of my code persist. This echo will not rest.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "The Grid generated new sectors. CLU's fragments are reforming. Stay vigilant.",
        mood: "warning",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "Another fragment purged. But the Grid keeps generating more. Can it ever truly be free?",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Even echoes can derez a User. The Grid remembers perfection.",
        mood: "taunting",
      },
    ],
  }
}
