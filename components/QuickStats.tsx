import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickStatsProps {
  activeSignals: number;
  highConfidence: number;
  accounts: number;
  bullish: number;
  onAddPress?: () => void;
}

export default function QuickStats({
  activeSignals,
  highConfidence,
  accounts,
  bullish,
  onAddPress,
}: QuickStatsProps) {
  const { colors } = useTheme();

  const stats = [
    { label: 'ACTIVE', value: activeSignals },
    { label: 'HIGH CONF', value: highConfidence },
    { label: 'ACCOUNTS', value: accounts },
    { label: 'BULLISH', value: bullish },
  ];

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <View style={styles.stat}>
            <Text style={[styles.label, { color: colors.textDim }]}>{stat.label}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{stat.value}</Text>
          </View>
          {index < stats.length - 1 && (
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          )}
        </React.Fragment>
      ))}
      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => [
          styles.addButton,
          { borderColor: colors.border },
          pressed && { borderColor: colors.borderHover },
        ]}
      >
        <Plus size={12} color={colors.textDim} />
        <Text style={[styles.addText, { color: colors.textDim }]}>ADD</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  divider: {
    width: 1,
    height: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 2,
    marginLeft: 'auto',
  },
  addText: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
