import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Signal } from '@/contexts/SignalsContext';
import { usePositions } from '@/contexts/PositionsContext';
import { Plus, ExternalLink, Check, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface SignalCardProps {
  signal: Signal;
  onPress?: () => void;
  isHighlighted?: boolean;
}

function formatTimeAgo(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function SignalCard({ signal, onPress, isHighlighted }: SignalCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { addPosition, hasPosition } = usePositions();
  const [showActions, setShowActions] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    setShowActions(true);
  };

  const handleOpenTweet = () => {
    setShowActions(false);
    const tweetUrl = signal.tweetUrl || `https://x.com/${signal.accountHandle.replace('@', '')}/status/${signal.tweetId}`;
    Linking.openURL(tweetUrl).catch((err) => {
      console.log('Failed to open tweet:', err);
    });
  };

  const handleAddTicker = (ticker: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const sentiment = signal.sentiment === 'bearish' ? 'bearish' : 'bullish';
    addPosition(ticker, sentiment, {
      notes: signal.content,
      sourceSignalId: signal.id,
      sourceTweetUrl: signal.tweetUrl,
      entryPrice: signal.entryPrice,
    });
    Alert.alert('Added!', `${ticker} added to your watchlist as ${sentiment.toUpperCase()}`);
  };

  const handleAddAllTickers = () => {
    setShowActions(false);
    const sentiment = signal.sentiment === 'bearish' ? 'bearish' : 'bullish';
    signal.tickers.forEach((ticker) => {
      addPosition(ticker, sentiment, {
        notes: signal.content,
        sourceSignalId: signal.id,
        sourceTweetUrl: signal.tweetUrl,
        entryPrice: signal.entryPrice,
      });
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added!', `${signal.tickers.length} position${signal.tickers.length > 1 ? 's' : ''} added to your watchlist`);
  };

  const handleAiAnalysis = () => {
    setShowActions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/signal-analysis', params: { signalId: signal.id } });
  };

  const sentimentColors = {
    bullish: {
      bg: colors.bullishBg,
      border: colors.bullishBorder,
      text: colors.bullishText,
    },
    bearish: {
      bg: colors.bearishBg,
      border: colors.bearishBorder,
      text: colors.bearishText,
    },
    neutral: {
      bg: 'rgba(128, 128, 128, 0.2)',
      border: '#888888',
      text: colors.textDim,
    },
  };

  const sentimentStyle = sentimentColors[signal.sentiment];

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.bgCard,
            borderColor: isHighlighted ? colors.accent : colors.border,
            borderWidth: isHighlighted ? 2 : 1,
          },
          pressed && { borderColor: colors.borderHover },
          isHighlighted && styles.highlighted,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.accountInfo}>
            <Text style={[styles.handle, { color: colors.textPrimary }]}>
              {signal.accountHandle}
            </Text>
            <Text style={[styles.time, { color: colors.textDim }]}>
              {formatTimeAgo(signal.postedAt)}
            </Text>
          </View>
          <View style={styles.badges}>
            {signal.tickers.map((ticker) => {
              const inWatchlist = hasPosition(ticker);
              return (
                <Pressable
                  key={ticker}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (!inWatchlist) {
                      handleAddTicker(ticker);
                    }
                  }}
                  style={[
                    styles.tickerBadge,
                    { backgroundColor: inWatchlist ? colors.bullishBg : colors.accent },
                  ]}
                >
                  {inWatchlist && <Check size={8} color={colors.bullishText} />}
                  <Text style={[styles.tickerText, { color: inWatchlist ? colors.bullishText : colors.bg }]}>
                    ${ticker}
                  </Text>
                </Pressable>
              );
            })}
            <View
              style={[
                styles.sentimentBadge,
                {
                  backgroundColor: sentimentStyle.bg,
                  borderColor: sentimentStyle.border,
                },
              ]}
            >
              <Text style={[styles.sentimentText, { color: sentimentStyle.text }]}>
                {signal.sentiment.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.content, { color: colors.textSecondary }]}>
          {signal.content}
        </Text>
        {(signal.entryPrice || signal.targetPrice || signal.stopPrice) && (
          <View style={styles.priceRow}>
            {signal.entryPrice && (
              <Text style={[styles.priceLabel, { color: colors.textDim }]}>
                Entry: <Text style={{ color: colors.textSecondary }}>${signal.entryPrice}</Text>
              </Text>
            )}
            {signal.targetPrice && (
              <Text style={[styles.priceLabel, { color: colors.textDim }]}>
                Target: <Text style={{ color: colors.bullishText }}>${signal.targetPrice}</Text>
              </Text>
            )}
            {signal.stopPrice && (
              <Text style={[styles.priceLabel, { color: colors.textDim }]}>
                Stop: <Text style={{ color: colors.bearishText }}>${signal.stopPrice}</Text>
              </Text>
            )}
          </View>
        )}
      </Pressable>

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowActions(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.actionSheetTitle, { color: colors.textPrimary }]}>
              SIGNAL ACTIONS
            </Text>
            
            <Pressable
              onPress={handleAiAnalysis}
              style={({ pressed }) => [
                styles.actionButton,
                styles.aiButton,
                { backgroundColor: pressed ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.9)' },
              ]}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
                AI ANALYSIS & SCAM CHECK
              </Text>
            </Pressable>

            <Pressable
              onPress={handleOpenTweet}
              style={({ pressed }) => [
                styles.actionButton,
                { borderColor: colors.border },
                pressed && { backgroundColor: colors.bg },
              ]}
            >
              <ExternalLink size={16} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                VIEW ORIGINAL TWEET
              </Text>
            </Pressable>

            {signal.tickers.length > 0 && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.actionSectionTitle, { color: colors.textDim }]}>
                  ADD TO WATCHLIST
                </Text>
                
                {signal.tickers.map((ticker) => {
                  const inWatchlist = hasPosition(ticker);
                  return (
                    <Pressable
                      key={ticker}
                      onPress={() => {
                        if (!inWatchlist) {
                          handleAddTicker(ticker);
                        }
                      }}
                      disabled={inWatchlist}
                      style={({ pressed }) => [
                        styles.actionButton,
                        { borderColor: colors.border },
                        pressed && !inWatchlist && { backgroundColor: colors.bg },
                        inWatchlist && { opacity: 0.5 },
                      ]}
                    >
                      {inWatchlist ? (
                        <Check size={16} color={colors.bullishText} />
                      ) : (
                        <Plus size={16} color={colors.accent} />
                      )}
                      <Text style={[styles.actionText, { color: inWatchlist ? colors.bullishText : colors.accent }]}>
                        ${ticker} {inWatchlist ? '(IN WATCHLIST)' : ''}
                      </Text>
                    </Pressable>
                  );
                })}

                {signal.tickers.length > 1 && !signal.tickers.every(hasPosition) && (
                  <Pressable
                    onPress={handleAddAllTickers}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.primaryAction,
                      { backgroundColor: colors.accent },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Plus size={16} color={colors.bg} />
                    <Text style={[styles.actionText, { color: colors.bg }]}>
                      ADD ALL ({signal.tickers.length})
                    </Text>
                  </Pressable>
                )}
              </>
            )}

            <Pressable
              onPress={() => setShowActions(false)}
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.textDim }]}>CANCEL</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 2,
    marginBottom: 8,
  },
  highlighted: {
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  handle: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 9,
    fontFamily: 'monospace',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  tickerText: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  sentimentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
  },
  sentimentText: {
    fontSize: 9,
    fontWeight: '600' as const,
    fontFamily: 'monospace',
  },
  content: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 16,
    paddingBottom: 32,
  },
  actionSheetTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionSectionTitle: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 2,
    marginBottom: 8,
  },
  primaryAction: {
    borderWidth: 0,
  },
  aiButton: {
    borderWidth: 0,
  },
  actionText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cancelButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 2,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
