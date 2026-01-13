import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Category } from '@/mocks/signals';

type FilterOption = 'all' | Category;

interface FilterTabsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  onAddPress?: () => void;
}

const filters: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'stocks', label: 'STOCKS' },
  { key: 'crypto', label: 'CRYPTO' },
  { key: 'politics', label: 'POLITICS' },
];

export default function FilterTabs({ activeFilter, onFilterChange, onAddPress }: FilterTabsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => onFilterChange(filter.key)}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.accent : 'transparent',
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.bg : colors.textDim },
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {onAddPress && (
        <Pressable
          onPress={onAddPress}
          style={[styles.addButton, { borderColor: colors.border }]}
        >
          <Plus size={12} color={colors.textDim} />
          <Text style={[styles.addText, { color: colors.textDim }]}>ADD</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    fontWeight: '600' as const,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
  },
  addText: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    fontWeight: '600' as const,
  },
});
