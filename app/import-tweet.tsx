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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Link2, FileText, Sparkles, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePositions, PositionSentiment } from '@/contexts/PositionsContext';
import * as Haptics from 'expo-haptics';

interface ExtractedData {
  tickers: string[];
  sentiment: PositionSentiment;
  content: string;
}

export default function ImportTweetScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addPosition } = usePositions();
  const [tweetUrl, setTweetUrl] = useState('');
  const [tweetText, setTweetText] = useState('');
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set());

  const handleClose = () => {
    router.back();
  };

  const extractTickersFromText = (text: string): string[] => {
    const tickerRegex = /\$([A-Za-z]{1,5})\b/g;
    const matches = text.match(tickerRegex) || [];
    return [...new Set(matches.map((m) => m.replace('$', '').toUpperCase()))];
  };

  const detectSentiment = (text: string): PositionSentiment => {
    const bullishWords = ['buy', 'long', 'bullish', 'moon', 'calls', 'breakout', 'support', 'accumulate', 'load', 'adding'];
    const bearishWords = ['sell', 'short', 'bearish', 'puts', 'dump', 'resistance', 'crash', 'fade', 'exit'];
    
    const lowerText = text.toLowerCase();
    const bullishCount = bullishWords.filter((w) => lowerText.includes(w)).length;
    const bearishCount = bearishWords.filter((w) => lowerText.includes(w)).length;
    
    return bullishCount >= bearishCount ? 'bullish' : 'bearish';
  };

  const extractTweetId = (url: string): string | null => {
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleAnalyze = async () => {
    const textToAnalyze = mode === 'url' ? tweetUrl : tweetText;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let contentToAnalyze = textToAnalyze;
      
      if (mode === 'url') {
        const tweetId = extractTweetId(tweetUrl);
        if (!tweetId) {
          Alert.alert(
            'Invalid URL',
            'Could not extract tweet ID from the URL. Make sure you\'re using a valid Twitter/X URL.',
            [{ text: 'OK' }]
          );
          setIsAnalyzing(false);
          return;
        }
        
        console.log('[ImportTweet] Fetching tweet:', tweetId);
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/trpc/twitter.getTweetById`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ json: { tweetId } }),
            }
          );
          
          console.log('[ImportTweet] Response status:', response.status);
          const result = await response.json();
          console.log('[ImportTweet] Full API response:', JSON.stringify(result, null, 2));
          
          const tweetData = result?.result?.data?.json;
          console.log('[ImportTweet] Parsed tweetData:', JSON.stringify(tweetData, null, 2));
          
          if (tweetData?.text) {
            contentToAnalyze = tweetData.text;
            console.log('[ImportTweet] Got tweet text:', contentToAnalyze);
          } else if (tweetData?.error) {
            console.log('[ImportTweet] API returned error:', tweetData.error);
            Alert.alert(
              'Twitter API Error',
              `${tweetData.error}\n\nUse "Paste Text" to manually paste the tweet content.`,
              [{ text: 'OK' }]
            );
            setIsAnalyzing(false);
            return;
          } else {
            console.log('[ImportTweet] No text and no error in response - unexpected structure');
            Alert.alert(
              'Could Not Fetch Tweet',
              'Twitter API did not return the tweet text. This could be due to:\n\n• API access level (Basic tier may have limitations)\n• Rate limiting\n• Tweet is protected or deleted\n\nTry using "Paste Text" to manually paste the tweet content.',
              [{ text: 'OK' }]
            );
            setIsAnalyzing(false);
            return;
          }
        } catch (err) {
          console.log('[ImportTweet] Fetch error:', err);
          Alert.alert(
            'Network Error',
            'Could not connect to Twitter API. Use "Paste Text" to manually paste the tweet content.',
            [{ text: 'OK' }]
          );
          setIsAnalyzing(false);
          return;
        }
      }
      
      const tickers = extractTickersFromText(contentToAnalyze);
      const sentiment = detectSentiment(contentToAnalyze);
      
      const data: ExtractedData = {
        tickers,
        sentiment,
        content: mode === 'text' ? tweetText : contentToAnalyze,
      };
      
      setExtractedData(data);
      setSelectedTickers(new Set(tickers));
      
      if (tickers.length === 0) {
        Alert.alert(
          'No Tickers Found',
          'No stock tickers (like $AAPL) were found in the text. You can still add positions manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[ImportTweet] Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze the content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTicker = (ticker: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else {
        next.add(ticker);
      }
      return next;
    });
  };

  const handleAddPositions = () => {
    if (!extractedData || selectedTickers.size === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    selectedTickers.forEach((ticker) => {
      addPosition(ticker, extractedData.sentiment, {
        notes: extractedData.content,
        sourceTweetUrl: mode === 'url' ? tweetUrl : undefined,
      });
    });

    Alert.alert(
      'Positions Added',
      `Added ${selectedTickers.size} position${selectedTickers.size > 1 ? 's' : ''} to your watchlist.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleReset = () => {
    setExtractedData(null);
    setSelectedTickers(new Set());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>IMPORT TWEET</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <X size={20} color={colors.textDim} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Paste a tweet URL to extract trading signals and add them to your watchlist.
          </Text>

          <View style={styles.modeToggle}>
            <Pressable
              onPress={() => setMode('url')}
              style={[
                styles.modeButton,
                {
                  borderColor: mode === 'url' ? colors.accent : colors.border,
                  backgroundColor: mode === 'url' ? colors.accent : 'transparent',
                },
              ]}
            >
              <Link2 size={16} color={mode === 'url' ? colors.bg : colors.textDim} />
              <Text style={[styles.modeText, { color: mode === 'url' ? colors.bg : colors.textDim }]}>
                TWEET URL
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('text')}
              style={[
                styles.modeButton,
                {
                  borderColor: mode === 'text' ? colors.accent : colors.border,
                  backgroundColor: mode === 'text' ? colors.accent : 'transparent',
                },
              ]}
            >
              <FileText size={16} color={mode === 'text' ? colors.bg : colors.textDim} />
              <Text style={[styles.modeText, { color: mode === 'text' ? colors.bg : colors.textDim }]}>
                PASTE TEXT
              </Text>
            </Pressable>
          </View>

          {mode === 'text' ? (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textDim }]}>TWEET CONTENT</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { borderColor: colors.border, backgroundColor: colors.bgCard, color: colors.textPrimary },
                ]}
                value={tweetText}
                onChangeText={setTweetText}
                placeholder="Paste the tweet text here...&#10;&#10;Example: $NVDA breaking out! Adding to my position here at $140. Target $160."
                placeholderTextColor={colors.textDim}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textDim }]}>TWEET URL</Text>
              <TextInput
                style={[
                  styles.urlInput,
                  { borderColor: colors.border, backgroundColor: colors.bgCard, color: colors.textPrimary },
                ]}
                value={tweetUrl}
                onChangeText={setTweetUrl}
                placeholder="https://x.com/user/status/..."
                placeholderTextColor={colors.textDim}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          )}

          {!extractedData ? (
            <Pressable
              onPress={handleAnalyze}
              disabled={isAnalyzing || (mode === 'text' ? !tweetText.trim() : !tweetUrl.trim())}
              style={({ pressed }) => [
                styles.analyzeButton,
                {
                  backgroundColor: colors.accent,
                  opacity: isAnalyzing || (mode === 'text' ? !tweetText.trim() : !tweetUrl.trim()) ? 0.5 : 1,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color={colors.bg} />
              ) : (
                <>
                  <Sparkles size={16} color={colors.bg} />
                  <Text style={[styles.analyzeButtonText, { color: colors.bg }]}>
                    ANALYZE & EXTRACT
                  </Text>
                </>
              )}
            </Pressable>
          ) : (
            <View style={styles.resultsContainer}>
              <View style={[styles.resultsHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>
                  EXTRACTED SIGNALS
                </Text>
                <Pressable onPress={handleReset}>
                  <Text style={[styles.resetText, { color: colors.accent }]}>RESET</Text>
                </Pressable>
              </View>

              {extractedData.tickers.length > 0 ? (
                <>
                  <Text style={[styles.label, { color: colors.textDim, marginTop: 12 }]}>
                    SELECT TICKERS TO ADD
                  </Text>
                  <View style={styles.tickerList}>
                    {extractedData.tickers.map((ticker) => (
                      <Pressable
                        key={ticker}
                        onPress={() => toggleTicker(ticker)}
                        style={[
                          styles.tickerItem,
                          {
                            borderColor: selectedTickers.has(ticker) ? colors.accent : colors.border,
                            backgroundColor: selectedTickers.has(ticker) ? colors.accent : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tickerItemText,
                            { color: selectedTickers.has(ticker) ? colors.bg : colors.textSecondary },
                          ]}
                        >
                          ${ticker}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.sentimentDisplay}>
                    <Text style={[styles.label, { color: colors.textDim }]}>DETECTED SENTIMENT</Text>
                    <View
                      style={[
                        styles.sentimentBadge,
                        {
                          backgroundColor:
                            extractedData.sentiment === 'bullish' ? colors.bullishBg : colors.bearishBg,
                          borderColor:
                            extractedData.sentiment === 'bullish' ? colors.bullishBorder : colors.bearishBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sentimentBadgeText,
                          {
                            color:
                              extractedData.sentiment === 'bullish' ? colors.bullishText : colors.bearishText,
                          },
                        ]}
                      >
                        {extractedData.sentiment.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noTickersContainer}>
                  <Text style={[styles.noTickersText, { color: colors.textDim }]}>
                    No tickers found. Try adding positions manually using the Add Position screen.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {extractedData && selectedTickers.size > 0 && (
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleAddPositions}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: colors.accent },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Plus size={16} color={colors.bg} />
              <Text style={[styles.addButtonText, { color: colors.bg }]}>
                ADD {selectedTickers.size} POSITION{selectedTickers.size > 1 ? 'S' : ''}
              </Text>
            </Pressable>
          </View>
        )}
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
  description: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    marginBottom: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 2,
  },
  modeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    minHeight: 140,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    height: 48,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 2,
  },
  analyzeButtonText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  resultsTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  resetText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  tickerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 2,
  },
  tickerItemText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
  },
  sentimentDisplay: {
    marginTop: 20,
  },
  sentimentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 2,
  },
  sentimentBadgeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  noTickersContainer: {
    paddingVertical: 20,
  },
  noTickersText: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 2,
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
});
