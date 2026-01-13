import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, CreditCard, Bell, Shield, Info, User, ChevronRight, X, ExternalLink, Mail, Twitter, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ThemeMode, themeLabels } from '@/constants/theme';

const themeModes: ThemeMode[] = ['dark-green', 'dark-white', 'light-green', 'light-white'];

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { userProfile, credits, isAdmin } = useSubscription();
  const router = useRouter();
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const openNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      console.log('[Settings] Notification settings not available on web');
    }
    setNotificationsModalVisible(false);
  };

  const settingsItems = [
    { icon: CreditCard, label: 'Credits', value: isAdmin ? 'Unlimited' : `${credits}`, onPress: () => router.push('/subscription') },
    { icon: Bell, label: 'Notifications', value: 'Off', onPress: () => setNotificationsModalVisible(true) },
    { icon: Shield, label: 'Privacy Policy', value: '', onPress: () => setPrivacyModalVisible(true) },
    { icon: Info, label: 'About', value: 'v1.0.0', onPress: () => setAboutModalVisible(true) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>SETTINGS</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.push('/edit-profile')}
          style={({ pressed }) => [
            styles.profileSection,
            { backgroundColor: pressed ? colors.bgCard : 'transparent', borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatarContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <User size={32} color={colors.textDim} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{userProfile.username}</Text>
            <Text style={[styles.profileEmail, { color: colors.textDim }]}>{userProfile.email || 'Set email in profile'}</Text>
          </View>
          <ChevronRight size={18} color={colors.textDim} />
        </Pressable>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textDim }]}>APPEARANCE</Text>
          <View style={[styles.themeGrid, { borderColor: colors.border }]}>
            {themeModes.map((mode) => {
              const isSelected = themeMode === mode;
              const isDarkMode = mode.startsWith('dark');
              const isGreenMode = mode.includes('green');
              
              return (
                <Pressable
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.themeOption,
                    {
                      borderColor: isSelected ? colors.accent : colors.border,
                      backgroundColor: isSelected ? colors.bgCard : 'transparent',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.themePreview,
                      {
                        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.themeAccent,
                        {
                          backgroundColor: isGreenMode
                            ? isDarkMode ? '#00ff41' : '#00aa2b'
                            : isDarkMode ? '#ffffff' : '#1a1a1a',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>
                    {themeLabels[mode]}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkMark, { backgroundColor: colors.accent }]}>
                      <Check size={10} color={colors.bg} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textDim }]}>X ACCOUNTS</Text>
          <Pressable
            onPress={() => router.push('/add-account')}
            style={({ pressed }) => [
              styles.addAccountButton,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
              pressed && { backgroundColor: colors.border },
            ]}
          >
            <View style={styles.addAccountLeft}>
              <View style={[styles.xIconContainer, { backgroundColor: colors.textPrimary }]}>
                <Twitter size={16} color={colors.bg} />
              </View>
              <View>
                <Text style={[styles.addAccountText, { color: colors.textPrimary }]}>Add X Account</Text>
                <Text style={[styles.addAccountSubtext, { color: colors.textDim }]}>Monitor trading signals</Text>
              </View>
            </View>
            <Plus size={18} color={colors.accent} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textDim }]}>GENERAL</Text>
          {settingsItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.settingItem,
                {
                  borderBottomColor: colors.border,
                  borderBottomWidth: index < settingsItems.length - 1 ? 1 : 0,
                },
                pressed && { backgroundColor: colors.bgCard },
              ]}
            >
              <View style={styles.settingLeft}>
                <item.icon size={18} color={colors.textDim} />
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  {item.label}
                </Text>
              </View>
              <View style={styles.settingRight}>
                {item.value && (
                  <Text style={[styles.settingValue, { color: colors.textDim }]}>
                    {item.value}
                  </Text>
                )}
                <ChevronRight size={16} color={colors.textDim} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textDim }]}>
            SITUATION MONITOR
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textDim }]}>
            AI-powered signal feed for traders
          </Text>
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setNotificationsModalVisible(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Bell size={24} color={colors.accent} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Notifications</Text>
              <Pressable onPress={() => setNotificationsModalVisible(false)} hitSlop={12}>
                <X size={20} color={colors.textDim} />
              </Pressable>
            </View>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Enable notifications to stay updated on important signals and market movements.
            </Text>
            <Pressable
              onPress={openNotificationSettings}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
            >
              <ExternalLink size={16} color={colors.bg} />
              <Text style={[styles.modalButtonText, { color: colors.bg }]}>
                Open Settings
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setNotificationsModalVisible(false)}
              style={[styles.modalSecondaryButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.modalSecondaryText, { color: colors.textDim }]}>
                Maybe Later
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setPrivacyModalVisible(false)}
        >
          <Pressable style={[styles.modalContent, styles.privacyModalContent, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Shield size={24} color={colors.accent} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
              <Pressable onPress={() => setPrivacyModalVisible(false)} hitSlop={12}>
                <X size={20} color={colors.textDim} />
              </Pressable>
            </View>
            <ScrollView style={styles.privacyScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.privacyTitle, { color: colors.textPrimary }]}>
                Privacy Policy for Situation Monitor
              </Text>
              <Text style={[styles.privacyDate, { color: colors.textDim }]}>
                Last updated: January 2026
              </Text>
              
              <Text style={[styles.privacySectionTitle, { color: colors.textPrimary }]}>
                1. Information We Collect
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                We collect information you provide directly, including account information, preferences, and watchlist data. We also collect usage data to improve our services.
              </Text>

              <Text style={[styles.privacySectionTitle, { color: colors.textPrimary }]}>
                2. How We Use Your Information
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                We use your information to provide, maintain, and improve our services, send notifications about signals, and personalize your experience.
              </Text>

              <Text style={[styles.privacySectionTitle, { color: colors.textPrimary }]}>
                3. Data Security
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.
              </Text>

              <Text style={[styles.privacySectionTitle, { color: colors.textPrimary }]}>
                4. Third-Party Services
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                We may use third-party services for analytics and data processing. These services have their own privacy policies.
              </Text>

              <Text style={[styles.privacySectionTitle, { color: colors.textPrimary }]}>
                5. Your Rights
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                You have the right to access, correct, or delete your personal data. Contact us at situationmonitor@gmail.com for any privacy-related requests.
              </Text>

              <Text style={[styles.privacySectionTitle, { color: colors.textPrimary }]}>
                6. Changes to This Policy
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy in the app.
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => setPrivacyModalVisible(false)}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.modalButtonText, { color: colors.bg }]}>
                I Understand
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setAboutModalVisible(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Info size={24} color={colors.accent} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>About</Text>
              <Pressable onPress={() => setAboutModalVisible(false)} hitSlop={12}>
                <X size={20} color={colors.textDim} />
              </Pressable>
            </View>
            
            <View style={styles.aboutContent}>
              <Text style={[styles.aboutAppName, { color: colors.textPrimary }]}>
                SITUATION MONITOR
              </Text>
              <Text style={[styles.aboutVersion, { color: colors.textDim }]}>
                Version 1.0.0
              </Text>
              
              <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>
                AI-powered signal feed for traders. Track market movements, follow key accounts, and get real-time insights curated from social feeds.
              </Text>

              <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />

              <Pressable 
                style={styles.aboutRow}
                onPress={() => Linking.openURL('mailto:situationmonitor@gmail.com')}
              >
                <Mail size={16} color={colors.textDim} />
                <Text style={[styles.aboutRowText, { color: colors.textSecondary }]}>
                  situationmonitor@gmail.com
                </Text>
              </Pressable>

              <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />

              <Text style={[styles.aboutCopyright, { color: colors.textDim }]}>
                © 2026 Touch Grass LLC
              </Text>
              <Text style={[styles.aboutRights, { color: colors.textDim }]}>
                All rights reserved.
              </Text>
            </View>

            <Pressable
              onPress={() => setAboutModalVisible(false)}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.modalButtonText, { color: colors.bg }]}>
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    width: '47%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    position: 'relative',
  },
  themePreview: {
    width: 48,
    height: 32,
    borderRadius: 2,
    borderWidth: 1,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeAccent: {
    width: 16,
    height: 4,
    borderRadius: 1,
  },
  themeLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  checkMark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  settingValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
  },
  footerText: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 9,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 4,
    borderWidth: 1,
    padding: 24,
  },
  privacyModalContent: {
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  modalText: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 4,
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  modalSecondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalSecondaryText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  privacyScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  privacyDate: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  privacySectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    marginTop: 16,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  aboutContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  aboutAppName: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    textAlign: 'center',
  },
  aboutDivider: {
    width: '100%',
    height: 1,
    marginVertical: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aboutRowText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  aboutCopyright: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  aboutRights: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderRadius: 4,
  },
  addAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontFamily: 'monospace',
  },
  addAccountSubtext: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
