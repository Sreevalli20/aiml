import React, { useState, useEffect } from 'react';
import { Sparkles, Mic, Volume2, AlertCircle } from 'lucide-react';
import { useRole } from '../../state/RoleContext';
import { useLanguage } from '../../state/LanguageContext';
import { cn } from '../../utils/cn';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface AIAvatarProps {
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showControls?: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({
  state = 'idle',
  size = 'lg',
  className,
  showControls = false
}) => {
  const { currentPersona } = useRole();
  const { currentLanguage } = useLanguage();
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Speaking mouth movement simulation
  useEffect(() => {
    if (state === 'speaking') {
      const talkInterval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 180);
      return () => clearInterval(talkInterval);
    } else {
      setMouthOpen(false);
    }
  }, [state]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      {/* Outer Ambient Aura Glow */}
      <div className={cn(
        'absolute rounded-full filter blur-2xl transition-all duration-700 opacity-60',
        sizeClasses[size],
        state === 'idle' && 'bg-indigo-600/30',
        state === 'listening' && 'bg-emerald-500/40 scale-110',
        state === 'thinking' && 'bg-amber-500/40 scale-110 animate-pulse',
        state === 'speaking' && 'bg-violet-600/50 scale-120 animate-pulse-subtle',
        state === 'error' && 'bg-rose-600/40'
      )} />

      {/* Main Avatar Character Frame */}
      <div className={cn(
        'relative rounded-full border-2 transition-all duration-300 shadow-2xl flex items-center justify-center overflow-hidden',
        sizeClasses[size],
        state === 'idle' && 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-indigo-500/30',
        state === 'listening' && 'bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border-emerald-500/60 ring-4 ring-emerald-500/20',
        state === 'thinking' && 'bg-gradient-to-b from-slate-900 via-amber-950 to-slate-950 border-amber-500/60 ring-4 ring-amber-500/20',
        state === 'speaking' && 'bg-gradient-to-b from-slate-900 via-violet-950 to-slate-950 border-violet-500/60 ring-4 ring-violet-500/30',
        state === 'error' && 'bg-gradient-to-b from-slate-900 via-rose-950 to-slate-950 border-rose-500/60'
      )}>
        {/* SVG Stylized Human-Like Character Head & Facial Geometry */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-2 select-none">
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Background Digital Halo Rings */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400/30" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400/20" />

          {/* Assistant Hair / Top Silhouette */}
          <path
            d="M 28 36 C 28 20, 72 20, 72 36 C 74 34, 76 45, 72 48 C 70 30, 30 30, 28 48 C 24 45, 26 34, 28 36 Z"
            fill="#1e1b4b"
            stroke="#6366f1"
            strokeWidth="0.75"
          />

          {/* Face Geometry */}
          <ellipse cx="50" cy="54" rx="22" ry="24" fill="url(#skinGrad)" stroke="#a5b4fc" strokeWidth="0.8" />

          {/* Smart Neural Visor / Headset Band */}
          <path d="M 26 48 Q 50 42 74 48" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
          <circle cx="26" cy="48" r="2.5" fill="#38bdf8" />
          <circle cx="74" cy="48" r="2.5" fill="#38bdf8" />

          {/* Eyes (With Natural Blinking Animation) */}
          <g>
            {blink ? (
              <>
                <line x1="38" y1="52" x2="44" y2="52" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="56" y1="52" x2="62" y2="52" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Left Eye */}
                <ellipse cx="41" cy="52" rx="3.5" ry="3.5" fill="#0f172a" />
                <ellipse cx="41" cy="52" rx="2.5" ry="2.5" fill="url(#eyeGrad)" />
                <circle cx="42" cy="51" r="0.8" fill="#ffffff" />
                
                {/* Right Eye */}
                <ellipse cx="59" cy="52" rx="3.5" ry="3.5" fill="#0f172a" />
                <ellipse cx="59" cy="52" rx="2.5" ry="2.5" fill="url(#eyeGrad)" />
                <circle cx="60" cy="51" r="0.8" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Subtle Eyebrows */}
          <path d="M 37 47 Q 41 45 45 47" fill="none" stroke="#e0e7ff" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M 55 47 Q 59 45 63 47" fill="none" stroke="#e0e7ff" strokeWidth="0.8" strokeLinecap="round" />

          {/* Cute Nose */}
          <path d="M 50 54 L 49 57 L 51 57" fill="none" stroke="#c7d2fe" strokeWidth="0.8" strokeLinecap="round" />

          {/* Mouth (Idle Smile vs Speaking dynamic aperture) */}
          {state === 'speaking' ? (
            <ellipse
              cx="50"
              cy="65"
              rx={mouthOpen ? '4.5' : '3'}
              ry={mouthOpen ? '3' : '1.2'}
              fill="#0f172a"
              stroke="#e0e7ff"
              strokeWidth="0.8"
            />
          ) : (
            <path
              d="M 45 64 Q 50 67 55 64"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          )}

          {/* Soundwave or Status Indicator Overlays */}
          {state === 'thinking' && (
            <g className="animate-spin origin-center">
              <circle cx="50" cy="24" r="1.5" fill="#fbbf24" />
            </g>
          )}
        </svg>

        {/* Floating State Badge */}
        <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-white shadow-md">
          {state === 'listening' && <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
          {state === 'thinking' && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
          {state === 'speaking' && <Volume2 className="w-3.5 h-3.5 text-violet-400 animate-pulse" />}
          {state === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
          {state === 'idle' && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
        </div>
      </div>

      {/* Persona Tag */}
      <div className="mt-3 text-center">
        <h4 className="text-sm font-semibold text-white font-display">
          {currentPersona.personaName}
        </h4>
        <p className="text-[11px] text-indigo-300 font-mono">
          {currentPersona.badge} • {currentLanguage.nativeName}
        </p>
      </div>
    </div>
  );
};
