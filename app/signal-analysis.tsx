import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Sparkles, AlertTriangle, TrendingUp, MessageCircle, RefreshCw, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignals } from '@/contexts/SignalsContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';

const AnalysisSchema = z.object({
  summary: z.string().describe('A concise 2-3 sentence summary of what the tweet is saying about the position'),
  bullCase: z.string().describe('A compelling bull case for this position based on the tweet content and general market knowledge'),
  scamRisk: z.enum(['low', 'medium', 'high']).describe('Risk level that this could be a pump and dump or scam'),
  scamIndicators: z.array(z.string()).describe('List of specific red flags or warning signs if any'),
  sentiment: z.enum(['very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish']).describe('Overall sentiment of the analysis'),
  keyPoints: z.array(z.string()).describe('Key points from the tweet about this position'),
});

type Analysis = z.infer<typeof AnalysisSchema>;

export default function SignalAnalysisScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signalId } = useLocalSearchParams<{ signalId: string }>();
  const { signals } = useSignals();
  
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signal = signals.find(s => s.id === signalId);

  useEffect(() => {
    if (signal) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalId]);

  const runAnalysis = async () => {
    if (!signal) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[SignalAnalysis] Running AI analysis for signal:', signal.id);
      
      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: `Analyze this trading signal tweet and provide insights:

TWEET FROM: ${signal.accountHandle} (${signal.accountName})
TICKERS MENTIONED: ${signal.tickers.join(', ')}
SENTIMENT: ${signal.sentiment}
CONTENT: "${signal.content}"

${signal.entryPrice ? `Entry Price: $${signal.entryPrice}` : ''}
${signal.targetPrice ? `Target Price: $${signal.targetPrice}` : ''}
${signal.stopPrice ? `Stop Price: $${signal.stopPrice}` : ''}

Please analyze this signal and provide:
1. A clear summary of what's being said
2. A bull case for why this position could be profitable
3. Assessment of scam/pump-and-dump risk
4. Any red flags or warning signs
5. Key takeaways

Be honest and balanced in your analysis. If there are concerns, highlight them clearly.`,
          },
        ],
        schema: AnalysisSchema,
      });

      console.log('[SignalAnalysis] Analysis complete:', result);
      setAnalysis(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[SignalAnalysis] Error running analysis:', errorMessage);
      console.error('[SignalAnalysis] Full error:', JSON.stringify(err, null, 2));
      setError(`Failed to analyze signal: ${errorMessage}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTweet = () => {
    if (signal?.tweetUrl) {
      Linking.openURL(signal.tweetUrl);
    }
  };

  const getScamRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return colors.bullishText;
      case 'medium': return '#f59e0b';
      case 'high': return colors.bearishText;
      default: return colors.textDim;
    }
  };

  const getScamRiskBg = (risk: string) => {
    switch (risk) {
      case 'low': return colors.bullishBg;
      case 'medium': return 'rgba(245, 158, 11, 0.2)';
      case 'high': return colors.bearishBg;
      default: return colors.bgCard;
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'very_bullish': return '🚀';
      case 'bullish': return '📈';
      case 'neutral': return '➡️';
      case 'bearish': return '📉';
      case 'very_bearish': return '💀';
      default: return '❓';
    }
  };

  if (!signal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Signal not found
          </Text>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: colors.border }]}>
            <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>GO BACK</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backPressable}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Sparkles size={16} color={colors.accent} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>AI ANALYSIS</Text>
        </View>
        <Pressable onPress={runAnalysis} disabled={isLoading}>
          <RefreshCw size={18} color={isLoading ? colors.textDim : colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.signalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.signalHeader}>
            <Text style={[styles.signalHandle, { color: colors.textPrimary }]}>{signal.accountHandle}</Text>
            <Pressable onPress={handleOpenTweet} style={styles.externalLink}>
              <ExternalLink size={14} color={colors.textDim} />
            </Pressable>
          </View>
          <Text style={[styles.signalContent, { color: colors.textSecondary }]} numberOfLines={4}>
            {signal.content}
          </Text>
          <View style={styles.tickerRow}>
            {signal.tickers.map((ticker) => (
              <View key={ticker} style={[styles.tickerBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.tickerText, { color: colors.bg }]}>${ticker}</Text>
              </View>
            ))}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textDim }]}>
              Analyzing signal...
            </Text>
            <Text style={[styles.loadingSubtext, { color: colors.textDim }]}>
              Checking for scam indicators and building bull case
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={32} color={colors.bearishText} />
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
            <Pressable 
              onPress={runAnalysis} 
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.retryText, { color: colors.bg }]}>TRY AGAIN</Text>
            </Pressable>
          </View>
        ) : analysis ? (
          <>
            <View style={[styles.section, { borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <MessageCircle size={14} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>SUMMARY</Text>
              </View>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {analysis.summary}
              </Text>
            </View>

            <View style={[styles.section, { borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={14} color={colors.bullishText} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>BULL CASE</Text>
                <Text style={styles.sentimentEmoji}>{getSentimentEmoji(analysis.sentiment)}</Text>
              </View>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {analysis.bullCase}
              </Text>
            </View>

            <View style={[styles.section, { borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={14} color={getScamRiskColor(analysis.scamRisk)} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>SCAM RISK</Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: getScamRiskBg(analysis.scamRisk) }]}>
                <Text style={[styles.riskText, { color: getScamRiskColor(analysis.scamRisk) }]}>
                  {analysis.scamRisk.toUpperCase()} RISK
                </Text>
              </View>
              {analysis.scamIndicators.length > 0 ? (
                <View style={styles.indicatorsList}>
                  {analysis.scamIndicators.map((indicator, index) => (
                    <View key={index} style={styles.indicatorItem}>
                      <Text style={[styles.indicatorBullet, { color: colors.bearishText }]}>⚠</Text>
                      <Text style={[styles.indicatorText, { color: colors.textSecondary }]}>
                        {indicator}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noIndicators, { color: colors.bullishText }]}>
                  No major red flags detected
                </Text>
              )}
            </View>

            {analysis.keyPoints.length > 0 && (
              <View style={[styles.section, { borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={14} color={colors.accent} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>KEY POINTS</Text>
                </View>
                <View style={styles.keyPointsList}>
                  {analysis.keyPoints.map((point, index) => (
                    <View key={index} style={styles.keyPointItem}>
                      <Text style={[styles.keyPointBullet, { color: colors.accent }]}>•</Text>
                      <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={[styles.disclaimer, { color: colors.textDim }]}>
              This analysis is AI-generated and should not be considered financial advice. 
              Always do your own research before making investment decisions.
            </Text>
          </>
        ) : null}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backPressable: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  signalCard: {
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalHandle: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  externalLink: {
    padding: 4,
  },
  signalContent: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    marginBottom: 10,
  },
  tickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tickerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  tickerText: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  loadingSubtext: {
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 2,
  },
  retryText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  sentimentEmoji: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  sectionContent: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    marginBottom: 12,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  indicatorsList: {
    gap: 8,
  },
  indicatorItem: {
    flexDirection: 'row',
    gap: 8,
  },
  indicatorBullet: {
    fontSize: 12,
  },
  indicatorText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  noIndicators: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  keyPointsList: {
    gap: 8,
  },
  keyPointItem: {
    flexDirection: 'row',
    gap: 8,
  },
  keyPointBullet: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  keyPointText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 9,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 14,
    paddingHorizontal: 16,
  },
});
