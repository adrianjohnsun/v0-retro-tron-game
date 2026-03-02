'use client';

import { useState, useCallback } from 'react';

export interface Player {
  id: number;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right';
  alive: boolean;
  trails: Set<string>;
  color: string;
}

export interface GameState {
  players: Player[];
  gridWidth: number;
  gridHeight: number;
  gameActive: boolean;
  allTrails: Map<string, boolean>;
}

interface UseMultiplayerGameProps {
  mode: '1v1' | '3v3' | '5v5';
  gridWidth: number;
  gridHeight: number;
  level: number;
  onGameOver: (survivors: number[]) => void;
}

export function useMultiplayerGame({
  mode,
  gridWidth,
  gridHeight,
  level,
  onGameOver,
}: UseMultiplayerGameProps) {
  const getInitialPlayers = (): Player[] => {
    const players: Player[] = [];

    if (mode === '1v1') {
      players.push(
        {
          id: 0,
          x: Math.floor(gridWidth * 0.25),
          y: Math.floor(gridHeight * 0.5),
          direction: 'right',
          nextDirection: 'right',
          alive: true,
          trails: new Set(),
          color: '#00FF00',
        },
        {
          id: 1,
          x: Math.floor(gridWidth * 0.75),
          y: Math.floor(gridHeight * 0.5),
          direction: 'left',
          nextDirection: 'left',
          alive: true,
          trails: new Set(),
          color: '#FF6600',
        }
      );
    } else if (mode === '3v3') {
      for (let i = 0; i < 3; i++) {
        players.push({
          id: i,
          x: Math.floor(gridWidth * 0.2),
          y: Math.floor(gridHeight * (0.25 + i * 0.25)),
          direction: 'right',
          nextDirection: 'right',
          alive: true,
          trails: new Set(),
          color: '#00FF00',
        });
      }
      for (let i = 0; i < 3; i++) {
        players.push({
          id: 3 + i,
          x: Math.floor(gridWidth * 0.8),
          y: Math.floor(gridHeight * (0.25 + i * 0.25)),
          direction: 'left',
          nextDirection: 'left',
          alive: true,
          trails: new Set(),
          color: '#FF6600',
        });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        players.push({
          id: i,
          x: Math.floor(gridWidth * 0.15),
          y: Math.floor(gridHeight * (0.1 + i * 0.2)),
          direction: 'right',
          nextDirection: 'right',
          alive: true,
          trails: new Set(),
          color: '#00FF00',
        });
      }
      for (let i = 0; i < 5; i++) {
        players.push({
          id: 5 + i,
          x: Math.floor(gridWidth * 0.85),
          y: Math.floor(gridHeight * (0.1 + i * 0.2)),
          direction: 'left',
          nextDirection: 'left',
          alive: true,
          trails: new Set(),
          color: '#FF6600',
        });
      }
    }

    return players;
  };

  const [gameState, setGameState] = useState<GameState>({
    players: getInitialPlayers(),
    gridWidth,
    gridHeight,
    gameActive: true,
    allTrails: new Map(),
  });

  const setPlayerDirection = useCallback(
    (playerId: number, direction: 'up' | 'down' | 'left' | 'right') => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === playerId ? { ...p, nextDirection: direction } : p
        ),
      }));
    },
    []
  );

  const updateGame = useCallback(() => {
    setGameState((prev) => {
      if (!prev.gameActive) return prev;

      const newTrails = new Map(prev.allTrails);
      const newPlayers = prev.players.map((player) => {
        if (!player.alive) return player;

        const newPlayer = { ...player, direction: player.nextDirection };
        let { x, y } = newPlayer;

        switch (newPlayer.direction) {
          case 'up':
            y = (y - 1 + prev.gridHeight) % prev.gridHeight;
            break;
          case 'down':
            y = (y + 1) % prev.gridHeight;
            break;
          case 'left':
            x = (x - 1 + prev.gridWidth) % prev.gridWidth;
            break;
          case 'right':
            x = (x + 1) % prev.gridWidth;
            break;
        }

        newPlayer.x = x;
        newPlayer.y = y;

        const posKey = `${x},${y}`;

        if (newTrails.has(posKey)) {
          newPlayer.alive = false;
        } else {
          newPlayer.trails.add(posKey);
          newTrails.set(posKey, true);
        }

        return newPlayer;
      });

      const alivePlayers = newPlayers.filter((p) => p.alive);

      if (alivePlayers.length <= 1 && !prev.gameActive === false) {
        const survivors = alivePlayers.map((p) => p.id);
        setTimeout(() => onGameOver(survivors), 0);
        return {
          ...prev,
          players: newPlayers,
          allTrails: newTrails,
          gameActive: false,
        };
      }

      return {
        ...prev,
        players: newPlayers,
        allTrails: newTrails,
      };
    });
  }, [onGameOver]);

  return {
    gameState,
    setPlayerDirection,
    updateGame,
  };
}
