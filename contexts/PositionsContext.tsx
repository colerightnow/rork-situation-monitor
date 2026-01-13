import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PositionSentiment = 'bullish' | 'bearish';

export interface AiAnalysis {
  summary: string;
  bullCase: string;
  scamRisk: 'low' | 'medium' | 'high';
  scamIndicators: string[];
  analyzedAt: string;
}

export interface WatchlistPosition {
  id: string;
  ticker: string;
  sentiment: PositionSentiment;
  notes?: string;
  sourceSignalId?: string;
  sourceTweetUrl?: string;
  addedAt: string;
  entryPrice?: number;
  aiAnalysis?: AiAnalysis;
}

interface PositionsContextType {
  positions: WatchlistPosition[];
  addPosition: (ticker: string, sentiment: PositionSentiment, options?: { notes?: string; sourceSignalId?: string; sourceTweetUrl?: string; entryPrice?: number }) => void;
  removePosition: (id: string) => void;
  updatePosition: (id: string, updates: Partial<WatchlistPosition>) => void;
  updateAiAnalysis: (id: string, analysis: AiAnalysis) => void;
  hasPosition: (ticker: string) => boolean;
  getPositionByTicker: (ticker: string) => WatchlistPosition | undefined;
}

const PositionsContext = createContext<PositionsContextType | undefined>(undefined);

const POSITIONS_STORAGE_KEY = 'situation_monitor_positions';

export function PositionsProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<WatchlistPosition[]>([]);

  useEffect(() => {
    loadStoredPositions();
  }, []);

  const loadStoredPositions = async () => {
    try {
      const stored = await AsyncStorage.getItem(POSITIONS_STORAGE_KEY);
      if (stored) {
        setPositions(JSON.parse(stored));
        console.log('[PositionsContext] Loaded positions from storage');
      }
    } catch (error) {
      console.error('[PositionsContext] Error loading stored positions:', error);
    }
  };

  const savePositions = async (newPositions: WatchlistPosition[]) => {
    try {
      await AsyncStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(newPositions));
    } catch (error) {
      console.error('[PositionsContext] Error saving positions:', error);
    }
  };

  const addPosition = useCallback((
    ticker: string,
    sentiment: PositionSentiment,
    options?: { notes?: string; sourceSignalId?: string; sourceTweetUrl?: string; entryPrice?: number }
  ) => {
    const cleanTicker = ticker.replace('$', '').toUpperCase().trim();
    console.log('[PositionsContext] Adding position:', cleanTicker, sentiment, 'entry:', options?.entryPrice);

    setPositions((prev) => {
      const existing = prev.find((p) => p.ticker === cleanTicker);
      if (existing) {
        console.log('[PositionsContext] Position already exists, updating sentiment');
        const updated = prev.map((p) =>
          p.ticker === cleanTicker ? { ...p, sentiment, ...options } : p
        );
        savePositions(updated);
        return updated;
      }

      const newPosition: WatchlistPosition = {
        id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticker: cleanTicker,
        sentiment,
        notes: options?.notes,
        sourceSignalId: options?.sourceSignalId,
        sourceTweetUrl: options?.sourceTweetUrl,
        entryPrice: options?.entryPrice,
        addedAt: new Date().toISOString(),
      };

      const updated = [newPosition, ...prev];
      savePositions(updated);
      return updated;
    });
  }, []);

  const removePosition = useCallback((id: string) => {
    console.log('[PositionsContext] Removing position:', id);
    setPositions((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePositions(updated);
      return updated;
    });
  }, []);

  const updatePosition = useCallback((id: string, updates: Partial<WatchlistPosition>) => {
    console.log('[PositionsContext] Updating position:', id, updates);
    setPositions((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      savePositions(updated);
      return updated;
    });
  }, []);

  const updateAiAnalysis = useCallback((id: string, analysis: AiAnalysis) => {
    console.log('[PositionsContext] Updating AI analysis for position:', id);
    setPositions((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, aiAnalysis: analysis } : p));
      savePositions(updated);
      return updated;
    });
  }, []);

  const hasPosition = useCallback((ticker: string) => {
    const cleanTicker = ticker.replace('$', '').toUpperCase().trim();
    return positions.some((p) => p.ticker === cleanTicker);
  }, [positions]);

  const getPositionByTicker = useCallback((ticker: string) => {
    const cleanTicker = ticker.replace('$', '').toUpperCase().trim();
    return positions.find((p) => p.ticker === cleanTicker);
  }, [positions]);

  return (
    <PositionsContext.Provider
      value={{
        positions,
        addPosition,
        removePosition,
        updatePosition,
        updateAiAnalysis,
        hasPosition,
        getPositionByTicker,
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
}

export function usePositions() {
  const context = useContext(PositionsContext);
  if (!context) {
    throw new Error('usePositions must be used within a PositionsProvider');
  }
  return context;
}
