import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useSupabase';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { getReliabilityColor, getReliabilityLabel } from '../utils'; // Güvenilirlik yardımcı fonksiyonları

type ProfileFormData = {
  firstName: string;
  lastName: string;
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user: authUser, session } = useAuth(); // AuthContext'ten gelen kullanıcı
  const { profile, loading, error, updateProfile, refetchProfile } = useUserProfile(authUser?.id || '');

  const { control, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
    },
  });

  useEffect(() => {
    if (profile) {
      setValue('firstName', profile.firstName || '');
      setValue('lastName', profile.lastName || '');
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!authUser?.id) {
      Alert.alert('Hata', 'Profil güncellenemedi: Kullanıcı kimliği bulunamadı.');
      return;
    }
    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      Alert.alert('Başarılı', 'Profiliniz başarıyla güncellendi!');
      // Profil güncellendikten sonra AuthContext'teki kullanıcı bilgisini de güncelleyebiliriz
      // Bu kısım için authSlice'taki updateUser reducer'ını kullanabiliriz
      // dispatch(updateUser({ firstName: data.firstName, lastName: data.lastName }));
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.');
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Profilim</Text>
      </View>

      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={100} color={COLORS.primary} style={styles.avatar} />
        <Text style={styles.emailText}>{authUser?.email || 'E-posta Yok'}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.totalReports}</Text>
            <Text style={styles.statLabel}>Toplam Rapor</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.verifiedReports}</Text>
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

        <Button
          title="Profili Kaydet"
          onPress={handleSubmit(onSubmit)}
          color={COLORS.primary}
          disabled={!isDirty || loading} // Sadece değişiklik varsa ve yükleme yoksa aktif
        />
      </View>

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
  avatar: {
    marginBottom: SIZES.base,
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
  backButtonContainer: {
    marginTop: SIZES.padding,
  },
});

export default ProfileScreen;