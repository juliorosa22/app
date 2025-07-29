import React, { createContext, useContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { theme, darkTheme } from '../constants/theme';

// Create Theme Context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Get current theme based on mode
  const currentTheme = isDarkMode ? darkTheme : theme;
  
  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Theme context value
  const themeContextValue = {
    theme: currentTheme,
    isDarkMode,
    toggleTheme,
    colors: currentTheme.colors,
    spacing: currentTheme.spacing,
    typography: currentTheme.typography,
    borderRadius: currentTheme.borderRadius,
    shadows: currentTheme.shadows,
    components: currentTheme.components,
  };
  
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={currentTheme.colors.primary} />
      {children}
    </ThemeContext.Provider>
  );
};

// Helper hook for creating themed styles
export const useThemedStyles = (styleFunction) => {
  const { theme, colors, spacing, typography } = useTheme();
  return styleFunction({ theme, colors, spacing, typography });
};