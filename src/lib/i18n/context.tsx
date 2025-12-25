'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Locale, getTranslations, Translations } from './translations';

interface LocaleContextType {
  locale: Locale;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'ja',
  t: getTranslations('ja'),
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const t = getTranslations(locale);
  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

