
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const updatePWAThemeColor = (theme: Theme) => {
  const themeColorMeta = document.getElementById('theme-color-meta');
  const statusBarMeta = document.getElementById('status-bar-style-meta');
  
  if (themeColorMeta && statusBarMeta) {
    if (theme === 'dark') {
      themeColorMeta.setAttribute('content', '#0E0E0E');
      statusBarMeta.setAttribute('content', 'black-translucent');
    } else {
      themeColorMeta.setAttribute('content', '#ffffff');
      statusBarMeta.setAttribute('content', 'default');
    }
  }
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('fitclub-theme');
    return (stored as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('fitclub-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update PWA theme color when theme changes
    updatePWAThemeColor(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
