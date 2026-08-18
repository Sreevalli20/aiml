import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DEFAULT_LANGUAGE, LanguageOption, SUPPORTED_LANGUAGES } from '../config/languages';

interface LanguageContextValue {
  currentLanguage: LanguageOption;
  setLanguageByCode: (code: string) => void;
  direction: 'ltr' | 'rtl';
  allLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('xyz_selected_language');
      if (savedCode) {
        const found = SUPPORTED_LANGUAGES.find((l) => l.code === savedCode);
        if (found) return found;
      }
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xyz_selected_language', currentLanguage.code);
      document.documentElement.dir = currentLanguage.direction;
      document.documentElement.lang = currentLanguage.code;
    }
  }, [currentLanguage]);

  const setLanguageByCode = useCallback((code: string) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (found) {
      setCurrentLanguage(found);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    currentLanguage,
    setLanguageByCode,
    direction: currentLanguage.direction,
    allLanguages: SUPPORTED_LANGUAGES
  }), [currentLanguage, setLanguageByCode]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
