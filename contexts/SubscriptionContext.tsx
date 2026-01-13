import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAdminEmail } from '@/constants/admin';

interface UserProfile {
  username: string;
  email: string;
  twitterHandle: string;
  bio: string;
  profileImage: string | null;
}

interface SubscriptionContextType {
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  credits: number;
  addCredits: (amount: number) => Promise<void>;
  useCredits: (amount: number) => Promise<boolean>;
  isAdmin: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const USER_PROFILE_KEY = 'situation_monitor_user_profile';
const CREDITS_KEY = 'situation_monitor_credits';

const defaultProfile: UserProfile = {
  username: 'trader_001',
  email: '',
  twitterHandle: '',
  bio: '',
  profileImage: null,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    loadProfile();
    loadCredits();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile({ ...defaultProfile, ...parsed });
        console.log('[SubscriptionContext] Loaded profile:', parsed.email);
      }
    } catch (error) {
      console.error('[SubscriptionContext] Error loading profile:', error);
    }
  };

  const loadCredits = async () => {
    try {
      const stored = await AsyncStorage.getItem(CREDITS_KEY);
      if (stored) {
        setCredits(parseInt(stored, 10));
        console.log('[SubscriptionContext] Loaded credits:', stored);
      }
    } catch (error) {
      console.error('[SubscriptionContext] Error loading credits:', error);
    }
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const newProfile = { ...userProfile, ...updates };
      setUserProfile(newProfile);
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
      console.log('[SubscriptionContext] Profile updated:', newProfile.email);
    } catch (error) {
      console.error('[SubscriptionContext] Error saving profile:', error);
    }
  }, [userProfile]);

  const addCredits = useCallback(async (amount: number) => {
    try {
      const newCredits = credits + amount;
      setCredits(newCredits);
      await AsyncStorage.setItem(CREDITS_KEY, newCredits.toString());
      console.log('[SubscriptionContext] Credits added:', amount, 'Total:', newCredits);
    } catch (error) {
      console.error('[SubscriptionContext] Error adding credits:', error);
    }
  }, [credits]);

  const useCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (isAdminEmail(userProfile.email)) return true;
    if (credits < amount) return false;
    try {
      const newCredits = credits - amount;
      setCredits(newCredits);
      await AsyncStorage.setItem(CREDITS_KEY, newCredits.toString());
      console.log('[SubscriptionContext] Credits used:', amount, 'Remaining:', newCredits);
      return true;
    } catch (error) {
      console.error('[SubscriptionContext] Error using credits:', error);
      return false;
    }
  }, [credits, userProfile.email]);

  const isAdmin = isAdminEmail(userProfile.email);

  return (
    <SubscriptionContext.Provider
      value={{
        userProfile,
        updateProfile,
        credits,
        addCredits,
        useCredits,
        isAdmin,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
