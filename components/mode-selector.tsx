'use client';

import React from 'react';

interface ModeSelectorProps {
  onModeSelect: (mode: '1v1' | '3v3' | '5v5') => void;
  onDifficultySelect: (difficulty: number) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  onModeSelect,
  onDifficultySelect,
}) => {
  const [selectedMode, setSelectedMode] = React.useState<'1v1' | '3v3' | '5v5' | null>(null);
  const [difficulty, setDifficulty] = React.useState(1);

  const handleModeSelect = (mode: '1v1' | '3v3' | '5v5') => {
    setSelectedMode(mode);
  };

  const handleStart = () => {
    if (selectedMode) {
      onDifficultySelect(difficulty);
      onModeSelect(selectedMode);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 retro-scanline">
      {/* Main container */}
      <div className="relative border-4 border-cyan-500 p-8 bg-black rounded-lg max-w-2xl w-full mx-4 shadow-2xl"
        style={{
          boxShadow: '0 0 40px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(10, 10, 30, 0.95))',
        }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-press-start text-2xl text-cyan-400 mb-2 glitch-text">
            SECTOR SELECTION
          </h2>
          <p className="text-cyan-300 text-xs font-mono tracking-widest">
            &gt; CHOOSE YOUR CONFIGURATION &lt;
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <p className="text-cyan-300 text-xs font-mono mb-4 uppercase tracking-widest">
            &gt; MATCH MODE
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { mode: '1v1' as const, label: '1v1 DUEL', desc: 'Solo vs CLU' },
              { mode: '3v3' as const, label: '3v3 SQUAD', desc: 'Team Battle' },
              { mode: '5v5' as const, label: '5v5 LEGION', desc: 'Full Scale' },
            ].map((config) => (
              <button
                key={config.mode}
                onClick={() => handleModeSelect(config.mode)}
                className={`p-4 border-2 rounded transition-all ${
                  selectedMode === config.mode
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-lg'
                    : 'border-cyan-600 bg-transparent hover:border-cyan-400 hover:shadow-md'
                }`}
                style={{
                  boxShadow: selectedMode === config.mode
                    ? '0 0 20px rgba(0, 255, 255, 0.5)'
                    : 'none',
                }}
              >
                <div className="font-press-start text-xs text-cyan-300 mb-1">
                  {config.label}
                </div>
                <div className="text-cyan-400/70 text-xs font-mono">
                  {config.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <p className="text-cyan-300 text-xs font-mono mb-4 uppercase tracking-widest">
            &gt; DIFFICULTY LEVEL
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-2 px-3 border-2 rounded text-xs font-mono transition-all ${
                  difficulty === level
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-cyan-600 bg-transparent hover:border-cyan-400'
                }`}
                style={{
                  boxShadow: difficulty === level
                    ? '0 0 15px rgba(255, 102, 0, 0.4)'
                    : 'none',
                }}
              >
                <span className={difficulty === level ? 'text-orange-400' : 'text-cyan-400'}>
                  L{level}
                </span>
              </button>
            ))}
          </div>
          <div className="text-cyan-300/70 text-xs font-mono mt-2">
            AI LOOKAHEAD: {Math.floor(8 + difficulty * 2)} | SPEED: {Math.floor(100 + difficulty * 10)}%
          </div>
        </div>

        {/* CLU Message */}
        <div className="mb-6 p-4 border-2 border-orange-600 bg-orange-900/20 rounded"
          style={{
            boxShadow: '0 0 10px rgba(255, 102, 0, 0.2)',
          }}>
          <p className="text-orange-400 text-xs font-mono leading-relaxed">
            &gt; "A WEAKLING'S CHOICE OF ODDS WILL NOT DELAY THE INEVITABLE.
            YOUR DEFRAGMENTATION IS WRITTEN."
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!selectedMode}
          className={`w-full py-3 border-2 font-press-start text-sm rounded transition-all uppercase ${
            selectedMode
              ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 hover:shadow-lg cursor-pointer'
              : 'border-cyan-700 bg-transparent text-cyan-700/50 cursor-not-allowed'
          }`}
          style={{
            boxShadow: selectedMode
              ? '0 0 30px rgba(0, 255, 255, 0.3)'
              : 'none',
          }}
        >
          INITIATE GAME SEQUENCE
        </button>

        {/* Footer */}
        <p className="text-center text-cyan-500/50 text-xs font-mono mt-6 uppercase tracking-widest">
          ▲ ▼ SELECT | ENTER START
        </p>
      </div>
    </div>
  );
};
