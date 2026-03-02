'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameLoop } from '@/hooks/use-game-loop';
import { useMultiplayerGame } from '@/hooks/use-multiplayer-game';
import { CluFace } from './clu-face';
import { Button } from '@/components/ui/button';

const GRID_WIDTH = 80;
const GRID_HEIGHT = 50;
const CELL_SIZE = 12;

type GamePhase = 'MODE_SELECT' | 'INTRO' | 'PLAYING' | 'GAME_OVER';

const playSound = (freq: number, type: OscillatorType = 'square', duration = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context error
  }
};

export function TronGame() {
  const [phase, setPhase] = useState<GamePhase>('MODE_SELECT');
  const [gameMode, setGameMode] = useState<'1v1' | '3v3' | '5v5' | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { gameState, setPlayerDirection, updateGame } = useMultiplayerGame({
    mode: gameMode || '1v1',
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    level: difficulty,
    onGameOver: () => {
      playSound(100, 'sawtooth');
      playSound(50, 'square');
      setPhase('GAME_OVER');
    },
  });

  useGameLoop(() => {
    if (phase === 'PLAYING') {
      updateGame();
    }
  }, phase === 'PLAYING');

  useEffect(() => {
    if (phase !== 'PLAYING') {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      return;
    }

    updateIntervalRef.current = setInterval(() => {
      updateGame();
    }, 50);

    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [phase, updateGame]);

  useEffect(() => {
    if (phase === 'INTRO' && gameMode) {
      initIntro();
    }
  }, [phase, gameMode]);

  const initIntro = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const introText =
      difficulty === 1
        ? "I'm going to create a perfect system. And you, User... you are an imperfection."
        : `Sector ${difficulty} advanced. Your persistence is irrelevant. The Grid belongs to CLU.`;

    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < introText.length) {
        setDisplayedText((prev) => prev + introText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50);
  };

  const handleModeSelect = (mode: '1v1' | '3v3' | '5v5') => {
    setGameMode(mode);
    setPhase('INTRO');
  };

  const startMatch = () => {
    playSound(440, 'square', 0.1);
    setTimeout(() => playSound(880, 'square', 0.1), 100);
    setPhase('PLAYING');
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'PLAYING') return;

      const userPlayerId = 0;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'up');
          playSound(220, 'triangle', 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'down');
          playSound(220, 'triangle', 0.05);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'left');
          playSound(220, 'triangle', 0.05);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPlayerDirection(userPlayerId, 'right');
          playSound(220, 'triangle', 0.05);
          break;
      }
    },
    [phase, setPlayerDirection]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const audio = new Audio(
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.storage.googleapis.com/tron_music-Wv1y8OGJ.mp3'
    );
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  if (phase === 'MODE_SELECT') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-mono font-press-start text-cyan-400 glitch-text">TRON</h1>
          <p className="text-cyan-300 font-mono text-lg">SELECT GAME MODE</p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            {[
              { mode: '1v1' as const, label: '1 vs 1', desc: 'Solo Challenge' },
              { mode: '3v3' as const, label: '3 vs 3', desc: 'Team Battle' },
              { mode: '5v5' as const, label: '5 vs 5', desc: 'Full Legion' },
            ].map((item) => (
              <button
                key={item.mode}
                onClick={() => handleModeSelect(item.mode)}
                className="border-2 border-cyan-400 bg-black px-6 py-8 hover:bg-cyan-400 hover:text-black transition-all font-mono font-press-start text-lg"
              >
                <div>{item.label}</div>
                <div className="text-xs mt-2">{item.desc}</div>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-cyan-300 font-mono text-sm">DIFFICULTY</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`w-10 h-10 border-2 font-mono font-press-start text-xs ${
                    difficulty === d
                      ? 'border-cyan-400 bg-cyan-400 text-black'
                      : 'border-cyan-400 bg-black text-cyan-400 hover:bg-cyan-400 hover:text-black'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'INTRO') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="space-y-8 max-w-2xl">
          <CluFace displayedText={displayedText} isTyping={isTyping} />
          <p className="text-cyan-300 font-mono text-center h-24">{displayedText}</p>
          <Button
            onClick={startMatch}
            disabled={isTyping}
            className="w-full border-2 border-cyan-400 bg-black text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono font-press-start"
          >
            ACKNOWLEDGE
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'GAME_OVER') {
    const alivePlayers = gameState.players.filter((p) => p.alive);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-mono font-press-start text-orange-500">
            {alivePlayers.length === 0 ? 'DRAW' : alivePlayers[0].color === '#00FF00' ? 'USER WINS' : 'CLU WINS'}
          </h1>
          <Button
            onClick={() => {
              setPhase('MODE_SELECT');
              setGameMode(null);
              setDisplayedText('');
            }}
            className="border-2 border-cyan-400 bg-black text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono font-press-start"
          >
            RETURN TO MENU
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-2 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none scanlines"></div>
      <div className="relative z-10">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
            gap: '1px',
            backgroundColor: '#000',
            border: '2px solid #00FF00',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
          }}
        >
          {Array.from({ length: GRID_HEIGHT }).map((_, y) =>
            Array.from({ length: GRID_WIDTH }).map((_, x) => {
              const player = gameState.players.find((p) => p.x === x && p.y === y);
              const isTrail = gameState.allTrails.has(`${x},${y}`);
              
              let bgColor = 'bg-gray-900';
              let glassEffect = 'none';
              let glowColor = 'none';

              if (player) {
                const isUser = player.color === '#00FF00';
                bgColor = isUser ? 'bg-green-500' : 'bg-orange-500';
                glassEffect = `linear-gradient(135deg, 
                  ${isUser ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 102, 0, 0.8)'} 0%,
                  ${isUser ? 'rgba(0, 200, 150, 0.5)' : 'rgba(200, 80, 0, 0.5)'} 50%,
                  ${isUser ? 'rgba(0, 255, 100, 0.3)' : 'rgba(255, 120, 0, 0.3)'} 100%)`;
                glowColor = isUser ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 102, 0, 0.6)';
              } else if (isTrail) {
                bgColor = 'bg-cyan-800';
                glassEffect = `linear-gradient(135deg, 
                  rgba(0, 150, 200, 0.4) 0%,
                  rgba(0, 100, 150, 0.2) 100%)`;
                glowColor = 'rgba(0, 200, 255, 0.3)';
              }

              return (
                <div
                  key={`${x},${y}`}
                  className={`w-full h-full ${bgColor} relative overflow-hidden`}
                  style={{
                    background: glassEffect !== 'none' ? glassEffect : undefined,
                    boxShadow: glowColor !== 'none' 
                      ? `inset 0 0 8px ${glowColor}, 0 0 12px ${glowColor}` 
                      : 'none',
                    backdropFilter: player ? 'blur(0.5px)' : 'none',
                  }}
                >
                  {/* Glass reflection effect */}
                  {player && (
                    <div
                      className="absolute top-0 left-0 w-full h-1/2 opacity-30"
                      style={{
                        background: `linear-gradient(180deg, 
                          rgba(255, 255, 255, 0.4) 0%,
                          rgba(255, 255, 255, 0) 100%)`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8 text-center space-y-4 text-cyan-400 font-mono">
        <div>SECTOR: {difficulty}</div>
        <div>PLAYERS ALIVE: {gameState.players.filter((p) => p.alive).length}</div>
        <div className="text-xs">ARROW KEYS TO MOVE</div>
      </div>
    </div>
  );
}
