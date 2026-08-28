import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../api/client';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('peachy_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('peachy_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('peachy_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    try {
      await apiService.updateSettings({ dark_mode: next });
    } catch (e) {
      // Ignore network errors for local state
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
