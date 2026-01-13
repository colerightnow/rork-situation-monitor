import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Account } from '@/contexts/SignalsContext';

interface AccountItemProps {
  account: Account;
  onDelete?: () => void;
}

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export default function AccountItem({ account, onDelete }: AccountItemProps) {
  const { colors } = useTheme();

  const categoryColors: Record<string, string> = {
    stocks: colors.bullishText,
    crypto: '#f59e0b',
    politics: '#8b5cf6',
    general: colors.textDim,
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.info}>
        <Text style={[styles.handle, { color: colors.textPrimary }]}>
          {account.twitterHandle}
        </Text>
        <View style={styles.meta}>
          <Text
            style={[
              styles.category,
              { color: categoryColors[account.category] || colors.textDim },
            ]}
          >
            {account.category.toUpperCase()}
          </Text>
          <Text style={[styles.followers, { color: colors.textDim }]}>
            {formatFollowers(account.followersCount)} followers
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Trash2 size={16} color={colors.bearishText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  info: {
    flex: 1,
  },
  handle: {
    fontSize: 13,
    fontWeight: '600' as const,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  category: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  followers: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  deleteButton: {
    padding: 8,
  },
});
