import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';
import { cn } from '../../utils/cn';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { currentLanguage, setLanguageByCode, allLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs font-medium',
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
        )}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="font-semibold">{currentLanguage.nativeName}</span>
        <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">({currentLanguage.code.toUpperCase()})</span>
        <ChevronDown className={cn('w-3 h-3 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 py-1.5 divide-y divide-slate-100 backdrop-blur-xl">
          <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
            Multilingual AI (11 Regional Languages)
          </div>
          <div className="py-1">
            {allLanguages.map((lang) => {
              const isSelected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguageByCode(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="text-[11px] text-slate-400">({lang.name})</span>
                    {lang.direction === 'rtl' && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        RTL
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
