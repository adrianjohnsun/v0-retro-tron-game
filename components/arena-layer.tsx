'use client';

import React from 'react';

export type ArenaType = 'standard' | 'basement' | 'portal' | 'industrial';

interface ArenaLayerProps {
  type: ArenaType;
  level: number;
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
}

export const ArenaLayer: React.FC<ArenaLayerProps> = ({
  type,
  level,
  gridWidth,
  gridHeight,
  cellSize,
}) => {
  const width = gridWidth * cellSize;
  const height = gridHeight * cellSize;

  const renderStandard = () => (
    <g>
      {/* Grid lines */}
      {Array.from({ length: gridWidth + 1 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1="0"
          x2={i * cellSize}
          y2={height}
          stroke="rgba(0, 255, 255, 0.1)"
          strokeWidth="0.5"
        />
      ))}
      {Array.from({ length: gridHeight + 1 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * cellSize}
          x2={width}
          y2={i * cellSize}
          stroke="rgba(0, 255, 255, 0.1)"
          strokeWidth="0.5"
        />
      ))}
      
      {/* Corner markers */}
      <circle cx="5" cy="5" r="3" fill="#00FF00" opacity="0.5" />
      <circle cx={width - 5} cy="5" r="3" fill="#FF6600" opacity="0.5" />
      <circle cx="5" cy={height - 5} r="3" fill="#00FF00" opacity="0.5" />
      <circle cx={width - 5} cy={height - 5} r="3" fill="#FF6600" opacity="0.5" />
    </g>
  );

  const renderBasement = () => (
    <g>
      {/* Darker basement aesthetic with industrial walls */}
      <defs>
        <pattern id="basement-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="40" height="40" fill="#0a0a2e" />
          <line x1="0" y1="0" x2="40" y2="40" stroke="#1a1a4a" strokeWidth="1" opacity="0.5" />
          <circle cx="20" cy="20" r="2" fill="#00FF00" opacity="0.2" />
        </pattern>
      </defs>
      
      <rect x="0" y="0" width={width} height={height} fill="url(#basement-pattern)" />

      {/* Heavy grid lines */}
      {Array.from({ length: gridWidth + 1 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1="0"
          x2={i * cellSize}
          y2={height}
          stroke="rgba(100, 200, 255, 0.15)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: gridHeight + 1 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * cellSize}
          x2={width}
          y2={i * cellSize}
          stroke="rgba(100, 200, 255, 0.15)"
          strokeWidth="1"
        />
      ))}

      {/* Industrial walls */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="none"
        stroke="#6699FF"
        strokeWidth="3"
        opacity="0.4"
      />

      {/* Data columns (vertical structures) */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = ((width / 5) * (i + 1));
        return (
          <g key={`column-${i}`}>
            <line
              x1={x}
              y1="0"
              x2={x}
              y2={height}
              stroke="#00FF00"
              strokeWidth="2"
              opacity="0.3"
            />
            <circle cx={x} cy={height / 2} r="8" fill="none" stroke="#00FF00" strokeWidth="1" opacity="0.4" />
          </g>
        );
      })}
    </g>
  );

  const renderPortal = () => (
    <g>
      {/* Dimensional portal aesthetic */}
      <defs>
        <radialGradient id="portal-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF00FF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#6600FF" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill="url(#portal-gradient)" />

      {/* Portal rings */}
      <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 3} fill="none" stroke="#FF00FF" strokeWidth="2" opacity="0.4" />
      <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2.5} fill="none" stroke="#00FFFF" strokeWidth="1" opacity="0.3" />

      {/* Grid with distortion */}
      {Array.from({ length: gridWidth + 1 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1="0"
          x2={i * cellSize}
          y2={height}
          stroke="rgba(255, 0, 255, 0.15)"
          strokeWidth="0.5"
        />
      ))}
      {Array.from({ length: gridHeight + 1 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * cellSize}
          x2={width}
          y2={i * cellSize}
          stroke="rgba(0, 255, 255, 0.15)"
          strokeWidth="0.5"
        />
      ))}
    </g>
  );

  const renderIndustrial = () => (
    <g>
      {/* Heavy machinery industrial arena */}
      <defs>
        <pattern id="industrial-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="60" height="60" fill="#1a0a2e" />
          <rect x="10" y="10" width="40" height="40" fill="none" stroke="#00CCFF" strokeWidth="1" opacity="0.3" />
          <circle cx="30" cy="30" r="3" fill="#FF6600" opacity="0.4" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill="url(#industrial-pattern)" />

      {/* Grid with glowing intersections */}
      {Array.from({ length: gridWidth + 1 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1="0"
          x2={i * cellSize}
          y2={height}
          stroke="rgba(255, 102, 0, 0.2)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: gridHeight + 1 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * cellSize}
          x2={width}
          y2={i * cellSize}
          stroke="rgba(255, 102, 0, 0.2)"
          strokeWidth="1"
        />
      ))}

      {/* Heavy border */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="none"
        stroke="#FF6600"
        strokeWidth="4"
        opacity="0.5"
      />

      {/* Hazard markers */}
      {Array.from({ length: 3 }).map((_, i) => {
        const x = ((width / 4) * (i + 1));
        return (
          <g key={`hazard-${i}`}>
            <rect x={x - 15} y={height / 2 - 15} width="30" height="30" fill="none" stroke="#FF0000" strokeWidth="2" opacity="0.3" />
            <text x={x} y={height / 2 + 5} textAnchor="middle" fill="#FF0000" fontSize="10" opacity="0.5">
              !
            </text>
          </g>
        );
      })}
    </g>
  );

  let arenaContent;
  switch (type) {
    case 'standard':
      arenaContent = renderStandard();
      break;
    case 'basement':
      arenaContent = renderBasement();
      break;
    case 'portal':
      arenaContent = renderPortal();
      break;
    case 'industrial':
      arenaContent = renderIndustrial();
      break;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0"
    >
      {arenaContent}
    </svg>
  );
};
