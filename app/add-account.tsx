import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, AtSign, Search, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignals } from '@/contexts/SignalsContext';

export default function AddAccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addAccount, fetchTweetsForAccount, accounts } = useSignals();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const cleanUsername = username.replace('@', '').trim();
    
    if (!cleanUsername) {
      Alert.alert('Error', 'Please enter a Twitter username');
      return;
    }

    const existing = accounts.find(
      (a) => a.twitterHandle.toLowerCase() === `@${cleanUsername}`.toLowerCase()
    );
    if (existing) {
      Alert.alert('Already Added', `@${cleanUsername} is already being monitored.`);
      return;
    }

    setIsLoading(true);
    setStatus('Looking up account...');

    try {
      const account = await addAccount(cleanUsername);
      
      if (account) {
        setStatus('Fetching recent tweets...');
        await fetchTweetsForAccount(account);
        
        setStatus('Done!');
        setTimeout(() => {
          Alert.alert(
            'Account Added',
            `@${cleanUsername} (${account.category}) is now being monitored for trading signals.`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }, 500);
      } else {
        Alert.alert('Error', 'Failed to add account. Please try again.');
        setStatus(null);
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding account:', errorMessage);
      Alert.alert('Error', `Failed to add account: ${errorMessage}`);
      setStatus(null);
      setIsLoading(false);
    }
  }, [username, router, addAccount, fetchTweetsForAccount, accounts]);

  const popularAccounts = [
    { handle: 'unusual_whales', desc: 'Options flow alerts' },
    { handle: 'TrendSpider', desc: 'Technical analysis' },
    { handle: 'CryptoKaleo', desc: 'Crypto trading' },
    { handle: 'zerohedge', desc: 'Market news' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              ADD ACCOUNT
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.closeButton,
                { borderColor: colors.border },
                pressed && { borderColor: colors.borderHover },
              ]}
            >
              <X size={16} color={colors.textDim} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Enter a Twitter username to start monitoring for trading signals.
              The AI will classify tweets and extract only actionable positions.
            </Text>

            <View style={[styles.inputContainer, { borderColor: isLoading ? colors.accent : colors.border }]}>
              <AtSign size={18} color={isLoading ? colors.accent : colors.textDim} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="username"
                placeholderTextColor={colors.textDim}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                editable={!isLoading}
              />
              {isLoading && (
                <ActivityIndicator size="small" color={colors.accent} />
              )}
            </View>

            {status && (
              <View style={[styles.statusContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {status === 'Done!' ? (
                  <CheckCircle size={14} color={colors.bullishText} />
                ) : (
                  <ActivityIndicator size="small" color={colors.accent} />
                )}
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  {status}
                </Text>
              </View>
            )}

            <View style={styles.examples}>
              <Text style={[styles.examplesTitle, { color: colors.textDim }]}>
                POPULAR TRADING ACCOUNTS
              </Text>
              {popularAccounts.map((account) => (
                <Pressable
                  key={account.handle}
                  onPress={() => !isLoading && setUsername(account.handle)}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.exampleItem,
                    { borderColor: colors.border },
                    pressed && !isLoading && { backgroundColor: colors.bgCard },
                    isLoading && { opacity: 0.5 },
                  ]}
                >
                  <Text style={[styles.exampleHandle, { color: colors.textPrimary }]}>
                    @{account.handle}
                  </Text>
                  <Text style={[styles.exampleDesc, { color: colors.textDim }]}>
                    {account.desc}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading || !username.trim()}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.accent },
                pressed && { opacity: 0.8 },
                (isLoading || !username.trim()) && { opacity: 0.5 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.bg} />
              ) : (
                <Search size={16} color={colors.bg} />
              )}
              <Text style={[styles.submitText, { color: colors.bg }]}>
                {isLoading ? 'ANALYZING...' : 'ADD & ANALYZE'}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'monospace',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    paddingVertical: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 2,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  examples: {
    marginTop: 32,
  },
  examplesTitle: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 2,
    marginBottom: 8,
  },
  exampleHandle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  exampleDesc: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 2,
  },
  submitText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
