import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeMode, themes, ThemeColors } from '@/constants/theme';

const THEME_STORAGE_KEY = 'situation_monitor_theme';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark-green');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored as ThemeMode) in themes) {
          setThemeModeState(stored as ThemeMode);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  const colors = useMemo<ThemeColors>(() => themes[themeMode], [themeMode]);

  const isDark = useMemo(() => themeMode.startsWith('dark'), [themeMode]);

  return {
    themeMode,
    setThemeMode,
    colors,
    isDark,
    isLoading,
  };
});
