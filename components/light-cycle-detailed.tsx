'use client';

import React from 'react';

interface LightCycleDetailedProps {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  color: string;
  teamId: number;
  isUser?: boolean;
}

export const LightCycleDetailed: React.FC<LightCycleDetailedProps> = ({
  x,
  y,
  direction,
  color,
  teamId,
  isUser = false,
}) => {
  const CELL_SIZE = 12;
  const px = x * CELL_SIZE;
  const py = y * CELL_SIZE;

  const getRotation = () => {
    switch (direction) {
      case 'up': return 0;
      case 'right': return 90;
      case 'down': return 180;
      case 'left': return 270;
    }
  };

  const rotation = getRotation();

  return (
    <g transform={`translate(${px}, ${py}) rotate(${rotation})`}>
      {/* Thruster Exhaust */}
      <rect x="-3" y="4" width="2" height="3" fill={color} opacity="0.4" />
      <rect x="1" y="4" width="2" height="3" fill={color} opacity="0.4" />
      
      {/* Tail Fins */}
      <polygon points="0,6 -2,4 2,4" fill={color} opacity="0.6" />

      {/* Main Chassis */}
      <rect x="-2" y="-4" width="4" height="8" fill={color} opacity="0.8" stroke={color} strokeWidth="0.5" />

      {/* Cockpit/Canopy with reflection */}
      <rect x="-1.5" y="-3" width="3" height="2.5" fill={color} opacity="0.9" stroke={color} strokeWidth="0.5" />
      <ellipse cx="0" cy="-2" rx="1.2" ry="0.8" fill={color} opacity="0.5" />

      {/* Side Winglets for aerodynamics */}
      <polygon points="-2,-1 -3.5,-0.5 -2,0.5" fill={color} opacity="0.6" />
      <polygon points="2,-1 3.5,-0.5 2,0.5" fill={color} opacity="0.6" />

      {/* Glow Strip down center */}
      <line x1="0" y1="-4" x2="0" y2="4" stroke={color} strokeWidth="0.8" opacity="0.7" />

      {/* Energy Core at cockpit */}
      <circle cx="0" cy="-2" r="0.6" fill={color} opacity="1" />
      <circle cx="0" cy="-2" r="0.8" fill="none" stroke={color} strokeWidth="0.3" opacity="0.6" />

      {/* Front Sensor Array */}
      <circle cx="-0.8" cy="-4" r="0.3" fill={color} opacity="0.7" />
      <circle cx="0.8" cy="-4" r="0.3" fill={color} opacity="0.7" />

      {/* Team indicator glow (subtle) */}
      {isUser && (
        <rect x="-2.5" y="-5" width="5" height="10" fill="none" stroke={color} strokeWidth="0.3" opacity="0.4" />
      )}
    </g>
  );
};
