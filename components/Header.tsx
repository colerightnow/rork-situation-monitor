import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Sun, Moon, Leaf } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeMode } from '@/constants/theme';

export default function Header() {
  const { colors, themeMode, setThemeMode, isDark } = useTheme();

  const toggleDarkMode = () => {
    const isGreen = themeMode.includes('green');
    const newMode: ThemeMode = isDark
      ? isGreen ? 'light-green' : 'light-white'
      : isGreen ? 'dark-green' : 'dark-white';
    setThemeMode(newMode);
  };

  const toggleAccentColor = () => {
    const isGreen = themeMode.includes('green');
    const newMode: ThemeMode = isGreen
      ? isDark ? 'dark-white' : 'light-white'
      : isDark ? 'dark-green' : 'light-green';
    setThemeMode(newMode);
  };

  const isGreen = themeMode.includes('green');

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <Text style={[styles.logo, { color: colors.textPrimary }]}>SITUATION MONITOR</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.buttons}>
          <Pressable
            onPress={toggleDarkMode}
            style={({ pressed }) => [
              styles.iconButton,
              { borderColor: colors.border },
              pressed && { borderColor: colors.borderHover },
            ]}
          >
            {isDark ? (
              <Sun size={14} color={colors.textDim} />
            ) : (
              <Moon size={14} color={colors.textDim} />
            )}
          </Pressable>
          <Pressable
            onPress={toggleAccentColor}
            style={({ pressed }) => [
              styles.iconButton,
              { borderColor: colors.border },
              pressed && { borderColor: colors.borderHover },
            ]}
          >
            <Leaf size={14} color={isGreen ? colors.accent : colors.textDim} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
  },
  logo: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  buttons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderRadius: 2,
  },
});
