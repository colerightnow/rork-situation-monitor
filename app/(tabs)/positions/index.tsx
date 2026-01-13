import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, Users, FileText, Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePositions } from '@/contexts/PositionsContext';
import { useSignals } from '@/contexts/SignalsContext';
import SwipeablePositionItem from '@/components/SwipeablePositionItem';
import AccountItem from '@/components/AccountItem';
import * as Haptics from 'expo-haptics';

type ViewMode = 'positions' | 'accounts';

export default function PositionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('positions');
  const [quickAddTicker, setQuickAddTicker] = useState('');
  const { positions, removePosition, addPosition } = usePositions();
  const { accounts, removeAccount } = useSignals();

  const bullishCount = positions.filter((p) => p.sentiment === 'bullish').length;
  const bearishCount = positions.filter((p) => p.sentiment === 'bearish').length;

  const handleDeleteAccount = useCallback((accountId: string) => {
    Alert.alert(
      'Remove Account',
      'Are you sure you want to stop monitoring this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeAccount(accountId);
          },
        },
      ]
    );
  }, [removeAccount]);

  const handleDeletePosition = useCallback((positionId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    removePosition(positionId);
  }, [removePosition]);

  const handleQuickAdd = useCallback(() => {
    const ticker = quickAddTicker.trim().toUpperCase().replace('$', '');
    if (!ticker) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPosition(ticker, 'bullish');
    setQuickAddTicker('');
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [quickAddTicker, addPosition]);

  const handleAddAccount = useCallback(() => {
    router.push('/add-account' as never);
  }, [router]);

  const handleAddPosition = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/add-position' as never);
  }, [router]);

  const handleImportTweet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/import-tweet' as never);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {viewMode === 'positions' ? 'WATCHLIST' : 'MONITORED ACCOUNTS'}
        </Text>
        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setViewMode('positions')}
            style={[
              styles.toggleButton,
              {
                backgroundColor: viewMode === 'positions' ? colors.accent : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <TrendingUp
              size={14}
              color={viewMode === 'positions' ? colors.bg : colors.textDim}
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('accounts')}
            style={[
              styles.toggleButton,
              {
                backgroundColor: viewMode === 'accounts' ? colors.accent : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <Users
              size={14}
              color={viewMode === 'accounts' ? colors.bg : colors.textDim}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {viewMode === 'positions' ? (
          <>
            <View style={styles.quickAddContainer}>
              <View style={styles.quickAddRow}>
                <View style={[styles.searchInputContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                  <Search size={14} color={colors.textDim} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                    placeholder="Enter ticker (e.g. AAPL)"
                    placeholderTextColor={colors.textDim}
                    value={quickAddTicker}
                    onChangeText={setQuickAddTicker}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleQuickAdd}
                  />
                  {quickAddTicker.length > 0 && (
                    <Pressable onPress={() => setQuickAddTicker('')}>
                      <X size={14} color={colors.textDim} />
                    </Pressable>
                  )}
                </View>
                <Pressable
                  onPress={handleQuickAdd}
                  disabled={!quickAddTicker.trim()}
                  style={({ pressed }) => [
                    styles.quickAddButton,
                    {
                      backgroundColor: quickAddTicker.trim() ? colors.accent : colors.bgCard,
                      borderColor: quickAddTicker.trim() ? colors.accent : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Plus size={16} color={quickAddTicker.trim() ? colors.bg : colors.textDim} />
                </Pressable>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleAddPosition}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: pressed ? colors.bgCard : 'transparent',
                  },
                ]}
              >
                <Plus size={14} color={colors.textSecondary} />
                <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
                  DETAILED ADD
                </Text>
              </Pressable>
              <Pressable
                onPress={handleImportTweet}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: pressed ? colors.bgCard : 'transparent',
                  },
                ]}
              >
                <FileText size={14} color={colors.textSecondary} />
                <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
                  IMPORT TWEET
                </Text>
              </Pressable>
            </View>

            {positions.length > 0 ? (
              <>
                <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.bullishText }]}>
                      {bullishCount}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textDim }]}>BULLISH</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.bearishText }]}>
                      {bearishCount}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textDim }]}>BEARISH</Text>
                  </View>
                </View>
                {positions.map((position) => (
                  <SwipeablePositionItem
                    key={position.id}
                    position={position}
                    onDelete={() => handleDeletePosition(position.id)}
                  />
                ))}
                <Text style={[styles.hint, { color: colors.textDim }]}>
                  Swipe left to delete
                </Text>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { borderColor: colors.border }]}>
                  <TrendingUp size={32} color={colors.textDim} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  NO POSITIONS YET
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Add stocks manually or tap on tickers in the feed to add them to your watchlist.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Pressable
              onPress={handleAddAccount}
              style={({ pressed }) => [
                styles.addButton,
                {
                  borderColor: colors.border,
                  backgroundColor: pressed ? colors.bgCard : 'transparent',
                },
              ]}
            >
              <Plus size={16} color={colors.accent} />
              <Text style={[styles.addButtonText, { color: colors.accent }]}>
                ADD TWITTER ACCOUNT
              </Text>
            </Pressable>
            {accounts.map((account) => (
              <AccountItem
                key={account.id}
                account={account}
                onDelete={() => handleDeleteAccount(account.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  toggleButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  quickAddContainer: {
    marginBottom: 12,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 2,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    padding: 0,
  },
  quickAddButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 2,
  },
  actionButtonText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  hint: {
    fontSize: 9,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 2,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1,
    fontWeight: '600' as const,
  },
});
