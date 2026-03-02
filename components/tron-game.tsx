'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameLoop } from '@/hooks/use-game-loop';
import { useMultiplayerGame, Player as MultiPlayer, GameState } from '@/hooks/use-multiplayer-game';
import { useCLUAI } from '@/hooks/use-clu-ai';
import { LightCycleDetailed } from './light-cycle-detailed';
import { ModeSelector } from './mode-selector';
import { ArenaLayer, ArenaType } from './arena-layer';
import { PowerUp } from './power-up';
import { CluFace } from './clu-face';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Shield } from 'lucide-react';

const GRID_WIDTH = 80;
const GRID_HEIGHT = 50;
const CELL_SIZE = 12;

type GamePhase = 'MODE_SELECT' | 'INTRO' | 'PLAYING' | 'GAME_OVER';

const playSound = (freq: number, type: OscillatorType = 'square', duration = 0.1, volume = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.log('[v0] Audio failed:', e);
  }
};

export function TronGame() {
  const [phase, setPhase] = useState<GamePhase>('MODE_SELECT');
  const [gameMode, setGameMode] = useState<'1v1' | '3v3' | '5v5' | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [arenaType, setArenaType] = useState<ArenaType>('standard');
  const [winners, setWinners] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastAIUpdateRef = useRef<number>(0);

  const { gameState, setPlayerDirection, updateGame } = useMultiplayerGame({
    mode: gameMode || '1v1',
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    level: difficulty,
    onGameOver: (winners) => {
      playSound(100, 'sawtooth', 0.8, 0.3);
      playSound(50, 'square', 1.0, 0.4);
      triggerGlitch();
      setWinners(winners);
      setPhase('GAME_OVER');
    },
  });

  const { getAIDirection } = useCLUAI({
    lookahead: 8 + difficulty * 2,
    aggressiveness: 0.5 + difficulty * 0.1,
    teamAwareness: 0.8,
    powerUpPriority: 0.7,
  });

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.storage.googleapis.com/tron_music-Wv1y8OGJ.mp3'
    );
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  const triggerGlitch = () => {
    setIsGlitching(true);
    playSound(60, 'sawtooth', 0.2, 0.2);
    setTimeout(() => setIsGlitching(false), 200);
  };

  const getArenaType = (level: number): ArenaType => {
    if (level <= 2) return 'standard';
    if (level <= 4) return 'basement';
    if (level <= 6) return 'portal';
    return 'industrial';
  };

  const handleModeSelect = (mode: '1v1' | '3v3' | '5v5') => {
    setGameMode(mode);
    setPhase('INTRO');
    initIntro(mode);
  };

  const handleDifficultySelect = (diff: number) => {
    setDifficulty(diff);
  };

  const initIntro = (mode: '1v1' | '3v3' | '5v5') => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const introText =
      difficulty === 1
        ? "I'm going to create a perfect system. And you, User... you are an imperfection."
        : `Sector advanced. Your persistence is irrelevant. The Grid belongs to CLU.`;

    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + introText.charAt(i));
      i++;
      if (i >= introText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50);
  };

  const startMatch = () => {
    playSound(440, 'square', 0.1);
    setTimeout(() => playSound(880, 'square', 0.1), 100);
    setPhase('PLAYING');
    setArenaType(getArenaType(difficulty));
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'PLAYING' || !gameMode) return;

      const userPlayerId = 0;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'up');
          playSound(220, 'triangle', 0.05, 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'down');
          playSound(220, 'triangle', 0.05, 0.05);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'left');
          playSound(220, 'triangle', 0.05, 0.05);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'right');
          playSound(220, 'triangle', 0.05, 0.05);
          break;
      }
    },
    [phase, gameMode, setPlayerDirection]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // AI Updates
  useGameLoop((delta) => {
    lastAIUpdateRef.current += delta;
    if (lastAIUpdateRef.current > 100) {
      lastAIUpdateRef.current = 0;

      // Update AI for CLU team (team 1)
      gameState.players.forEach((player) => {
        if (player.alive && player.teamId === 1) {
          const direction = getAIDirection(player, gameState, gameState.players);
          setPlayerDirection(player.id, direction);
        }
      });
    }
  }, phase === 'PLAYING');

  // Game updates
  useGameLoop(() => {
    lastUpdateRef.current += Date.now();
    if (lastUpdateRef.current % 80 === 0) {
      updateGame();
    }
  }, phase === 'PLAYING');

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-black font-mono relative overflow-hidden text-white cursor-none ${
        isGlitching ? 'glitch-flash' : ''
      }`}
    >
      <div className="crt-overlay" />
      <div className="noise-overlay" />
      <div className="scanline" />

      {phase === 'MODE_SELECT' && (
        <ModeSelector onModeSelect={handleModeSelect} onDifficultySelect={handleDifficultySelect} />
      )}

      {phase === 'INTRO' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-8 p-12 max-w-2xl">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-orange-600/10 blur-3xl rounded-full" />
              <CluFace isSpeaking={isTyping} color="#ff8c00" />
            </div>

            <h2 className="text-orange-400 text-2xl font-bold tracking-widest">INITIATE SEQUENCE</h2>
            <div className="h-20 max-w-md">
              <p className="text-orange-300/80 text-sm leading-relaxed font-mono">{displayedText}</p>
            </div>
            <Button
              onClick={startMatch}
              disabled={isTyping}
              className={`bg-orange-600 text-black hover:bg-orange-500 px-10 py-4 font-bold tracking-widest ${
                !isTyping ? 'animate-pulse' : 'opacity-50'
              }`}
            >
              {isTyping ? 'PROCESSING...' : 'ACKNOWLEDGE'}
            </Button>
          </div>
        </div>
      )}

      {(phase === 'PLAYING' || phase === 'GAME_OVER') && (
        <>
          {/* Header */}
          <div className="absolute top-6 left-6 z-10 hidden md:block">
            <div className="p-4 border border-cyan-500/30 bg-black/40 backdrop-blur-sm space-y-2">
              <div className="text-[8px] text-cyan-500/60 animate-pulse tracking-widest">TRON_ARENA_v2.0</div>
              <div className="text-lg font-bold text-cyan-400 tron-glow">{gameMode?.toUpperCase()} MATCH</div>
              <div className="h-0.5 w-full bg-cyan-500/20" />
              <div className="text-[10px] text-cyan-400">DIFFICULTY: {difficulty}</div>
              <div className="text-[10px] text-cyan-400">PLAYERS: {gameState.players.length}</div>
            </div>
          </div>

          {/* Arena */}
          <div
            className="relative tron-border rounded-sm overflow-hidden z-20 mt-12"
            style={{
              width: GRID_WIDTH * CELL_SIZE,
              height: GRID_HEIGHT * CELL_SIZE,
            }}
          >
            {/* Arena background */}
            <svg
              width={GRID_WIDTH * CELL_SIZE}
              height={GRID_HEIGHT * CELL_SIZE}
              className="absolute inset-0"
            >
              <defs>
                <linearGradient id="arena-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(0, 30, 60, 0.5)" />
                  <stop offset="100%" stopColor="rgba(0, 10, 30, 0.8)" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#arena-grad)" />
            </svg>

            <ArenaLayer type={arenaType} level={difficulty} gridWidth={GRID_WIDTH} gridHeight={GRID_HEIGHT} cellSize={CELL_SIZE} />

            {/* Power-ups */}
            <svg width={GRID_WIDTH * CELL_SIZE} height={GRID_HEIGHT * CELL_SIZE} className="absolute inset-0 z-5">
              {gameState.powerUps.map((powerUp) => (
                <PowerUp key={powerUp.id} x={powerUp.x} y={powerUp.y} type={powerUp.type} cellSize={CELL_SIZE} />
              ))}
            </svg>

            {/* Trails */}
            {gameState.players.map((player) => (
              <svg key={`trails-${player.id}`} width={GRID_WIDTH * CELL_SIZE} height={GRID_HEIGHT * CELL_SIZE} className="absolute inset-0 z-10">
                {Array.from(player.trails).map((posKey, i) => {
                  const [x, y] = posKey.split(',').map(Number);
                  return (
                    <rect
                      key={`trail-${i}`}
                      x={x * CELL_SIZE}
                      y={y * CELL_SIZE}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={player.color}
                      opacity="0.7"
                      style={{ boxShadow: `0 0 8px ${player.color}` }}
                    />
                  );
                })}
              </svg>
            ))}

            {/* Light Cycles */}
            {gameState.players.map((player) => (
              <svg key={`cycle-${player.id}`} width={GRID_WIDTH * CELL_SIZE} height={GRID_HEIGHT * CELL_SIZE} className="absolute inset-0 z-15">
                {player.alive && (
                  <LightCycleDetailed
                    x={player.x}
                    y={player.y}
                    direction={player.direction}
                    color={player.color}
                    teamId={player.teamId}
                    isUser={player.id === 0}
                  />
                )}
              </svg>
            ))}

            {/* Game Over Overlay */}
            {phase === 'GAME_OVER' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-50">
                <Trophy className="w-16 h-16 mb-4 text-cyan-400" />
                <h2 className="text-4xl font-bold mb-6 text-cyan-400 tron-glow">
                  {winners.includes(0) ? 'USER_VICTORY' : 'PROGRAM_WINS'}
                </h2>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setPhase('MODE_SELECT')}
                    variant="outline"
                    className="border-cyan-400/40 text-cyan-400/60 hover:text-cyan-400"
                  >
                    RETURN TO MENU
                  </Button>
                  {winners.includes(0) && (
                    <Button onClick={() => { setDifficulty(difficulty + 1); initIntro(gameMode!); }} className="bg-cyan-400 text-black hover:bg-cyan-500 px-8 py-6 text-xl font-bold">
                      NEXT SECTOR
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Player Status */}
          <div className="mt-8 flex gap-16 z-10">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className={`flex flex-col items-center gap-3 p-4 border-b-4 transition-all ${
                  player.alive ? `border-[${player.color}] opacity-100` : 'border-white/10 opacity-30'
                }`}
                style={{
                  borderColor: player.alive ? player.color : 'rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: player.color }} />
                  <span className="font-bold tracking-widest text-lg" style={{ color: player.color }}>
                    TEAM_{player.teamId}_{player.id}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Shield key={i} className="w-3 h-3" style={{ color: `${player.color}99` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="absolute bottom-6 left-6 flex items-center gap-3 text-[10px] text-cyan-400/40 uppercase tracking-[0.3em] z-10">
        <div className="animate-pulse w-2 h-2 bg-cyan-400 rounded-full" />
        System Status: Optimal | Data Stream: Secure
      </div>
    </div>
  );
}
