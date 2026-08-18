import React from 'react';
import { cn } from '../../utils/cn';

interface AudioWaveformProps {
  isActive: boolean;
  level?: number;
  bars?: number;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  level = 0.5,
  bars = 16,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-1 h-12 px-4', className)}>
      {Array.from({ length: bars }).map((_, i) => {
        // Create wave pattern
        const heightMultiplier = Math.sin((i / (bars - 1)) * Math.PI);
        const dynamicHeight = isActive
          ? Math.max(6, Math.min(36, Math.round(level * 36 * (0.4 + heightMultiplier * 0.6) + (Math.random() * 8))))
          : 4;

        return (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-75',
              isActive
                ? 'bg-gradient-to-t from-indigo-500 to-violet-400'
                : 'bg-slate-700'
            )}
            style={{
              height: `${dynamicHeight}px`,
            }}
          />
        );
      })}
    </div>
  );
};
