import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, Alert, TouchableOpacity, Button } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  updateNotificationSettings,
  updateLocationSettings,
  updateEmergencySettings,
  updateAppSettings,
  resetSettings,
} from '../store/slices/settingsSlice';

// Form verileri için tip tanımı
type SettingsFormData = {
  notificationsEnabled: boolean;
  notificationsSound: boolean;
  notificationsVibration: boolean;
  notificationsFireAlerts: boolean;
  notificationsSystemUpdates: boolean;
  locationEnabled: boolean;
  locationAccuracy: 'high' | 'medium' | 'low';
  locationBackgroundTracking: boolean;
  emergencyAuto112Call: boolean;
  emergencyContacts: string; // Virgülle ayrılmış string olarak alacağız
  appLanguage: 'tr' | 'en';
  appTheme: 'light' | 'dark' | 'auto';
  appMapType: 'standard' | 'satellite' | 'hybrid';
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<SettingsFormData>({
    defaultValues: {
      notificationsEnabled: settings.notifications.enabled,
      notificationsSound: settings.notifications.sound,
      notificationsVibration: settings.notifications.vibration,
      notificationsFireAlerts: settings.notifications.fireAlerts,
      notificationsSystemUpdates: settings.notifications.systemUpdates,
      locationEnabled: settings.location.enabled,
      locationAccuracy: settings.location.accuracy,
      locationBackgroundTracking: settings.location.backgroundTracking,
      emergencyAuto112Call: settings.emergency.auto112Call,
      emergencyContacts: settings.emergency.emergencyContacts.join(', '), // Array'i stringe çevir
      appLanguage: settings.app.language,
      appTheme: settings.app.theme,
      appMapType: settings.app.mapType,
    },
  });

  // Redux store'daki ayarlar değiştiğinde formu sıfırla
  useEffect(() => {
    reset({
      notificationsEnabled: settings.notifications.enabled,
      notificationsSound: settings.notifications.sound,
      notificationsVibration: settings.notifications.vibration,
      notificationsFireAlerts: settings.notifications.fireAlerts,
      notificationsSystemUpdates: settings.notifications.systemUpdates,
      locationEnabled: settings.location.enabled,
      locationAccuracy: settings.location.accuracy,
      locationBackgroundTracking: settings.location.backgroundTracking,
      emergencyAuto112Call: settings.emergency.auto112Call,
      emergencyContacts: settings.emergency.emergencyContacts.join(', '),
      appLanguage: settings.app.language,
      appTheme: settings.app.theme,
      appMapType: settings.app.mapType,
    });
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormData) => {
    try {
      dispatch(updateNotificationSettings({
        enabled: data.notificationsEnabled,
        sound: data.notificationsSound,
        vibration: data.notificationsVibration,
        fireAlerts: data.notificationsFireAlerts,
        systemUpdates: data.notificationsSystemUpdates,
      }));
      dispatch(updateLocationSettings({
        enabled: data.locationEnabled,
        accuracy: data.locationAccuracy,
        backgroundTracking: data.locationBackgroundTracking,
      }));
      dispatch(updateEmergencySettings({
        auto112Call: data.emergencyAuto112Call,
        emergencyContacts: data.emergencyContacts.split(',').map(contact => contact.trim()).filter(Boolean), // String'i array'e çevir
      }));
      dispatch(updateAppSettings({
        language: data.appLanguage,
        theme: data.appTheme,
        mapType: data.appMapType,
      }));
      Alert.alert('Başarılı', 'Ayarlarınız başarıyla kaydedildi!');
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          onPress: () => {
            dispatch(resetSettings());
            Alert.alert('Başarılı', 'Ayarlar varsayılan değerlere sıfırlandı.');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Ayarlar</Text>
      </View>

      {/* Bildirim Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Bildirimleri Etkinleştir</Text>
          <Controller
            control={control}
            name="notificationsEnabled"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sesli Bildirimler</Text>
          <Controller
            control={control}
            name="notificationsSound"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Titreşimli Bildirimler</Text>
          <Controller
            control={control}
            name="notificationsVibration"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Yangın Uyarıları</Text>
          <Controller
            control={control}
            name="notificationsFireAlerts"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sistem Güncellemeleri</Text>
          <Controller
            control={control}
            name="notificationsSystemUpdates"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
      </View>

      {/* Konum Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konum Ayarları</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Konum Servisleri</Text>
          <Controller
            control={control}
            name="locationEnabled"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
        {/* Konum Doğruluğu ve Arka Plan Takibi için daha karmaşık UI gerekebilir, şimdilik basit tutalım */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Arka Plan Konum Takibi</Text>
          <Controller
            control={control}
            name="locationBackgroundTracking"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
      </View>

      {/* Acil Durum Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acil Durum Ayarları</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Otomatik 112 Ara</Text>
          <Controller
            control={control}
            name="emergencyAuto112Call"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }} thumbColor={COLORS.background} />
            )}
          />
        </View>
        <Text style={styles.settingLabel}>Acil Durum Kişileri (Virgülle Ayırın)</Text>
        <Controller
          control={control}
          name="emergencyContacts"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Örn: 5551234567, 5559876543"
              placeholderTextColor={COLORS.text.disabled}
              keyboardType="phone-pad"
            />
          )}
        />
      </View>

      {/* Uygulama Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dil</Text>
          {/* Dil seçimi için daha gelişmiş bir Picker veya SegmentedControl kullanılabilir */}
          <Controller
            control={control}
            name="appLanguage"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'tr' && styles.pickerOptionSelected]}
                  onPress={() => onChange('tr')}
                >
                  <Text style={[styles.pickerOptionText, value === 'tr' && styles.pickerOptionTextSelected]}>Türkçe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'en' && styles.pickerOptionSelected]}
                  onPress={() => onChange('en')}
                >
                  <Text style={[styles.pickerOptionText, value === 'en' && styles.pickerOptionTextSelected]}>English</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Tema</Text>
          {/* Tema seçimi için daha gelişmiş bir Picker veya SegmentedControl kullanılabilir */}
          <Controller
            control={control}
            name="appTheme"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'light' && styles.pickerOptionSelected]}
                  onPress={() => onChange('light')}
                >
                  <Text style={[styles.pickerOptionText, value === 'light' && styles.pickerOptionTextSelected]}>Aydınlık</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'dark' && styles.pickerOptionSelected]}
                  onPress={() => onChange('dark')}
                >
                  <Text style={[styles.pickerOptionText, value === 'dark' && styles.pickerOptionTextSelected]}>Karanlık</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'auto' && styles.pickerOptionSelected]}
                  onPress={() => onChange('auto')}
                >
                  <Text style={[styles.pickerOptionText, value === 'auto' && styles.pickerOptionTextSelected]}>Otomatik</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Harita Türü</Text>
          {/* Harita türü seçimi için daha gelişmiş bir Picker veya SegmentedControl kullanılabilir */}
          <Controller
            control={control}
            name="appMapType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'standard' && styles.pickerOptionSelected]}
                  onPress={() => onChange('standard')}
                >
                  <Text style={[styles.pickerOptionText, value === 'standard' && styles.pickerOptionTextSelected]}>Standart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'satellite' && styles.pickerOptionSelected]}
                  onPress={() => onChange('satellite')}
                >
                  <Text style={[styles.pickerOptionText, value === 'satellite' && styles.pickerOptionTextSelected]}>Uydu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, value === 'hybrid' && styles.pickerOptionSelected]}
                  onPress={() => onChange('hybrid')}
                >
                  <Text style={[styles.pickerOptionText, value === 'hybrid' && styles.pickerOptionTextSelected]}>Hibrit</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>

      <Button
        title="Ayarları Kaydet"
        onPress={handleSubmit(onSubmit)}
        color={COLORS.primary}
        disabled={!isDirty} // Sadece değişiklik varsa aktif
      />
      <View style={{ marginVertical: SIZES.base }} />
      <Button
        title="Ayarları Sıfırla"
        onPress={handleResetSettings}
        color={COLORS.error}
      />

      <View style={styles.backButtonContainer}>
        <Button title="Geri Dön" onPress={() => navigation.goBack()} color={COLORS.text.secondary} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2, // Adjust for status bar
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: SIZES.padding,
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
  section: {
    marginBottom: SIZES.padding * 2,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
    paddingVertical: SIZES.base / 2,
  },
  settingLabel: {
    fontSize: SIZES.body,
    color: COLORS.text.primary,
    flex: 1,
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
  pickerContainer: {
    flexDirection: 'row',
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
  },
  pickerOption: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRightWidth: 1,
    borderRightColor: COLORS.text.disabled,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    color: COLORS.text.primary,
    fontSize: SIZES.body,
  },
  pickerOptionTextSelected: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  backButtonContainer: {
    marginTop: SIZES.padding * 2,
  },
});

export default SettingsScreen;