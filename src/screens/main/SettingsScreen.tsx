import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useNetInfo } from '@react-native-netinfo/netinfo';

import { CustomButton } from '../../components/common/CustomButton';
import { RiskLevelChip } from '../../components/common/RiskLevelChip';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { RootState } from '../../store';
import { 
  logoutUser,
  updateUser,
  clearAuth 
} from '../../store/slices/authSlice';
import { theme } from '../../theme/theme';

interface SettingsItem {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'button' | 'navigation';
  value?: boolean;
  icon?: string;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isConnected } = useNetworkStatus();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const { settings } = useSelector((state: RootState) => state.settings);

  const [settingsItems, setSettingsItems] = useState<SettingsItem[]>([
    {
      id: 'notifications',
      title: 'Bildirimler',
      description: 'Push bildirimleri ve ses ayarları',
      type: 'toggle',
      value: settings?.notificationsEnabled ?? true,
    },
    {
      id: 'location',
      title: 'Konum Servisi',
      description: 'Yangın raporları için konum erişimi',
      type: 'toggle',
      value: settings?.locationEnabled ?? true,
    },
    {
      id: 'darkMode',
      title: 'Karanlık Mod',
      description: 'Karanlık tema kullan',
      type: 'toggle',
      value: settings?.darkMode ?? false,
    },
    {
      id: 'language',
      title: 'Dil',
      description: 'Uygulama dili seçimi',
      type: 'navigation',
      icon: 'translate',
    },
    {
      id: 'privacy',
      title: 'Gizlilik',
      description: 'Gizlilik ayarları ve veri kullanımı',
      type: 'navigation',
      icon: 'shield',
    },
    {
      id: 'help',
      title: 'Yardım',
      description: 'SSS ve destek',
      type: 'navigation',
      icon: 'help',
    },
    {
      id: 'about',
      title: 'Hakkında',
      description: 'Uygulama bilgileri',
      type: 'navigation',
      icon: 'info',
    },
  ]);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Oturumu Kapat',
      'Oturumunuzu kapatmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Oturumu Kapat',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
              dispatch(clearAuth());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Force logout even if API call fails
              dispatch(clearAuth());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          },
        },
      ]
    );
  }, [dispatch, navigation]);

  const handleSettingToggle = useCallback((id: string, value: boolean) => {
    setSettingsItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, value } : item
      )
    );

    // Update settings in Redux store
    dispatch(updateUser({ settings: { ...settings, [id]: value } }));
  }, [dispatch, settings]);

  const handleSettingPress = useCallback((item: SettingsItem) => {
    switch (item.id) {
      case 'language':
        // Navigate to language settings
        break;
      case 'privacy':
        // Navigate to privacy settings
        break;
      case 'help':
        // Navigate to help
        break;
      case 'about':
        // Show about dialog
        Alert.alert(
          'Hakkında',
          'FireAlert v1.0.0\n\nYangın erken uyarı sistemi mobil uygulaması',
          [{ text: 'Tamam' }]
        );
        break;
    }
  }, []);

  const renderSettingsItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingsItem}
      onPress={() => {
        if (item.type === 'toggle') {
          handleSettingToggle(item.id, !item.value);
        } else if (item.type === 'navigation') {
          handleSettingPress(item);
        }
      }}
      disabled={isLoading}
    >
      <View style={styles.settingsItemContent}>
        <View style={styles.settingsItemInfo}>
          <Text style={styles.settingsItemTitle}>{item.title}</Text>
          <Text style={styles.settingsItemDescription}>{item.description}</Text>
        </View>
        
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={(value) => handleSettingToggle(item.id, value)}
            disabled={isLoading}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={item.value ? theme.colors.onPrimary : theme.colors.background}
          />
        ) : (
          <Text style={styles.settingsItemIcon}>{item.icon || '>'}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.name || 'Kullanıcı'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || 'user@example.com'}
              </Text>
              {user?.reliabilityScore && (
                <View style={styles.profileScore}>
                  <Text style={styles.profileScoreText}>
                    Güvenilirlik: {user.reliabilityScore}%
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <CustomButton
            title="Profili Düzenle"
            onPress={() => navigation.navigate('Profile')}
            style={styles.editProfileButton}
            variant="outline"
          />
        </View>

        {/* Settings List */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Ayarlar</Text>
          {settingsItems.map(renderSettingsItem)}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerSectionTitle}>Kritik Ayarlar</Text>
          
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={() => {
              Alert.alert(
                'Verileri Temizle',
                'Tüm uygulama verilerini silmek istediğinize emin misiniz?',
                [
                  {
                    text: 'İptal',
                    style: 'cancel',
                  },
                  {
                    text: 'Verileri Temizle',
                    style: 'destructive',
                    onPress: () => {
                      // Clear app data
                      Alert.alert(
                        'Veriler Temizlendi',
                        'Uygulama verileri başarıyla temizlendi',
                        [{ text: 'Tamam' }]
                      );
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.dangerItemText}>Verileri Temizle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={handleLogout}
          >
            <Text style={styles.dangerItemText}>Oturumu Kapat</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoTitle}>FireAlert</Text>
          <Text style={styles.appInfoVersion}>Versiyon 1.0.0</Text>
          <Text style={styles.appInfoDescription}>
            Yangın erken uyarı sistemi mobil uygulaması
          </Text>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  profileAvatarText: {
    fontSize: 24,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  profileScore: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  profileScoreText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  editProfileButton: {
    alignSelf: 'stretch',
  },
  settingsSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingsItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingsItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsItemInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingsItemDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  settingsItemIcon: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  dangerSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  dangerItem: {
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  dangerItemText: {
    fontSize: 16,
    color: theme.colors.error,
    fontWeight: '500',
    textAlign: 'center',
  },
  appInfoSection: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  appInfoDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});