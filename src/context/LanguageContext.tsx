/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, translations } from '../i18n/translations.ts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
  tCategory: (cat: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'pricewise_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch {
      // fallback to 'en'
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not persist language to localStorage:', e);
    }
  };

  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations.en[key] || String(key);
  };

  const tCategory = (cat: string): string => {
    if (language === 'en') return cat;
    switch (cat.toLowerCase()) {
      case 'packaging':
        return translations.hi.cat_packaging;
      case 'inventory & food':
        return translations.hi.cat_inventory;
      case 'cleaning & hygiene':
        return translations.hi.cat_cleaning;
      case 'store supplies':
        return translations.hi.cat_supplies;
      case 'utilities & facilities':
        return translations.hi.cat_utilities;
      case 'equipment':
        return translations.hi.cat_equipment;
      default:
        return cat;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
