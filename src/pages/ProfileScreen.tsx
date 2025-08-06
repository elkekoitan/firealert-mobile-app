import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, TextInput, Alert, TouchableOpacity, Image, Modal, Switch } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile as useSupabaseProfile } from '../hooks/useSupabase';
import { useUserProfile, useUserPreferences, userProfileService, type UpdateProfileData, type UpdatePreferencesData } from '../services/userProfileService';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getReliabilityColor, getReliabilityLabel } from '../utils';
import * as ImagePicker from 'expo-image-picker';
import { billingService } from '../services/billing';
import { monitoringService } from '../services/monitoring';

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
};

type TabType = 'profile' | 'preferences' | 'achievements' | 'subscription';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user: authUser, session } = useAuth();
  
  // Use enhanced profile service
  const { profile, loading, error, refetch: refetchProfile, updateProfile } = useUserProfile(authUser?.id || '');
  const { preferences, updatePreferences } = useUserPreferences(authUser?.id || '');
  
  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { control, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (profile) {
      setValue('firstName', profile.firstName || '');
      setValue('lastName', profile.lastName || '');
      setValue('phoneNumber', profile.phoneNumber || '');
      setValue('dateOfBirth', profile.dateOfBirth || '');
    }
  }, [profile, setValue]);

  // Track screen view
  useEffect(() => {
    monitoringService.trackEvent('profile_screen_viewed', {
      userId: authUser?.id,
      activeTab,
    });
  }, [authUser?.id, activeTab]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!authUser?.id) {
      Alert.alert('Hata', 'Profil güncellenemedi: Kullanıcı kimliği bulunamadı.');
      return;
    }
    try {
      const updateData: UpdateProfileData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };
      
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
      if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
      
      await updateProfile(updateData);
      Alert.alert('Başarılı', 'Profiliniz başarıyla güncellendi!');
      
      monitoringService.trackEvent('profile_updated', {
        userId: authUser.id,
        fields: Object.keys(updateData),
      });
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Avatar functions
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
    setAvatarModalVisible(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
    setAvatarModalVisible(false);
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!authUser?.id) return;
    
    try {
      setUploading(true);
      await userProfileService.uploadAvatar(authUser.id, imageUri);
      Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi!');
      refetchProfile();
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Hata', 'Profil fotoğrafı yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!authUser?.id) return;
    
    Alert.alert(
      'Profil Fotoğrafını Sil',
      'Profil fotoğrafınızı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await userProfileService.deleteAvatar(authUser.id);
              Alert.alert('Başarılı', 'Profil fotoğrafınız silindi.');
              refetchProfile();
            } catch (error) {
              Alert.alert('Hata', 'Profil fotoğrafı silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
    setAvatarModalVisible(false);
  };

  // Preference handlers
  const handlePreferenceChange = async (section: keyof UpdatePreferencesData, key: string, value: any) => {
    if (!authUser?.id || !preferences) return;
    
    try {
      const updates = { [section]: { [key]: value } };
      await updatePreferences(updates);
    } catch (error) {
      Alert.alert('Hata', 'Ayar güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>Profil yüklenirken bir hata oluştu: {error}</Text>
        <Button title="Tekrar Dene" onPress={refetchProfile} color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.text.disabled} />
        <Text style={styles.emptyStateText}>Profil bilgileri bulunamadı.</Text>
        <Button title="Geri Dön" onPress={() => navigation.goBack()} color={COLORS.text.secondary} />
      </View>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'achievements':
        return renderAchievementsTab();
      case 'subscription':
        return renderSubscriptionTab();
      default:
        return renderProfileTab();
    }
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.profileCard}>
        <TouchableOpacity 
          onPress={() => setAvatarModalVisible(true)}
          style={styles.avatarContainer}
        >
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle" size={100} color={COLORS.primary} />
          )}
          <View style={styles.avatarEditButton}>
            <Ionicons name="camera" size={20} color={COLORS.surface} />
          </View>
          {uploading && (
            <View style={styles.avatarLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.emailText}>{authUser?.email || 'E-posta Yok'}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.statistics.totalReports}</Text>
            <Text style={styles.statLabel}>Toplam Rapor</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.statistics.verifiedReports}</Text>
            <Text style={styles.statLabel}>Doğrulanmış Rapor</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getReliabilityColor(profile.reliabilityScore) }]}>
              {profile.reliabilityScore}%
            </Text>
            <Text style={styles.statLabel}>Güvenilirlik</Text>
            <Text style={[styles.statSubLabel, { color: getReliabilityColor(profile.reliabilityScore) }]}>
              ({getReliabilityLabel(profile.reliabilityScore)})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Profil Bilgilerini Düzenle</Text>
        
        <Text style={styles.label}>Adınız</Text>
        <Controller
          control={control}
          name="firstName"
          rules={{ required: 'Ad alanı boş bırakılamaz.' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Adınızı girin"
              placeholderTextColor={COLORS.text.disabled}
            />
          )}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}

        <Text style={styles.label}>Soyadınız</Text>
        <Controller
          control={control}
          name="lastName"
          rules={{ required: 'Soyad alanı boş bırakılamaz.' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Soyadınızı girin"
              placeholderTextColor={COLORS.text.disabled}
            />
          )}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}

        <Text style={styles.label}>Telefon Numarası</Text>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Telefon numaranızı girin"
              placeholderTextColor={COLORS.text.disabled}
              keyboardType="phone-pad"
            />
          )}
        />

        <Text style={styles.label}>Doğum Tarihi</Text>
        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.text.disabled}
            />
          )}
        />

        <Button
          title="Profili Kaydet"
          onPress={handleSubmit(onSubmit)}
          color={COLORS.primary}
          disabled={!isDirty || loading}
        />
      </View>
    </View>
  );

  const renderPreferencesTab = () => {
    if (!preferences) return <ActivityIndicator size="large" color={COLORS.primary} />;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.preferenceSection}>
          <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Push Bildirimleri</Text>
            <Switch
              value={preferences.notifications.pushEnabled}
              onValueChange={(value) => handlePreferenceChange('notifications', 'pushEnabled', value)}
              trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>E-posta Bildirimleri</Text>
            <Switch
              value={preferences.notifications.emailEnabled}
              onValueChange={(value) => handlePreferenceChange('notifications', 'emailEnabled', value)}
              trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Yakındaki Uyarılar</Text>
            <Switch
              value={preferences.notifications.nearbyAlerts}
              onValueChange={(value) => handlePreferenceChange('notifications', 'nearbyAlerts', value)}
              trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Acil Durum Uyarıları</Text>
            <Switch
              value={preferences.notifications.emergencyAlerts}
              onValueChange={(value) => handlePreferenceChange('notifications', 'emergencyAlerts', value)}
              trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }}
            />
          </View>
        </View>

        <View style={styles.preferenceSection}>
          <Text style={styles.sectionTitle}>Gizlilik Ayarları</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Konum Göster</Text>
            <Switch
              value={preferences.privacy.showLocation}
              onValueChange={(value) => handlePreferenceChange('privacy', 'showLocation', value)}
              trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>İstatistikleri Göster</Text>
            <Switch
              value={preferences.privacy.showStatistics}
              onValueChange={(value) => handlePreferenceChange('privacy', 'showStatistics', value)}
              trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }}
            />
          </View>
        </View>

        <View style={styles.preferenceSection}>
          <Text style={styles.sectionTitle}>Görünüm Ayarları</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Dil: {preferences.display.language === 'tr' ? 'Türkçe' : 'English'}</Text>
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Tema: {preferences.display.theme}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Başarımlar</Text>
      {profile.statistics.achievements.length > 0 ? (
        profile.statistics.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <MaterialIcons name="star" size={40} color={COLORS.primary} />
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Text style={styles.achievementDate}>
                {new Date(achievement.earnedAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyAchievements}>
          <MaterialIcons name="star-outline" size={60} color={COLORS.text.disabled} />
          <Text style={styles.emptyAchievementsText}>Henüz başarım kazanılmamış</Text>
        </View>
      )}
    </View>
  );

  const renderSubscriptionTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Abonelik Durumu</Text>
      <TouchableOpacity
        style={styles.subscriptionCard}
        onPress={() => navigation.navigate('Subscription' as never)}
      >
        <MaterialIcons name="star" size={40} color={COLORS.primary} />
        <Text style={styles.subscriptionText}>Premium aboneliğinizi yönetin</Text>
        <MaterialIcons name="arrow-forward-ios" size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Profilim</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={activeTab === 'profile' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
          onPress={() => setActiveTab('preferences')}
        >
          <Ionicons 
            name="settings" 
            size={20} 
            color={activeTab === 'preferences' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>Ayarlar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <MaterialIcons 
            name="star" 
            size={20} 
            color={activeTab === 'achievements' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>Başarımlar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subscription' && styles.activeTab]}
          onPress={() => setActiveTab('subscription')}
        >
          <MaterialIcons 
            name="payment" 
            size={20} 
            color={activeTab === 'subscription' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'subscription' && styles.activeTabText]}>Abonelik</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>

      {/* Avatar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil Fotoğrafı</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              <Text style={styles.modalButtonText}>Fotoğraf Çek</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.modalButtonText}>Galeriden Seç</Text>
            </TouchableOpacity>
            
            {profile.avatar && (
              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={deleteAvatar}>
                <Ionicons name="trash" size={24} color={COLORS.error} />
                <Text style={[styles.modalButtonText, { color: COLORS.error }]}>Fotoğrafı Sil</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    left: SIZES.padding,
    top: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.disabled,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base / 2,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.caption,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.h4,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.h4,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SIZES.padding,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  emptyStateText: {
    fontSize: SIZES.h4,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.base,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailText: {
    fontSize: SIZES.h4,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.text.disabled,
    paddingTop: SIZES.padding,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.text.secondary,
    marginTop: SIZES.base / 2,
  },
  statSubLabel: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.text.primary,
    marginBottom: SIZES.base / 2,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    fontSize: SIZES.body,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
    marginBottom: SIZES.padding,
  },
  // Preferences
  preferenceSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.disabled,
  },
  preferenceLabel: {
    fontSize: SIZES.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  // Achievements
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  achievementName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  achievementDescription: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    marginTop: SIZES.base / 2,
  },
  achievementDate: {
    fontSize: SIZES.caption,
    color: COLORS.text.disabled,
    marginTop: SIZES.base / 2,
  },
  emptyAchievements: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyAchievementsText: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    marginTop: SIZES.base,
  },
  // Subscription
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text.primary,
    marginLeft: SIZES.base,
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  cancelButton: {
    backgroundColor: COLORS.text.disabled,
  },
  modalButtonText: {
    fontSize: SIZES.body,
    color: COLORS.text.primary,
    marginLeft: SIZES.base,
  },
});

export default ProfileScreen;