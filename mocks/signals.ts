export type Sentiment = 'bullish' | 'bearish' | 'neutral';
export type Confidence = 'high' | 'medium' | 'low';
export type Category = 'stocks' | 'crypto' | 'politics' | 'general';

export interface Signal {
  id: string;
  accountHandle: string;
  accountName: string;
  tweetId: string;
  content: string;
  tickers: string[];
  sentiment: Sentiment;
  confidence: Confidence;
  category: Category;
  entryPrice?: number;
  targetPrice?: number;
  stopPrice?: number;
  postedAt: Date;
  createdAt: Date;
}

export interface Account {
  id: string;
  twitterHandle: string;
  name: string;
  category: Category;
  followersCount: number;
  isActive: boolean;
  addedAt: Date;
}

export interface Position {
  ticker: string;
  type: 'BUY' | 'SELL';
  mentions: number;
}

export interface StatusReport {
  insights: string[];
  generatedAt: Date;
}

const now = new Date();

export const mockSignals: Signal[] = [
  {
    id: '1',
    accountHandle: '@Han_Akamatsu',
    accountName: 'Han Akamatsu',
    tweetId: '1876543210',
    content: '$GME GameStop officially holds $9.1B in cash after converting 4.5B of their Bitcoin position. Absolutely massive war chest for acquisitions.',
    tickers: ['GME'],
    sentiment: 'bullish',
    confidence: 'high',
    category: 'stocks',
    entryPrice: 28.50,
    targetPrice: 45.00,
    postedAt: new Date(now.getTime() - 2 * 60 * 1000),
    createdAt: new Date(now.getTime() - 2 * 60 * 1000),
  },
  {
    id: '2',
    accountHandle: '@unusual_whales',
    accountName: 'Unusual Whales',
    tweetId: '1876543211',
    content: 'UNUSUAL OPTIONS ACTIVITY: $NVDA calls swept, 150 strike, 01/17 expiry. 15,000 contracts at $4.20. Someone knows something.',
    tickers: ['NVDA'],
    sentiment: 'bullish',
    confidence: 'high',
    category: 'stocks',
    entryPrice: 142.00,
    targetPrice: 160.00,
    postedAt: new Date(now.getTime() - 8 * 60 * 1000),
    createdAt: new Date(now.getTime() - 8 * 60 * 1000),
  },
  {
    id: '3',
    accountHandle: '@PeterSchiff',
    accountName: 'Peter Schiff',
    tweetId: '1876543212',
    content: '$BTC profit-taking accelerating. Seeing -30% from recent highs as weak hands fold. This is just the beginning of the correction.',
    tickers: ['BTC'],
    sentiment: 'bearish',
    confidence: 'medium',
    category: 'crypto',
    postedAt: new Date(now.getTime() - 15 * 60 * 1000),
    createdAt: new Date(now.getTime() - 15 * 60 * 1000),
  },
  {
    id: '4',
    accountHandle: '@TrendSpider',
    accountName: 'TrendSpider',
    tweetId: '1876543213',
    content: '$IREN breaking out of 3-month consolidation. Volume 3x average. First target $18, stretch target $24.',
    tickers: ['IREN'],
    sentiment: 'bullish',
    confidence: 'high',
    category: 'stocks',
    entryPrice: 15.20,
    targetPrice: 18.00,
    stopPrice: 13.50,
    postedAt: new Date(now.getTime() - 22 * 60 * 1000),
    createdAt: new Date(now.getTime() - 22 * 60 * 1000),
  },
  {
    id: '5',
    accountHandle: '@WallStJesus',
    accountName: 'Wall Street Jesus',
    tweetId: '1876543214',
    content: 'Adding to $TSLA here at $245. EV sentiment shifting, Robotaxi catalyst incoming. Risk/reward too good to ignore.',
    tickers: ['TSLA'],
    sentiment: 'bullish',
    confidence: 'medium',
    category: 'stocks',
    entryPrice: 245.00,
    targetPrice: 300.00,
    stopPrice: 220.00,
    postedAt: new Date(now.getTime() - 35 * 60 * 1000),
    createdAt: new Date(now.getTime() - 35 * 60 * 1000),
  },
  {
    id: '6',
    accountHandle: '@CryptoKaleo',
    accountName: 'Kaleo',
    tweetId: '1876543215',
    content: '$ETH looking ready for a squeeze. Shorts piling up at $3,200 resistance. Break above triggers cascade of liquidations.',
    tickers: ['ETH'],
    sentiment: 'bullish',
    confidence: 'medium',
    category: 'crypto',
    entryPrice: 3150.00,
    targetPrice: 3800.00,
    postedAt: new Date(now.getTime() - 48 * 60 * 1000),
    createdAt: new Date(now.getTime() - 48 * 60 * 1000),
  },
  {
    id: '7',
    accountHandle: '@zaborack',
    accountName: 'Zack Abraham',
    tweetId: '1876543216',
    content: '$SPY puts looking juicy here. VIX crushed, complacency extreme. Hedging my longs with 580P 01/31.',
    tickers: ['SPY'],
    sentiment: 'bearish',
    confidence: 'low',
    category: 'stocks',
    postedAt: new Date(now.getTime() - 67 * 60 * 1000),
    createdAt: new Date(now.getTime() - 67 * 60 * 1000),
  },
  {
    id: '8',
    accountHandle: '@MrZackMorris',
    accountName: 'Zack Morris',
    tweetId: '1876543217',
    content: '$BULL potential breakout above $17.3 resistance. Watching for confirmation with volume. Could run to $22.',
    tickers: ['BULL'],
    sentiment: 'bullish',
    confidence: 'medium',
    category: 'stocks',
    entryPrice: 17.30,
    targetPrice: 22.00,
    stopPrice: 15.80,
    postedAt: new Date(now.getTime() - 89 * 60 * 1000),
    createdAt: new Date(now.getTime() - 89 * 60 * 1000),
  },
];

