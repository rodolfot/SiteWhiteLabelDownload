'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, defaultLocale, locales, getDictionary, Dictionary } from './dictionaries';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: getDictionary(defaultLocale),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [t, setT] = useState<Dictionary>(getDictionary(defaultLocale));

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && locales.includes(saved)) {
      setLocaleState(saved);
      setT(getDictionary(saved));
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language;
      if (browserLang.startsWith('en')) {
        setLocaleState('en');
        setT(getDictionary('en'));
      } else if (browserLang.startsWith('es')) {
        setLocaleState('es');
        setT(getDictionary('es'));
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setT(getDictionary(newLocale));
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale === 'pt-BR' ? 'pt-BR' : newLocale;
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
