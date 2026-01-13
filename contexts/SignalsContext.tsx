import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';

export type Sentiment = 'bullish' | 'bearish' | 'neutral';
export type Confidence = 'high' | 'medium' | 'low';
export type Category = 'stocks' | 'crypto' | 'politics' | 'general';

export interface Account {
  id: string;
  twitterHandle: string;
  twitterUserId: string;
  name: string;
  category: Category;
  bio: string;
  followersCount: number;
  isActive: boolean;
  addedAt: string;
}

export interface Signal {
  id: string;
  accountHandle: string;
  accountName: string;
  tweetId: string;
  tweetUrl: string;
  content: string;
  tickers: string[];
  sentiment: Sentiment;
  confidence: Confidence;
  category: Category;
  entryPrice?: number;
  targetPrice?: number;
  stopPrice?: number;
  postedAt: string;
  createdAt: string;
}

interface SignalsContextType {
  accounts: Account[];
  signals: Signal[];
  isLoading: boolean;
  isRefreshing: boolean;
  addAccount: (handle: string) => Promise<Account | null>;
  removeAccount: (id: string) => Promise<void>;
  refreshSignals: () => Promise<void>;
  fetchTweetsForAccount: (account: Account) => Promise<void>;
  clearSignals: () => void;
}

const SignalsContext = createContext<SignalsContextType | undefined>(undefined);

const ACCOUNTS_STORAGE_KEY = 'situation_monitor_accounts';
const SIGNALS_STORAGE_KEY = 'situation_monitor_signals';

export function SignalsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lookupUserMutation = trpc.twitter.lookupUser.useMutation();
  const classifyAccountMutation = trpc.twitter.classifyAccount.useMutation();
  const fetchTweetsMutation = trpc.twitter.fetchTweets.useMutation();
  const processTweetMutation = trpc.signals.processTweet.useMutation();

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedAccounts, storedSignals] = await Promise.all([
        AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY),
        AsyncStorage.getItem(SIGNALS_STORAGE_KEY),
      ]);
      
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
        console.log('[SignalsContext] Loaded accounts from storage');
      }
      if (storedSignals) {
        setSignals(JSON.parse(storedSignals));
        console.log('[SignalsContext] Loaded signals from storage');
      }
    } catch (error) {
      console.error('[SignalsContext] Error loading stored data:', error);
    }
  };

  const saveAccounts = async (newAccounts: Account[]) => {
    try {
      await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(newAccounts));
    } catch (error) {
      console.error('[SignalsContext] Error saving accounts:', error);
    }
  };

  const saveSignals = async (newSignals: Signal[]) => {
    try {
      await AsyncStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(newSignals));
    } catch (error) {
      console.error('[SignalsContext] Error saving signals:', error);
    }
  };

  const addAccount = useCallback(async (handle: string): Promise<Account | null> => {
    const cleanHandle = handle.replace('@', '').trim();
    console.log('[SignalsContext] Adding account:', cleanHandle);
    console.log('[SignalsContext] API Base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    setIsLoading(true);

    try {
      console.log('[SignalsContext] Starting user lookup...');
      const userData = await lookupUserMutation.mutateAsync({ username: cleanHandle });
      console.log('[SignalsContext] User lookup result:', JSON.stringify(userData));

      console.log('[SignalsContext] Starting classification...');
      const classification = await classifyAccountMutation.mutateAsync({
        username: cleanHandle,
        bio: userData.description || '',
      });
      console.log('[SignalsContext] Classification:', JSON.stringify(classification));

      const newAccount: Account = {
        id: `acc_${Date.now()}`,
        twitterHandle: `@${cleanHandle}`,
        twitterUserId: userData.id || `mock_${cleanHandle}`,
        name: userData.name || cleanHandle,
        category: classification.category,
        bio: userData.description || '',
        followersCount: userData.public_metrics?.followers_count || 0,
        isActive: true,
        addedAt: new Date().toISOString(),
      };

      const existing = accounts.find(
        (a) => a.twitterHandle.toLowerCase() === newAccount.twitterHandle.toLowerCase()
      );
      if (existing) {
        console.log('[SignalsContext] Account already exists');
        setIsLoading(false);
        return existing;
      }

      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      await saveAccounts(updatedAccounts);
      
      console.log('[SignalsContext] Account added successfully');
      setIsLoading(false);
      return newAccount;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('[SignalsContext] Error adding account:', errorMessage);
      console.error('[SignalsContext] Error stack:', errorStack);
      console.error('[SignalsContext] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [accounts, lookupUserMutation, classifyAccountMutation]);

  const removeAccount = useCallback(async (id: string) => {
    console.log('[SignalsContext] Removing account:', id);
    const updatedAccounts = accounts.filter((a) => a.id !== id);
    setAccounts(updatedAccounts);
    await saveAccounts(updatedAccounts);
    
    const updatedSignals = signals.filter(
      (s) => !accounts.find((a) => a.id === id && a.twitterHandle === s.accountHandle)
    );
    setSignals(updatedSignals);
    await saveSignals(updatedSignals);
  }, [accounts, signals]);

  const fetchTweetsForAccount = useCallback(async (account: Account) => {
    console.log('[SignalsContext] Fetching tweets for:', account.twitterHandle);

    try {
      const result = await fetchTweetsMutation.mutateAsync({
        userId: account.twitterUserId,
        username: account.twitterHandle.replace('@', ''),
        maxResults: 10,
      });

      if (result.isMock || !result.tweets.length) {
        console.log('[SignalsContext] No tweets or mock mode');
        return;
      }

      console.log('[SignalsContext] Processing', result.tweets.length, 'tweets');

      for (const tweet of result.tweets) {
        try {
          const signalResult = await processTweetMutation.mutateAsync({
            accountHandle: account.twitterHandle,
            accountName: account.name,
            accountCategory: account.category,
            tweetId: tweet.id,
            tweetText: tweet.text,
            tweetUrl: tweet.url,
            postedAt: tweet.created_at,
          });

          if (signalResult.isNew && signalResult.signal) {
            setSignals((prev) => {
              const updated = [signalResult.signal!, ...prev];
              saveSignals(updated);
              return updated;
            });
          }
        } catch (err) {
          console.error('[SignalsContext] Error processing tweet:', err);
        }
      }
    } catch (error) {
      console.error('[SignalsContext] Error fetching tweets:', error);
    }
  }, [fetchTweetsMutation, processTweetMutation]);

  const refreshSignals = useCallback(async () => {
    if (accounts.length === 0) {
      console.log('[SignalsContext] No accounts to refresh');
      return;
    }

    console.log('[SignalsContext] Refreshing signals for', accounts.length, 'accounts');
    setIsRefreshing(true);

    for (const account of accounts) {
      await fetchTweetsForAccount(account);
    }

    setIsRefreshing(false);
    console.log('[SignalsContext] Refresh complete');
  }, [accounts, fetchTweetsForAccount]);

  const clearSignals = useCallback(() => {
    setSignals([]);
    AsyncStorage.removeItem(SIGNALS_STORAGE_KEY);
    console.log('[SignalsContext] Signals cleared');
  }, []);

  return (
    <SignalsContext.Provider
      value={{
        accounts,
        signals,
        isLoading,
        isRefreshing,
        addAccount,
        removeAccount,
        refreshSignals,
        fetchTweetsForAccount,
        clearSignals,
      }}
    >
      {children}
    </SignalsContext.Provider>
  );
}

export function useSignals() {
  const context = useContext(SignalsContext);
  if (!context) {
    throw new Error('useSignals must be used within a SignalsProvider');
  }
  return context;
}
