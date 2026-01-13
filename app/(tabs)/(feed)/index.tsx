import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignals, Signal, Category } from '@/contexts/SignalsContext';
import Header from '@/components/Header';
import StatusReport from '@/components/StatusReport';
import FilterTabs from '@/components/FilterTabs';
import SignalCard from '@/components/SignalCard';

type FilterOption = 'all' | Category;

export default function FeedScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { accounts, signals, isRefreshing, refreshSignals } = useSignals();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [highlightedSignalId, setHighlightedSignalId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const liveDotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(liveDotAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [liveDotAnim]);

  const filteredSignals = useMemo(() => {
    if (filter === 'all') return signals;
    return signals.filter((s) => s.category === filter);
  }, [filter, signals]);

  const statusReport = useMemo(() => {
    if (signals.length === 0) return null;
    
    const tickerCounts: Record<string, { count: number; sentiment: string }> = {};
    signals.forEach((s) => {
      s.tickers.forEach((t) => {
        if (!tickerCounts[t]) {
          tickerCounts[t] = { count: 0, sentiment: s.sentiment };
        }
        tickerCounts[t].count++;
      });
    });

    const topTickers = Object.entries(tickerCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    const insights: string[] = [];
    if (topTickers.length > 0) {
      insights.push(`Top signals: ${topTickers.map(([t]) => `$${t}`).join(', ')}`);
    }

    const bullish = signals.filter((s) => s.sentiment === 'bullish').length;
    const bearish = signals.filter((s) => s.sentiment === 'bearish').length;
    if (bullish > bearish) {
      insights.push(`Market sentiment: ${bullish} bullish vs ${bearish} bearish`);
    } else if (bearish > bullish) {
      insights.push(`Caution: ${bearish} bearish signals detected`);
    }

    return {
      insights,
      generatedAt: new Date(),
    };
  }, [signals]);

  const onRefresh = useCallback(() => {
    refreshSignals();
  }, [refreshSignals]);

  const handleInsightPress = useCallback((index: number) => {
    const targetSignalIndex = Math.min(index, filteredSignals.length - 1);
    const targetSignal = filteredSignals[targetSignalIndex];
    
    if (targetSignal && flatListRef.current) {
      flatListRef.current.scrollToIndex({ 
        index: targetSignalIndex, 
        animated: true,
        viewPosition: 0.3,
      });
      
      setHighlightedSignalId(targetSignal.id);
      
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => setHighlightedSignalId(null), 2000);
    }
  }, [filteredSignals, pulseAnim]);

  const handleAddAccount = useCallback(() => {
    router.push('/add-account' as never);
  }, [router]);



  const renderSignal = useCallback(({ item }: { item: Signal }) => (
    <SignalCard
      signal={item}
      isHighlighted={item.id === highlightedSignalId}
    />
  ), [highlightedSignalId]);

  const EmptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { borderColor: colors.border }]}>
        <Users size={48} color={colors.textDim} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        NO ACCOUNTS YET
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Add Twitter accounts to monitor for trading signals. The AI will analyze tweets and show you only the relevant positions.
      </Text>
      <Pressable
        onPress={handleAddAccount}
        style={({ pressed }) => [
          styles.emptyButton,
          { backgroundColor: colors.accent },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Plus size={16} color={colors.bg} />
        <Text style={[styles.emptyButtonText, { color: colors.bg }]}>
          ADD YOUR FIRST ACCOUNT
        </Text>
      </Pressable>
    </View>
  ), [colors, handleAddAccount]);

  const ListHeader = useMemo(() => (
    <View style={styles.listHeader}>
      {statusReport && statusReport.insights.length > 0 && (
        <StatusReport report={statusReport} onInsightPress={handleInsightPress} />
      )}
      <FilterTabs activeFilter={filter} onFilterChange={setFilter} onAddPress={handleAddAccount} />
      {signals.length > 0 && (
        <View style={styles.feedHeader}>
          <Animated.View style={[styles.liveDot, { backgroundColor: colors.bullishText, opacity: liveDotAnim }]} />
          <Text style={[styles.feedTitle, { color: colors.textDim }]}>LIVESTREAM</Text>
          <Text style={[styles.signalCount, { color: colors.textDim }]}>
            {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  ), [filter, colors, handleInsightPress, handleAddAccount, liveDotAnim, statusReport, signals.length, filteredSignals.length]);

  if (accounts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <Header />
        {EmptyState}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header />
      <FlatList
        ref={flatListRef}
        data={filteredSignals}
        keyExtractor={(item) => item.id}
        renderItem={renderSignal}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.noSignalsContainer}>
            <Text style={[styles.noSignalsText, { color: colors.textDim }]}>
              No signals yet. Pull down to refresh or wait for new tweets.
            </Text>
            <Text style={[styles.accountsInfo, { color: colors.textSecondary }]}>
              Monitoring {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 100);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 8,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    fontWeight: '600' as const,
  },
  signalCount: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 2,
  },
  emptyButtonText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  noSignalsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noSignalsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 8,
  },
  accountsInfo: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
