import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Camera, User, Twitter, Link, Check, Mail } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { userProfile, updateProfile } = useSubscription();
  const router = useRouter();
  
  const [username, setUsername] = useState(userProfile.username);
  const [email, setEmail] = useState(userProfile.email);
  const [twitterHandle, setTwitterHandle] = useState(userProfile.twitterHandle);
  const [bio, setBio] = useState(userProfile.bio);
  const [profileImage, setProfileImage] = useState<string | null>(userProfile.profileImage);

  const handleSave = async () => {
    console.log('Saving profile:', { username, email, twitterHandle, bio, profileImage });
    await updateProfile({ username, email, twitterHandle, bio, profileImage });
    Alert.alert('Success', 'Profile updated successfully');
    router.back();
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => console.log('Take photo') },
        { 
          text: 'Choose from Library', 
          onPress: () => {
            setProfileImage('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop');
          } 
        },
        { text: 'Remove Photo', onPress: () => setProfileImage(null), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>EDIT PROFILE</Text>
        <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.accent }]}>
          <Check size={16} color={colors.bg} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={handleChangePhoto} style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <User size={48} color={colors.textDim} />
            )}
            <View style={[styles.cameraOverlay, { backgroundColor: colors.accent }]}>
              <Camera size={14} color={colors.bg} />
            </View>
          </View>
          <Text style={[styles.changePhotoText, { color: colors.accent }]}>Change Photo</Text>
        </Pressable>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <User size={14} color={colors.textDim} />
              <Text style={[styles.label, { color: colors.textDim }]}>USERNAME</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.bgCard,
                },
              ]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Mail size={14} color={colors.textDim} />
              <Text style={[styles.label, { color: colors.textDim }]}>EMAIL</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.bgCard,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <Text style={[styles.helperText, { color: colors.textDim }]}>
              Admin emails get unlimited free access
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Twitter size={14} color={colors.textDim} />
              <Text style={[styles.label, { color: colors.textDim }]}>TWITTER</Text>
            </View>
            <View style={[styles.inputWithPrefix, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
              <Text style={[styles.inputPrefix, { color: colors.textDim }]}>@</Text>
              <TextInput
                style={[styles.inputNoBorder, { color: colors.textPrimary }]}
                value={twitterHandle}
                onChangeText={setTwitterHandle}
                placeholder="username"
                placeholderTextColor={colors.textDim}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.textDim }]}>
              Link your Twitter to show on your profile
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Link size={14} color={colors.textDim} />
              <Text style={[styles.label, { color: colors.textDim }]}>BIO / LINK</Text>
            </View>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.bgCard,
                },
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="Add a bio or link..."
              placeholderTextColor={colors.textDim}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.textDim }]}>
              {bio.length}/160
            </Text>
          </View>
        </View>

        <View style={[styles.previewSection, { borderColor: colors.border }]}>
          <Text style={[styles.previewTitle, { color: colors.textDim }]}>PREVIEW</Text>
          <View style={[styles.previewCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={[styles.previewAvatar, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.previewAvatarImage} />
              ) : (
                <User size={24} color={colors.textDim} />
              )}
            </View>
            <View style={styles.previewInfo}>
              <Text style={[styles.previewName, { color: colors.textPrimary }]}>
                {username || 'username'}
              </Text>
              {twitterHandle ? (
                <View style={styles.previewTwitterRow}>
                  <Twitter size={10} color={colors.accent} />
                  <Text style={[styles.previewTwitter, { color: colors.accent }]}>
                    @{twitterHandle}
                  </Text>
                </View>
              ) : null}
              {bio ? (
                <Text style={[styles.previewBio, { color: colors.textSecondary }]} numberOfLines={2}>
                  {bio}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
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
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 14,
  },
  inputPrefix: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginRight: 2,
  },
  inputNoBorder: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 100,
  },
  helperText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  charCount: {
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  previewSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  previewTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderRadius: 2,
    gap: 12,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAvatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  previewInfo: {
    flex: 1,
    gap: 4,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
  },
  previewTwitterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewTwitter: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  previewBio: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
