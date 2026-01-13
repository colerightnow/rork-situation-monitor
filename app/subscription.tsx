import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Coins, Crown, Zap, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import * as Haptics from 'expo-haptics';

interface CreditPackage {
  id: string;
  credits: number;
  price: string;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  { id: 'starter', credits: 50, price: '$4.99' },
  { id: 'popular', credits: 150, price: '$9.99', popular: true },
  { id: 'pro', credits: 500, price: '$24.99' },
];

const features = [
  'Import tweets via URL',
  'AI signal analysis',
  'Position tracking',
  'Sentiment detection',
];

export default function SubscriptionScreen() {
  const { colors } = useTheme();
  const { credits, addCredits, isAdmin, userProfile } = useSubscription();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string>('popular');
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    const pkg = creditPackages.find((p) => p.id === selectedPackage);
    if (!pkg) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(async () => {
      await addCredits(pkg.credits);
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Credits Added!',
        `${pkg.credits} credits have been added to your account.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>CREDITS</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={20} color={colors.textDim} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {isAdmin ? <Crown size={32} color={colors.accent} /> : <Coins size={32} color={colors.accent} />}
          </View>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {isAdmin ? 'Admin Access' : 'Get Credits'}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textDim }]}>
            {isAdmin ? 'You have unlimited credits' : 'Use credits for AI features'}
          </Text>
          
          <View style={[styles.balanceContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Coins size={18} color={colors.accent} />
            <Text style={[styles.balanceLabel, { color: colors.textDim }]}>Current Balance:</Text>
            <Text style={[styles.balanceValue, { color: colors.accent }]}>
              {isAdmin ? '∞' : credits}
            </Text>
          </View>
        </View>

        {!isAdmin && (
          <>
            <View style={styles.packagesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textDim }]}>SELECT PACKAGE</Text>
              {creditPackages.map((pkg) => (
                <Pressable
                  key={pkg.id}
                  onPress={() => {
                    setSelectedPackage(pkg.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.packageCard,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: selectedPackage === pkg.id ? colors.accent : colors.border,
                      borderWidth: selectedPackage === pkg.id ? 2 : 1,
                    },
                  ]}
                >
                  {pkg.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.popularText, { color: colors.bg }]}>BEST VALUE</Text>
                    </View>
                  )}
                  <View style={styles.packageContent}>
                    <View style={styles.packageLeft}>
                      <View style={styles.packageCredits}>
                        <Zap size={16} color={colors.accent} />
                        <Text style={[styles.creditsAmount, { color: colors.textPrimary }]}>
                          {pkg.credits}
                        </Text>
                        <Text style={[styles.creditsLabel, { color: colors.textDim }]}>credits</Text>
                      </View>
                    </View>
                    <View style={styles.packageRight}>
                      <Text style={[styles.packagePrice, { color: colors.textPrimary }]}>{pkg.price}</Text>
                      {selectedPackage === pkg.id && (
                        <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                          <Check size={12} color={colors.bg} />
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={styles.featuresSection}>
              <Text style={[styles.sectionTitle, { color: colors.textDim }]}>WHAT YOU GET</Text>
              <View style={[styles.featuresList, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={14} color={colors.accent} />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {isAdmin ? (
          <View style={styles.ctaSection}>
            <View style={[styles.adminInfoBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Crown size={16} color={colors.accent} />
              <Text style={[styles.adminInfoText, { color: colors.textSecondary }]}>
                Logged in as {userProfile.email}
              </Text>
            </View>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.ctaText, { color: colors.bg }]}>Continue</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.ctaSection}>
            <Pressable
              onPress={handlePurchase}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed || isLoading ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.ctaText, { color: colors.bg }]}>
                {isLoading ? 'Processing...' : `Buy ${creditPackages.find((p) => p.id === selectedPackage)?.credits} Credits`}
              </Text>
            </Pressable>

            <Pressable style={styles.restoreButton}>
              <Text style={[styles.restoreText, { color: colors.textDim }]}>
                Restore Purchases
              </Text>
            </Pressable>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    width: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 12,
  },
  packagesContainer: {
    marginBottom: 24,
  },
  packageCard: {
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  packageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLeft: {
    flex: 1,
  },
  packageCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creditsAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  creditsLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  packageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  selectedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresList: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  adminInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 12,
  },
  adminInfoText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  ctaSection: {
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  restoreButton: {
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
