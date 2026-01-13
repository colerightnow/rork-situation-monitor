import { Tabs } from 'expo-router';
import { Radio, TrendingUp, Settings } from 'lucide-react-native';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: 0.5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(feed)"
        options={{
          title: 'FEED',
          tabBarIcon: ({ color, size }) => <Radio color={color} size={size - 4} />,
        }}
      />
      <Tabs.Screen
        name="positions"
        options={{
          title: 'POSITIONS',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size - 4} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size - 4} />,
        }}
      />
    </Tabs>
  );
}
