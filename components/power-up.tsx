'use client';

import React from 'react';

interface PowerUpProps {
  x: number;
  y: number;
  type: 'speed' | 'shield' | 'bomb' | 'freeze';
  cellSize: number;
  pulsing?: boolean;
}

export const PowerUp: React.FC<PowerUpProps> = ({
  x,
  y,
  type,
  cellSize,
  pulsing = true,
}) => {
  const px = x * cellSize;
  const py = y * cellSize;

  const getStyle = () => {
    switch (type) {
      case 'speed':
        return {
          color: '#FFFF00',
          symbol: '⚡',
          glow: 'rgba(255, 255, 0, 0.6)',
        };
      case 'shield':
        return {
          color: '#00FF00',
          symbol: '⊕',
          glow: 'rgba(0, 255, 0, 0.6)',
        };
      case 'bomb':
        return {
          color: '#FF3300',
          symbol: '◆',
          glow: 'rgba(255, 51, 0, 0.6)',
        };
      case 'freeze':
        return {
          color: '#00FFFF',
          symbol: '❄',
          glow: 'rgba(0, 255, 255, 0.6)',
        };
    }
  };

  const style = getStyle();

  return (
    <g
      transform={`translate(${px + cellSize / 2}, ${py + cellSize / 2})`}
      opacity={pulsing ? undefined : 1}
      style={pulsing ? { animation: 'pulse-powerup 1.5s ease-in-out infinite' } : undefined}
    >
      {/* Outer pulsing ring */}
      <circle
        cx="0"
        cy="0"
        r="5"
        fill="none"
        stroke={style.color}
        strokeWidth="1"
        opacity="0.8"
      />

      {/* Middle glow */}
      <circle
        cx="0"
        cy="0"
        r="4"
        fill="none"
        stroke={style.color}
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* Central hexagon node */}
      <g>
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x1 = Math.cos(angle) * 2.5;
          const y1 = Math.sin(angle) * 2.5;
          const x2 = Math.cos(angle + (60 * Math.PI) / 180) * 2.5;
          const y2 = Math.sin(angle + (60 * Math.PI) / 180) * 2.5;
          return (
            <line
              key={`hex-line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={style.color}
              strokeWidth="0.8"
              opacity="0.7"
            />
          );
        })}
      </g>

      {/* Core glow */}
      <circle
        cx="0"
        cy="0"
        r="2"
        fill={style.color}
        opacity="0.9"
      />

      {/* Subtle shadow/depth */}
      <ellipse
        cx="0"
        cy="3"
        rx="4"
        ry="1"
        fill={style.color}
        opacity="0.2"
      />
    </g>
  );
};

// Power-up effect component for when picked up
interface PowerUpEffectProps {
  type: 'speed' | 'shield' | 'bomb' | 'freeze';
  duration: number;
}

export const PowerUpEffect: React.FC<PowerUpEffectProps> = ({ type, duration }) => {
  const getColor = () => {
    switch (type) {
      case 'speed':
        return '#FFFF00';
      case 'shield':
        return '#00FF00';
      case 'bomb':
        return '#FF3300';
      case 'freeze':
        return '#00FFFF';
    }
  };

  const color = getColor();

  return (
    <div
      className="fixed top-4 right-4 z-40 pointer-events-none"
      style={{
        animation: `power-effect-fade ${duration}ms forwards`,
      }}
    >
      <div
        className="px-4 py-2 border-2 rounded font-mono text-sm"
        style={{
          borderColor: color,
          color: color,
          backgroundColor: `${color}22`,
          boxShadow: `0 0 20px ${color}66`,
          textShadow: `0 0 10px ${color}`,
        }}
      >
        {type.toUpperCase()} ACTIVE
      </div>
    </div>
  );
};
