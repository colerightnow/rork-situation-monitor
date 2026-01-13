import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePositions, PositionSentiment } from '@/contexts/PositionsContext';
import * as Haptics from 'expo-haptics';

const POPULAR_TICKERS = ['AAPL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'AMD', 'MSFT', 'AMZN', 'META', 'GOOGL', 'BTC', 'ETH'];

export default function AddPositionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addPosition, hasPosition } = usePositions();
  const [ticker, setTicker] = useState('');
  const [sentiment, setSentiment] = useState<PositionSentiment>('bullish');
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    router.back();
  };

  const handleAddPosition = () => {
    if (!ticker.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPosition(ticker.trim(), sentiment, { notes: notes.trim() || undefined });
    router.back();
  };

  const handleQuickAdd = (quickTicker: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTicker(quickTicker);
  };

  const isValid = ticker.trim().length > 0;
  const alreadyExists = hasPosition(ticker);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>ADD POSITION</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <X size={20} color={colors.textDim} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDim }]}>TICKER SYMBOL</Text>
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
              <Text style={[styles.dollarSign, { color: colors.accent }]}>$</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={ticker}
                onChangeText={(text) => setTicker(text.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="AAPL, TSLA, BTC..."
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={10}
              />
              {ticker.length > 0 && (
                <Pressable onPress={() => setTicker('')} hitSlop={8}>
                  <X size={16} color={colors.textDim} />
                </Pressable>
              )}
            </View>
            {alreadyExists && (
              <Text style={[styles.existsWarning, { color: colors.accent }]}>
                This ticker is already in your watchlist
              </Text>
            )}
          </View>

          <View style={styles.quickTickers}>
            <Text style={[styles.label, { color: colors.textDim }]}>QUICK ADD</Text>
            <View style={styles.tickerGrid}>
              {POPULAR_TICKERS.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => handleQuickAdd(t)}
                  style={({ pressed }) => [
                    styles.quickTickerButton,
                    {
                      borderColor: ticker === t ? colors.accent : colors.border,
                      backgroundColor: ticker === t ? colors.accent : 'transparent',
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickTickerText,
                      { color: ticker === t ? colors.bg : colors.textSecondary },
                    ]}
                  >
                    ${t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDim }]}>SENTIMENT</Text>
            <View style={styles.sentimentRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSentiment('bullish');
                }}
                style={({ pressed }) => [
                  styles.sentimentButton,
                  {
                    borderColor: sentiment === 'bullish' ? colors.bullishBorder : colors.border,
                    backgroundColor: sentiment === 'bullish' ? colors.bullishBg : 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <TrendingUp size={18} color={sentiment === 'bullish' ? colors.bullishText : colors.textDim} />
                <Text
                  style={[
                    styles.sentimentText,
                    { color: sentiment === 'bullish' ? colors.bullishText : colors.textDim },
                  ]}
                >
                  BULLISH
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSentiment('bearish');
                }}
                style={({ pressed }) => [
                  styles.sentimentButton,
                  {
                    borderColor: sentiment === 'bearish' ? colors.bearishBorder : colors.border,
                    backgroundColor: sentiment === 'bearish' ? colors.bearishBg : 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <TrendingDown size={18} color={sentiment === 'bearish' ? colors.bearishText : colors.textDim} />
                <Text
                  style={[
                    styles.sentimentText,
                    { color: sentiment === 'bearish' ? colors.bearishText : colors.textDim },
                  ]}
                >
                  BEARISH
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDim }]}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={[
                styles.notesInput,
                { borderColor: colors.border, backgroundColor: colors.bgCard, color: colors.textPrimary },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Entry thesis, price targets, etc..."
              placeholderTextColor={colors.textDim}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleAddPosition}
            disabled={!isValid}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: isValid ? colors.accent : colors.border,
              },
              pressed && isValid && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.addButtonText, { color: isValid ? colors.bg : colors.textDim }]}>
              {alreadyExists ? 'UPDATE POSITION' : 'ADD TO WATCHLIST'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 12,
    height: 48,
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  existsWarning: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 6,
  },
  quickTickers: {
    marginBottom: 24,
  },
  tickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 2,
  },
  quickTickerText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  sentimentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sentimentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 2,
  },
  sentimentText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    minHeight: 80,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 2,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
});
