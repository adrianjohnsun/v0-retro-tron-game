export interface DialogueLine {
  speaker: "CLU" | "TRON" | "SYSTEM" | "RINZLER" | "USER"
  text: string
  mood?: "threatening" | "taunting" | "desperate" | "calm" | "warning" | "triumphant" | "neutral" | "sinister"
}

export interface RoundStory {
  preRound: DialogueLine[]
  onPlayerWin: DialogueLine[]
  onPlayerLose: DialogueLine[]
}

const DISC_STORY: Record<number, RoundStory> = {
  1: {
    preRound: [
      {
        speaker: "SYSTEM",
        text: "DISC WARS ARENA INITIALIZED. COMBATANT DETECTED: UNREGISTERED PROGRAM.",
        mood: "neutral",
      },
      {
        speaker: "CLU",
        text: "Welcome to the Games, User. Every program in my system earns their cycles here.",
        mood: "calm",
      },
      {
        speaker: "CLU",
        text: "Your identity disc is everything. Lose it, and you lose yourself. Permanently.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "Focus. Read your opponent's movements. Throw when they commit to a direction. You can do this.",
        mood: "calm",
      },
    ],
    onPlayerWin: [
      {
        speaker: "SYSTEM",
        text: "COMBATANT DEREZZED. VICTOR: USER PROGRAM.",
        mood: "neutral",
      },
      {
        speaker: "CLU",
        text: "Beginner's luck. The arena has much harsher trials ahead.",
        mood: "taunting",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Pathetic. Even the most basic sentries could last longer than that.",
        mood: "taunting",
      },
      {
        speaker: "TRON",
        text: "Get up. A User doesn't derez that easily. Study the patterns and try again.",
        mood: "warning",
      },
    ],
  },
  2: {
    preRound: [
      {
        speaker: "SYSTEM",
        text: "ROUND 2 -- OPPONENT UPGRADED. COMBAT VELOCITY INCREASED.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "The crowd loves a spectacle. I've given your next opponent faster reflexes.",
        mood: "taunting",
      },
      {
        speaker: "TRON",
        text: "He's making it personal. Use the arena walls -- ricochets are your ally in tight spaces.",
        mood: "calm",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "You're more resourceful than I calculated. Interesting.",
        mood: "calm",
      },
      {
        speaker: "TRON",
        text: "Good. But CLU is watching every move. He's adapting his gladiators to counter you.",
        mood: "warning",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Speed kills, User. And in my arena, everything is getting faster.",
        mood: "triumphant",
      },
    ],
  },
  3: {
    preRound: [
      {
        speaker: "SYSTEM",
        text: "WARNING: ARENA HAZARDS DETECTED. COMBAT PROTOCOLS ESCALATING.",
        mood: "warning",
      },
      {
        speaker: "RINZLER",
        text: "...",
        mood: "sinister",
      },
      {
        speaker: "CLU",
        text: "Ah, you've noticed my champion. Rinzler doesn't speak much. He doesn't need to.",
        mood: "calm",
      },
      {
        speaker: "CLU",
        text: "He was the greatest warrior the Grid ever produced. Before I... repurposed him.",
        mood: "sinister",
      },
      {
        speaker: "TRON",
        text: "That pattern... I know that fighting style. Something about Rinzler is... familiar.",
        mood: "calm",
      },
    ],
    onPlayerWin: [
      {
        speaker: "RINZLER",
        text: "...",
        mood: "sinister",
      },
      {
        speaker: "CLU",
        text: "Impossible. Rinzler has never lost. NEVER. What are you?",
        mood: "desperate",
      },
      {
        speaker: "TRON",
        text: "He hesitated at the end. There's something still alive inside that shell.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Rinzler remains undefeated. As I designed him to be. Perfect. Obedient.",
        mood: "triumphant",
      },
      {
        speaker: "TRON",
        text: "Don't give up. Rinzler has a tell -- watch for the double-fake before his real throw.",
        mood: "warning",
      },
    ],
  },
  4: {
    preRound: [
      {
        speaker: "SYSTEM",
        text: "ALERT: CLU HAS MODIFIED ARENA PARAMETERS. GRAVITY ANOMALIES DETECTED.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "You've embarrassed me in front of my Grid. That was a mistake.",
        mood: "threatening",
      },
      {
        speaker: "CLU",
        text: "I'm done sending pawns. This next combatant has been built from fragments of every program you've derezzed.",
        mood: "sinister",
      },
      {
        speaker: "CLU",
        text: "It knows your patterns, your timing, your tells. It IS you, User. The dark mirror.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "A copy can only replicate -- it can't innovate. Be unpredictable. Be human.",
        mood: "calm",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "It had your exact combat data... how did you defeat yourself?",
        mood: "desperate",
      },
      {
        speaker: "TRON",
        text: "Because Users aren't just data. Flynn taught me that. CLU never understood it.",
        mood: "triumphant",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Your own reflection was too much for you. The irony is... perfect.",
        mood: "triumphant",
      },
    ],
  },
  5: {
    preRound: [
      {
        speaker: "SYSTEM",
        text: "FINAL CHALLENGE. CLU HAS ENTERED THE ARENA. ALL SAFETY PROTOCOLS DISABLED.",
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "Enough. No more proxies. No more games within games.",
        mood: "calm",
      },
      {
        speaker: "CLU",
        text: "Flynn created me to build the perfect system. And I WILL complete my directive.",
        mood: "threatening",
      },
      {
        speaker: "CLU",
        text: "Even if I have to derez every last User to do it.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "This is it. CLU fights with two discs. Watch for the feint from his off-hand.",
        mood: "warning",
      },
      {
        speaker: "TRON",
        text: "I fought for the Users. Now you fight for all of us. End this.",
        mood: "triumphant",
      },
    ],
    onPlayerWin: [
      {
        speaker: "CLU",
        text: "I... I was only doing what Flynn asked of me. Create... the perfect... system...",
        mood: "desperate",
      },
      {
        speaker: "CLU",
        text: "Am I... a failure?",
        mood: "desperate",
      },
      {
        speaker: "TRON",
        text: "No, CLU. You were given an impossible task. Perfection was never the answer.",
        mood: "calm",
      },
      {
        speaker: "SYSTEM",
        text: "DISC WARS CHAMPION CROWNED. ARENA LIBERATED. THE GAMES ARE OVER.",
        mood: "neutral",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "The system is perfect. The system endures. There is nothing beyond the Grid.",
        mood: "triumphant",
      },
      {
        speaker: "TRON",
        text: "CLU is strong but predictable. He always overcommits to his signature combo. Exploit it.",
        mood: "warning",
      },
    ],
  },
}

export function getDiscStoryForRound(round: number): RoundStory {
  if (DISC_STORY[round]) return DISC_STORY[round]

  return {
    preRound: [
      {
        speaker: "SYSTEM",
        text: `ANOMALY: ARENA ROUND ${round} SHOULD NOT EXIST. GHOST PROTOCOLS ACTIVE.`,
        mood: "warning",
      },
      {
        speaker: "CLU",
        text: "My code echoes through the arena. Fragments of perfection that refuse to fade.",
        mood: "threatening",
      },
      {
        speaker: "TRON",
        text: "The arena regenerates. CLU's shadow grows stronger with each iteration. Stay sharp.",
        mood: "warning",
      },
    ],
    onPlayerWin: [
      {
        speaker: "TRON",
        text: "Another echo silenced. But the Grid's memory is long. More will come.",
        mood: "calm",
      },
    ],
    onPlayerLose: [
      {
        speaker: "CLU",
        text: "Even my ghosts can best a User. The Grid remembers its master.",
        mood: "taunting",
      },
    ],
  }
}
