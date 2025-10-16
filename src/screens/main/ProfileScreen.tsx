import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Modal,
  TextInput,
  Switch,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, commonStyles, shadows } from '../../utils/theme';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Platform } from 'react-native';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  panCard?: string;
  taxRegime: 'OLD' | 'NEW';
  occupation?: string;
  annualIncome?: number;
}

interface AppSettings {
  notifications: boolean;
  biometricAuth: boolean;
  darkMode: boolean;
  language: string;
  currency: string;
}

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    biometricAuth: false,
    darkMode: false,
    language: 'English',
    currency: 'INR'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'profile' | 'settings' | null>(null);
  const [editProfile, setEditProfile] = useState<UserProfile>({} as UserProfile);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProfile();
      if (response.success) {
        setProfile(response.data);
        setEditProfile(response.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

const handleLogout = async () => {
  if (Platform.OS === 'web') {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      try {
        await logout();
        window.location.href = '/login'; // optional redirect
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to logout. Please try again.');
      }
    }
  } else {
    // Mobile (iOS / Android)
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // optional: navigation to login screen if using react-navigation
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  }
};

  const handleEditProfile = () => {
    setModalType('profile');
    setModalVisible(true);
  };

  const handleSettings = () => {
    setModalType('settings');
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.updateProfile(editProfile);
      if (response.success) {
        setProfile(response.data);
        setModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      const newSettings = { ...settings, notifications: value };
      setSettings(newSettings);
      // Save to backend/local storage
      Alert.alert('Settings Updated', `Notifications ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleRateApp = () => {
    const storeUrl = 'https://play.google.com/store/apps/details?id=com.taxbae.app';
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert('Error', 'Unable to open app store');
    });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: '🚀 Check out TaxBae - The smart way to manage your taxes and finances! Download now: https://taxbae.app',
        title: 'TaxBae App'
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleContactSupport = () => {
    const email = 'support@taxbae.com';
    const subject = 'TaxBae Support Request';
    const body = 'Hi Team, I need help with...';
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Contact Support',
        'Please email us at support@taxbae.com or call +91-8888-TAXBAE'
      );
    });
  };

  const handleHelpFAQ = () => {
    const faqUrl = 'https://taxbae.com/faq';
    Linking.openURL(faqUrl).catch(() => {
      Alert.alert(
        'Help & FAQ',
        'Common questions:\n\n• How to file ITR?\n• Tax saving investments\n• ELSS vs PPF comparison\n• New vs Old tax regime\n\nFor detailed help, contact support.'
      );
    });
  };

  const handlePrivacyPolicy = () => {
    const privacyUrl = 'https://taxbae.com/privacy';
    Linking.openURL(privacyUrl).catch(() => {
      Alert.alert(
        'Privacy Policy',
        'We respect your privacy and protect your financial data with bank-grade security. Your information is never shared with third parties without consent.'
      );
    });
  };

  const handleTermsOfService = () => {
    const termsUrl = 'https://taxbae.com/terms';
    Linking.openURL(termsUrl).catch(() => {
      Alert.alert(
        'Terms of Service',
        'By using TaxBae, you agree to our terms of service. The app provides financial guidance for educational purposes and should not replace professional tax advice.'
      );
    });
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', onPress: handleEditProfile },
        { icon: 'settings-outline', label: 'App Settings', onPress: handleSettings },
        { 
          icon: 'notifications-outline', 
          label: 'Notifications', 
          onPress: () => handleNotificationToggle(!settings.notifications),
          rightElement: (
            <Switch
              value={settings.notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.backgroundDark, true: colors.primary + '40' }}
              thumbColor={settings.notifications ? colors.primary : colors.textLight}
            />
          )
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & FAQ', onPress: handleHelpFAQ },
        { icon: 'mail-outline', label: 'Contact Support', onPress: handleContactSupport },
        { icon: 'star-outline', label: 'Rate App', onPress: handleRateApp },
        { icon: 'share-outline', label: 'Share App', onPress: handleShareApp },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: 'document-text-outline', label: 'Privacy Policy', onPress: handlePrivacyPolicy },
        { icon: 'shield-checkmark-outline', label: 'Terms of Service', onPress: handleTermsOfService },
      ],
    },
  ];

  const renderEditProfileModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible && modalType === 'profile'}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editProfile.name || ''}
                onChangeText={(text) => setEditProfile({ ...editProfile, name: text })}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editProfile.phone || ''}
                onChangeText={(text) => setEditProfile({ ...editProfile, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PAN Card</Text>
              <TextInput
                style={styles.input}
                value={editProfile.panCard || ''}
                onChangeText={(text) => setEditProfile({ ...editProfile, panCard: text.toUpperCase() })}
                placeholder="ABCDE1234F"
                maxLength={10}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Occupation</Text>
              <TextInput
                style={styles.input}
                value={editProfile.occupation || ''}
                onChangeText={(text) => setEditProfile({ ...editProfile, occupation: text })}
                placeholder="Software Engineer, Doctor, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Annual Income (₹)</Text>
              <TextInput
                style={styles.input}
                value={editProfile.annualIncome?.toString() || ''}
                onChangeText={(text) => setEditProfile({ 
                  ...editProfile, 
                  annualIncome: text ? parseInt(text) : undefined 
                })}
                placeholder="Enter annual income"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tax Regime</Text>
              <View style={styles.taxRegimeSelector}>
                <TouchableOpacity
                  style={[
                    styles.regimeButton,
                    editProfile.taxRegime === 'OLD' && styles.regimeButtonActive
                  ]}
                  onPress={() => setEditProfile({ ...editProfile, taxRegime: 'OLD' })}
                >
                  <Text style={[
                    styles.regimeButtonText,
                    editProfile.taxRegime === 'OLD' && styles.regimeButtonTextActive
                  ]}>Old Regime</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.regimeButton,
                    editProfile.taxRegime === 'NEW' && styles.regimeButtonActive
                  ]}
                  onPress={() => setEditProfile({ ...editProfile, taxRegime: 'NEW' })}
                >
                  <Text style={[
                    styles.regimeButtonText,
                    editProfile.taxRegime === 'NEW' && styles.regimeButtonTextActive
                  ]}>New Regime</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible && modalType === 'settings'}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>App Settings</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingSubtitle}>Get tax reminders and updates</Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.backgroundDark, true: colors.primary + '40' }}
                thumbColor={settings.notifications ? colors.primary : colors.textLight}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Biometric Authentication</Text>
                  <Text style={styles.settingSubtitle}>Use fingerprint or face ID</Text>
                </View>
              </View>
              <Switch
                value={settings.biometricAuth}
                onValueChange={(value) => setSettings({ ...settings, biometricAuth: value })}
                trackColor={{ false: colors.backgroundDark, true: colors.primary + '40' }}
                thumbColor={settings.biometricAuth ? colors.primary : colors.textLight}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={20} color={colors.primary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingSubtitle}>Switch to dark theme</Text>
                </View>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => {
                  setSettings({ ...settings, darkMode: value });
                  Alert.alert('Coming Soon', 'Dark mode will be available in the next update!');
                }}
                trackColor={{ false: colors.backgroundDark, true: colors.primary + '40' }}
                thumbColor={settings.darkMode ? colors.primary : colors.textLight}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={20} color={colors.primary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Language</Text>
                  <Text style={styles.settingSubtitle}>{settings.language}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Multi-language support coming soon!')}>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Currency</Text>
                  <Text style={styles.settingSubtitle}>₹ Indian Rupee (INR)</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Currency', 'Currently supporting INR only')}>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons 
              name="person" 
              size={40} 
              color={colors.textWhite} 
            />
          </View>
          <Text style={styles.userName}>{profile?.name || user?.name}</Text>
          <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
          <View style={styles.userTypeBadge}>
            <Text style={styles.userTypeText}>
              {profile?.taxRegime || 'Old'} Tax Regime
            </Text>
          </View>
          {profile?.panCard && (
            <Text style={styles.panCard}>PAN: {profile.panCard}</Text>
          )}
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.sectionItem,
                    itemIndex !== section.items.length - 1 && styles.sectionItemBorder
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.sectionItemLeft}>
                    <Ionicons 
                      name={item.icon as keyof typeof Ionicons.glyphMap} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.sectionItemLabel}>{item.label}</Text>
                  </View>
                  {item.rightElement || (
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={colors.textLight} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.appVersion}>TaxBae v1.0.0</Text>
      </ScrollView>
      
      {/* Modals */}
      {renderEditProfileModal()}
      {renderSettingsModal()}
      
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner message="Updating profile..." />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  userTypeBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  userTypeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    ...commonStyles.card,
    padding: 0,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  sectionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionItemLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  appVersion: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  panCard: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  modalForm: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    ...commonStyles.input,
  },
  taxRegimeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  regimeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  regimeButtonActive: {
    backgroundColor: colors.primary,
  },
  regimeButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  regimeButtonTextActive: {
    color: colors.textWhite,
  },
  saveButton: {
    ...commonStyles.button,
    marginTop: spacing.lg,
  },
  saveButtonText: {
    ...commonStyles.buttonText,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
