'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface Player {
  id: number;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right';
  alive: boolean;
  teamId: number;
  trails: Set<string>;
  color: string;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'speed' | 'shield' | 'bomb' | 'freeze';
  expiresAt: number;
}

export interface GameState {
  players: Player[];
  powerUps: PowerUp[];
  gridWidth: number;
  gridHeight: number;
  gameActive: boolean;
  level: number;
  teamScores: Record<number, number>;
  allTrails: Map<string, number>; // position -> teamId who owns it
}

interface UseMultiplayerGameProps {
  mode: '1v1' | '3v3' | '5v5';
  gridWidth: number;
  gridHeight: number;
  level: number;
  onGameOver: (winners: number[]) => void;
}

export function useMultiplayerGame({
  mode,
  gridWidth,
  gridHeight,
  level,
  onGameOver,
}: UseMultiplayerGameProps) {
  const speedMultiplier = useRef(1 + level * 0.15);
  const powerUpCounter = useRef(0);

  const getPlayerConfigs = useCallback(
    (gameMode: '1v1' | '3v3' | '5v5') => {
      const configs: Array<{
        id: number;
        teamId: number;
        startX: number;
        startY: number;
        startDirection: 'up' | 'down' | 'left' | 'right';
        color: string;
      }> = [];

      if (gameMode === '1v1') {
        configs.push(
          {
            id: 0,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.25),
            startY: Math.floor(gridHeight * 0.5),
            startDirection: 'right',
            color: '#00FF00', // User - Cyan
          },
          {
            id: 1,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.75),
            startY: Math.floor(gridHeight * 0.5),
            startDirection: 'left',
            color: '#FF6600', // CLU - Orange
          }
        );
      } else if (gameMode === '3v3') {
        const userTeam = [
          {
            id: 0,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.2),
            startY: Math.floor(gridHeight * 0.3),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
          {
            id: 1,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.2),
            startY: Math.floor(gridHeight * 0.5),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
          {
            id: 2,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.2),
            startY: Math.floor(gridHeight * 0.7),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
        ];
        const cluTeam = [
          {
            id: 3,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.8),
            startY: Math.floor(gridHeight * 0.3),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
          {
            id: 4,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.8),
            startY: Math.floor(gridHeight * 0.5),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
          {
            id: 5,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.8),
            startY: Math.floor(gridHeight * 0.7),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
        ];
        configs.push(...userTeam, ...cluTeam);
      } else if (gameMode === '5v5') {
        const userTeam = [
          {
            id: 0,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.15),
            startY: Math.floor(gridHeight * 0.2),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
          {
            id: 1,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.15),
            startY: Math.floor(gridHeight * 0.4),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
          {
            id: 2,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.15),
            startY: Math.floor(gridHeight * 0.5),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
          {
            id: 3,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.15),
            startY: Math.floor(gridHeight * 0.6),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
          {
            id: 4,
            teamId: 0,
            startX: Math.floor(gridWidth * 0.15),
            startY: Math.floor(gridHeight * 0.8),
            startDirection: 'right' as const,
            color: '#00FF00',
          },
        ];
        const cluTeam = [
          {
            id: 5,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.85),
            startY: Math.floor(gridHeight * 0.2),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
          {
            id: 6,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.85),
            startY: Math.floor(gridHeight * 0.4),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
          {
            id: 7,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.85),
            startY: Math.floor(gridHeight * 0.5),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
          {
            id: 8,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.85),
            startY: Math.floor(gridHeight * 0.6),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
          {
            id: 9,
            teamId: 1,
            startX: Math.floor(gridWidth * 0.85),
            startY: Math.floor(gridHeight * 0.8),
            startDirection: 'left' as const,
            color: '#FF6600',
          },
        ];
        configs.push(...userTeam, ...cluTeam);
      }

      return configs;
    },
    [gridWidth, gridHeight]
  );

  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState: GameState = {
      players: [],
      powerUps: [],
      gridWidth,
      gridHeight,
      gameActive: true,
      level,
      teamScores: {},
      allTrails: new Map(),
    };

    // Initialize players based on mode
    const playerConfigs = getPlayerConfigs(mode);
    initialState.players = playerConfigs.map((config) => ({
      id: config.id,
      x: config.startX,
      y: config.startY,
      direction: config.startDirection,
      nextDirection: config.startDirection,
      alive: true,
      teamId: config.teamId,
      trails: new Set(),
      color: config.color,
    }));

    // Initialize team scores
    playerConfigs.forEach((config) => {
      if (!initialState.teamScores[config.teamId]) {
        initialState.teamScores[config.teamId] = 0;
      }
    });

    return initialState;
  });

  const setPlayerDirection = useCallback((playerId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, nextDirection: direction } : p
      ),
    }));
  }, []);

  const spawnPowerUps = useCallback(() => {
    powerUpCounter.current++;
    if (powerUpCounter.current % 30 === 0) {
      const x = Math.floor(Math.random() * gridWidth);
      const y = Math.floor(Math.random() * gridHeight);
      const types: Array<'speed' | 'shield' | 'bomb' | 'freeze'> = ['speed', 'shield', 'bomb', 'freeze'];
      const type = types[Math.floor(Math.random() * types.length)];

      setGameState((prev) => ({
        ...prev,
        powerUps: [
          ...prev.powerUps,
          {
            id: `${Date.now()}-${Math.random()}`,
            x,
            y,
            type,
            expiresAt: Date.now() + 10000,
          },
        ],
      }));
    }
  }, [gridWidth, gridHeight]);

  const updateGame = useCallback(() => {
    setGameState((prev) => {
      if (!prev.gameActive) return prev;

      const newState = { ...prev };
      const now = Date.now();

      // Remove expired power-ups
      newState.powerUps = newState.powerUps.filter((p) => p.expiresAt > now);

      // Update player positions
      const newPlayers = newState.players.map((player) => {
        if (!player.alive) return player;

        // Determine actual direction
        const direction = player.nextDirection;
        let newX = player.x;
        let newY = player.y;

        // Move based on level speed
        if (Math.random() > (1 - speedMultiplier.current * 0.05)) {
          switch (direction) {
            case 'up':
              newY = (newY - 1 + prev.gridHeight) % prev.gridHeight;
              break;
            case 'down':
              newY = (newY + 1) % prev.gridHeight;
              break;
            case 'left':
              newX = (newX - 1 + prev.gridWidth) % prev.gridWidth;
              break;
            case 'right':
              newX = (newX + 1) % prev.gridWidth;
              break;
          }
        }

        const posKey = `${newX},${newY}`;

        // Check collision with existing trails
        let alive = !newState.allTrails.has(posKey);

        // Add to trails
        const newTrails = new Set(player.trails);
        newTrails.add(posKey);

        return {
          ...player,
          x: newX,
          y: newY,
          direction,
          alive,
          trails: newTrails,
        };
      });

      // Rebuild trails map
      const newAllTrails = new Map<string, number>();
      newPlayers.forEach((player) => {
        player.trails.forEach((pos) => {
          newAllTrails.set(pos, player.teamId);
        });
      });

      newState.players = newPlayers;
      newState.allTrails = newAllTrails;

      // Check win condition
      const aliveTeams = new Set(newState.players.filter((p) => p.alive).map((p) => p.teamId));
      if (aliveTeams.size <= 1) {
        newState.gameActive = false;
        const winners = Array.from(aliveTeams);
        onGameOver(winners);
      }

      return newState;
    });

    spawnPowerUps();
  }, [onGameOver, spawnPowerUps]);

  return {
    gameState,
    setPlayerDirection,
    updateGame,
  };
}
