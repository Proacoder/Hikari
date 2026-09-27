import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../utils/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('kaiser_language') || 'en';
  });

  const setLanguage = useCallback((langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem('kaiser_language', langCode);
      document.documentElement.lang = langCode;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Translate by dot-notated key
  const t = useCallback((key, fallback) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English if translation is missing in the chosen language
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) {
      return TRANSLATIONS.en[key];
    }
    return fallback !== undefined ? fallback : key;
  }, [language]);

  // Helper for category translations
  const translateCategory = useCallback((category) => {
    const key = `category.${category}`;
    return t(key, category);
  }, [t]);

  // Helper for status translations
  const translateStatus = useCallback((status) => {
    const key = `status.${status}`;
    return t(key, status);
  }, [t]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCategory,
        translateStatus,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

export default LanguageContext;
