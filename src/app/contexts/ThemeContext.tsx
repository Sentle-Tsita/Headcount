import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface ThemeContextType {
  currentTheme: string;
  themes: Record<string, ThemeColors>;
  setTheme: (themeName: string) => void;
  addCustomTheme: (name: string, colors: ThemeColors) => void;
}

const defaultThemes: Record<string, ThemeColors> = {
  default: {
    primary: '#4f46e5', // indigo-600
    secondary: '#818cf8', // indigo-400
    accent: '#06b6d4', // cyan-500
    background: '#ffffff',
    text: '#1f2937', // gray-800
  },
  ocean: {
    primary: '#0891b2', // cyan-600
    secondary: '#06b6d4', // cyan-500
    accent: '#14b8a6', // teal-500
    background: '#ffffff',
    text: '#1f2937',
  },
  sunset: {
    primary: '#dc2626', // red-600
    secondary: '#f97316', // orange-500
    accent: '#fbbf24', // amber-400
    background: '#ffffff',
    text: '#1f2937',
  },
  forest: {
    primary: '#059669', // emerald-600
    secondary: '#10b981', // emerald-500
    accent: '#84cc16', // lime-500
    background: '#ffffff',
    text: '#1f2937',
  },
  royal: {
    primary: '#7c3aed', // violet-600
    secondary: '#a78bfa', // violet-400
    accent: '#ec4899', // pink-500
    background: '#ffffff',
    text: '#1f2937',
  },
  dark: {
    primary: '#60a5fa', // blue-400
    secondary: '#818cf8', // indigo-400
    accent: '#34d399', // emerald-400
    background: '#1f2937', // gray-800
    text: '#f9fafb', // gray-50
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [themes, setThemes] = useState(defaultThemes);

  // Apply theme CSS variables
  useEffect(() => {
    const themeColors = themes[currentTheme];
    if (themeColors) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', themeColors.primary);
      root.style.setProperty('--theme-secondary', themeColors.secondary);
      root.style.setProperty('--theme-accent', themeColors.accent);
      root.style.setProperty('--theme-background', themeColors.background);
      root.style.setProperty('--theme-text', themeColors.text);
    }
  }, [currentTheme, themes]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('nul-theme', themeName);
    }
  };

  const addCustomTheme = (name: string, colors: ThemeColors) => {
    setThemes({ ...themes, [name]: colors });
  };

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nul-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        addCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
