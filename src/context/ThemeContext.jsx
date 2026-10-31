import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const userChoice = localStorage.getItem('kaiser_theme_user_set');
      if (userChoice === 'true') {
        const stored = localStorage.getItem('kaiser_theme');
        if (stored === 'light' || stored === 'dark') return stored;
      }
      // Light mode is the default mode
      return 'light';
    } catch {
      return 'light';
    }
  });

  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('kaiser_theme', newTheme);
      localStorage.setItem('kaiser_theme_user_set', 'true');
    } catch {
      // Ignore localStorage errors in private mode
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Light mode is the default mode per user specification
  useEffect(() => {
    // If user has not explicitly set a theme, keep default light mode active
    const userChoice = localStorage.getItem('kaiser_theme_user_set');
    if (userChoice !== 'true') {
      applyTheme('light');
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t) => {
    if (t === 'light' || t === 'dark') {
      setThemeState(t);
    }
  }, []);

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

