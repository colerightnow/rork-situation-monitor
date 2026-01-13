import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface Position {
  ticker: string;
  type: 'BUY' | 'SELL';
  mentions: number;
  entryPrice?: number;
}

interface PositionItemProps {
  position: Position;
}

const CRYPTO_SYMBOLS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'DOGE': 'dogecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
};

interface PriceData {
  price: number;
  change24h: number;
}

async function fetchCryptoPrice(symbol: string): Promise<PriceData | null> {
  const coinId = CRYPTO_SYMBOLS[symbol.toUpperCase()];
  if (!coinId) return null;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();
    if (data[coinId]) {
      return {
        price: data[coinId].usd,
        change24h: data[coinId].usd_24h_change || 0,
      };
    }
  } catch (error) {
    console.log('Error fetching crypto price:', error);
  }
  return null;
}

async function fetchStockPrice(symbol: string): Promise<PriceData | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (result) {
      const meta = result.meta;
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose || meta.previousClose;
      const change = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
      return {
        price: currentPrice,
        change24h: change,
      };
    }
  } catch (error) {
    console.log('Error fetching stock price:', error);
  }
  return null;
}

export default function PositionItem({ position }: PositionItemProps) {
  const { colors } = useTheme();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      const isCrypto = CRYPTO_SYMBOLS[position.ticker.toUpperCase()];
      const data = isCrypto
        ? await fetchCryptoPrice(position.ticker)
        : await fetchStockPrice(position.ticker);
      setPriceData(data);
      setLoading(false);
    };
    
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [position.ticker]);

  const isBuy = position.type === 'BUY';

  const formatPrice = (price: number | null | undefined): string => {
    if (price == null || isNaN(price)) return '--';
    try {
      if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (price >= 1) return price.toFixed(2);
      return price.toFixed(4);
    } catch {
      return '--';
    }
  };

  const formatChange = (change: number | null | undefined): string => {
    if (change == null || isNaN(change)) return '0.00';
    try {
      return change.toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const getChangeValue = (): number => {
    if (!priceData || priceData.change24h == null || isNaN(priceData.change24h)) return 0;
    return priceData.change24h;
  };

  const getGainFromEntry = (): number | null => {
    if (!position.entryPrice || !priceData?.price) return null;
    return ((priceData.price - position.entryPrice) / position.entryPrice) * 100;
  };

  const isPositiveChange = getChangeValue() >= 0;
  const gainFromEntry = getGainFromEntry();
  const isPositiveGain = gainFromEntry !== null ? gainFromEntry >= 0 : true;

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.ticker, { color: colors.textPrimary }]}>
          ${position.ticker}
        </Text>
        <View style={styles.priceRow}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.textDim} />
          ) : priceData ? (
            <>
              <Text style={[styles.price, { color: colors.textPrimary }]}>
                ${formatPrice(priceData.price)}
              </Text>
              <View style={[styles.changeContainer, { backgroundColor: isPositiveChange ? colors.bullishBg : colors.bearishBg }]}>
                {isPositiveChange ? (
                  <TrendingUp size={10} color={colors.bullishText} />
                ) : (
                  <TrendingDown size={10} color={colors.bearishText} />
                )}
                <Text style={[styles.change, { color: isPositiveChange ? colors.bullishText : colors.bearishText }]}>
                  {`${isPositiveChange ? '+' : ''}${formatChange(priceData.change24h)}%`}
                </Text>
              </View>
            </>
          ) : (
            <Text style={[styles.priceUnavailable, { color: colors.textDim }]}>--</Text>
          )}
        </View>
        {position.entryPrice && (
          <View style={styles.entryRow}>
            <Text style={[styles.entryLabel, { color: colors.textDim }]}>
              Entry: ${formatPrice(position.entryPrice)}
            </Text>
            {gainFromEntry !== null && (
              <View style={[styles.gainContainer, { backgroundColor: isPositiveGain ? colors.bullishBg : colors.bearishBg }]}>
                <Text style={[styles.gainText, { color: isPositiveGain ? colors.bullishText : colors.bearishText }]}>
                  {isPositiveGain ? '↑' : '↓'} {`${isPositiveGain ? '+' : ''}${formatChange(gainFromEntry)}%`}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={styles.rightSection}>
        {position.mentions > 1 && (
          <Text style={[styles.mentions, { color: colors.textDim }]}>
            {position.mentions}x
          </Text>
        )}
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: isBuy ? colors.bullishBg : colors.bearishBg,
              borderColor: isBuy ? colors.bullishBorder : colors.bearishBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              { color: isBuy ? colors.bullishText : colors.bearishText },
            ]}
          >
            {isBuy ? 'BULLISH' : 'BEARISH'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
  },
  ticker: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  price: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '500' as const,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 3,
  },
  change: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  priceUnavailable: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  entryLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  gainContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  gainText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center' as const,
  },
  mentions: {
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.6,
  },
});
