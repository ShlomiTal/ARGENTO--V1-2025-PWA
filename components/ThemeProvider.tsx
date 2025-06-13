import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { colors } from '@/constants/colors';
import { lightColors } from '@/constants/lightColors';

type ThemeContextType = {
  colors: typeof colors;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  colors,
  isDarkMode: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleTheme, setDarkMode } = useThemeStore();
  const systemColorScheme = useColorScheme();
  
  // Sync with system theme on first load
  useEffect(() => {
    if (systemColorScheme) {
      setDarkMode(systemColorScheme === 'dark');
    }
  }, []);
  
  const currentColors = isDarkMode ? colors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ colors: currentColors, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};