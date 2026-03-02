'use client';

import { Player, GameState } from './use-multiplayer-game';

interface AIConfig {
  lookahead: number;
  aggressiveness: number;
  teamAwareness: number;
  powerUpPriority: number;
}

export function useCLUAI(config: AIConfig) {
  const getAIDirection = (
    player: Player,
    gameState: GameState,
    allPlayers: Player[]
  ): 'up' | 'down' | 'left' | 'right' => {
    const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
    
    // Get opposite of current direction (can't reverse directly)
    const opposite = getOppositeDirection(player.direction);

    // Score each direction
    let bestDirection = player.direction;
    let bestScore = -Infinity;

    for (const dir of directions) {
      if (dir === opposite) continue; // Can't reverse

      let score = 0;

      // 1. Check for collisions ahead (avoid trails)
      const safetyScore = checkPathSafety(
        player.x,
        player.y,
        dir,
        gameState,
        config.lookahead
      );
      score += safetyScore * 100;

      // 2. Priority: Chase nearest enemy
      const enemyScore = calculateEnemyChaseScore(
        player,
        dir,
        allPlayers,
        gameState
      );
      score += enemyScore * 50 * config.aggressiveness;

      // 3. Priority: Seek power-ups
      const powerUpScore = calculatePowerUpScore(
        player.x,
        player.y,
        dir,
        gameState.powerUps,
        config.powerUpPriority
      );
      score += powerUpScore * 30;

      // 4. Team tactics: Support teammates
      const teamScore = calculateTeamTacticsScore(
        player,
        dir,
        allPlayers,
        gameState,
        config.teamAwareness
      );
      score += teamScore * 40;

      // 5. Spatial awareness: Prefer center of available space
      const spaceScore = calculateSpaceScore(
        player.x,
        player.y,
        dir,
        gameState
      );
      score += spaceScore * 20;

      if (score > bestScore) {
        bestScore = score;
        bestDirection = dir;
      }
    }

    return bestDirection;
  };

  const checkPathSafety = (
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right',
    gameState: GameState,
    lookahead: number
  ): number => {
    let currentX = x;
    let currentY = y;
    let safeDistance = 0;

    for (let i = 0; i < lookahead; i++) {
      const nextPos = getNextPosition(currentX, currentY, direction, gameState.gridWidth, gameState.gridHeight);
      currentX = nextPos.x;
      currentY = nextPos.y;

      const posKey = `${currentX},${currentY}`;
      if (gameState.allTrails.has(posKey)) {
        // Hit a trail
        return safeDistance / lookahead;
      }

      safeDistance = i + 1;
    }

    return 1.0; // Path is safe
  };

  const calculateEnemyChaseScore = (
    player: Player,
    direction: 'up' | 'down' | 'left' | 'right',
    allPlayers: Player[],
    gameState: GameState
  ): number => {
    const enemies = allPlayers.filter(
      (p) => p.alive && p.teamId !== player.teamId
    );

    if (enemies.length === 0) return 0;

    // Find closest enemy
    let closestDistance = Infinity;
    let closestEnemy: Player | null = null;

    for (const enemy of enemies) {
      const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }

    if (!closestEnemy) return 0;

    // Calculate if moving in this direction brings us closer
    const nextPos = getNextPosition(player.x, player.y, direction, gameState.gridWidth, gameState.gridHeight);
    const newDistance = Math.hypot(closestEnemy.x - nextPos.x, closestEnemy.y - nextPos.y);
    const improvement = closestDistance - newDistance;

    return improvement / (closestDistance + 1);
  };

  const calculatePowerUpScore = (
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right',
    powerUps: any[],
    priority: number
  ): number => {
    if (powerUps.length === 0 || priority === 0) return 0;

    const nextPos = getNextPosition(x, y, direction, 100, 100);
    let bestScore = 0;

    for (const powerUp of powerUps) {
      const distance = Math.hypot(powerUp.x - nextPos.x, powerUp.y - nextPos.y);
      const score = 1 / (distance + 1);
      bestScore = Math.max(bestScore, score);
    }

    return bestScore * priority;
  };

  const calculateTeamTacticsScore = (
    player: Player,
    direction: 'up' | 'down' | 'left' | 'right',
    allPlayers: Player[],
    gameState: GameState,
    teamAwareness: number
  ): number => {
    if (teamAwareness === 0) return 0;

    const teammates = allPlayers.filter(
      (p) => p.alive && p.teamId === player.teamId && p.id !== player.id
    );

    if (teammates.length === 0) return 0;

    // Favor formations that protect teammates
    let protectionScore = 0;
    for (const teammate of teammates) {
      const distance = Math.hypot(teammate.x - player.x, teammate.y - player.y);
      if (distance < 10) {
        // Close teammate - consider protecting them
        protectionScore += (10 - distance) / 10;
      }
    }

    return protectionScore / teammates.length;
  };

  const calculateSpaceScore = (
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right',
    gameState: GameState
  ): number => {
    const nextPos = getNextPosition(x, y, direction, gameState.gridWidth, gameState.gridHeight);
    
    // Count available moves from next position
    const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
    let availableMoves = 0;

    for (const dir of directions) {
      const checkPos = getNextPosition(nextPos.x, nextPos.y, dir, gameState.gridWidth, gameState.gridHeight);
      if (!gameState.allTrails.has(`${checkPos.x},${checkPos.y}`)) {
        availableMoves++;
      }
    }

    return availableMoves / 4; // Normalized to 0-1
  };

  const getNextPosition = (
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right',
    gridWidth: number,
    gridHeight: number
  ) => {
    let newX = x;
    let newY = y;

    switch (direction) {
      case 'up':
        newY = (newY - 1 + gridHeight) % gridHeight;
        break;
      case 'down':
        newY = (newY + 1) % gridHeight;
        break;
      case 'left':
        newX = (newX - 1 + gridWidth) % gridWidth;
        break;
      case 'right':
        newX = (newX + 1) % gridWidth;
        break;
    }

    return { x: newX, y: newY };
  };

  const getOppositeDirection = (
    direction: 'up' | 'down' | 'left' | 'right'
  ): 'up' | 'down' | 'left' | 'right' => {
    switch (direction) {
      case 'up':
        return 'down';
      case 'down':
        return 'up';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
    }
  };

  return { getAIDirection };
}