export const mockAccounts: Account[] = [
  {
    id: '1',
    twitterHandle: '@Han_Akamatsu',
    name: 'Han Akamatsu',
    category: 'stocks',
    followersCount: 125000,
    isActive: true,
    addedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    twitterHandle: '@unusual_whales',
    name: 'Unusual Whales',
    category: 'stocks',
    followersCount: 890000,
    isActive: true,
    addedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    twitterHandle: '@PeterSchiff',
    name: 'Peter Schiff',
    category: 'crypto',
    followersCount: 1200000,
    isActive: true,
    addedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    twitterHandle: '@TrendSpider',
    name: 'TrendSpider',
    category: 'stocks',
    followersCount: 340000,
    isActive: true,
    addedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    twitterHandle: '@CryptoKaleo',
    name: 'Kaleo',
    category: 'crypto',
    followersCount: 560000,
    isActive: true,
    addedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    twitterHandle: '@WallStJesus',
    name: 'Wall Street Jesus',
    category: 'stocks',
    followersCount: 78000,
    isActive: true,
    addedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
];

export const mockPositions: Position[] = [
  { ticker: 'GME', type: 'BUY', mentions: 3 },
  { ticker: 'NVDA', type: 'BUY', mentions: 2 },
  { ticker: 'BTC', type: 'SELL', mentions: 1 },
  { ticker: 'TSLA', type: 'BUY', mentions: 2 },
  { ticker: 'IREN', type: 'BUY', mentions: 1 },
  { ticker: 'SPY', type: 'SELL', mentions: 1 },
  { ticker: 'ETH', type: 'BUY', mentions: 1 },
];

export const mockStatusReport: StatusReport = {
  insights: [
    'Strong market indication toward GME, NVDA, IREN',
    'Potential breakout on BULL above $17.3',
    'Risk-off signal: BTC profit-taking at -30%',
  ],
  generatedAt: new Date(now.getTime() - 30 * 60 * 1000),
};
