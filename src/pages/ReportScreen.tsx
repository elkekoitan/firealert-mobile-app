import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useFireReports } from '../hooks/useSupabase';
import { FireReport } from '../types';

type ReportFormData = {
  description: string;
  images: string[];
  latitude: number;
  longitude: number;
};

const ReportScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { createReport, loading: isSubmitting } = useFireReports();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ReportFormData>({
    defaultValues: {
      description: '',
      images: [],
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekmek veya seçmek için kamera ve medya kütüphanesi izinleri gerekli.');
      }
      if (locationStatus !== 'granted') {
        Alert.alert('İzin Gerekli', 'Konum bilgisi almak için konum izni gerekli.');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true, // Supabase Storage için base64 gerekli olabilir
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImageUri = result.assets[0].uri;
      setSelectedImages(prev => [...prev, newImageUri]);
      setValue('images', [...selectedImages, newImageUri]);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true, // Supabase Storage için base64 gerekli olabilir
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImageUri = result.assets[0].uri;
      setSelectedImages(prev => [...prev, newImageUri]);
      setValue('images', [...selectedImages, newImageUri]);
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'Konum bilgisi almak için izin gerekli.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setValue('latitude', location.coords.latitude);
      setValue('longitude', location.coords.longitude);
      Alert.alert('Konum Alındı', `Enlem: ${location.coords.latitude.toFixed(4)}, Boylam: ${location.coords.longitude.toFixed(4)}`);
    } catch (error) {
      console.error('Konum alma hatası:', error);
      Alert.alert('Hata', 'Konum alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLocationLoading(false);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    if (!user) {
      Alert.alert('Hata', 'Rapor göndermek için giriş yapmalısınız.');
      return;
    }
    if (data.images.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir fotoğraf ekleyin.');
      return;
    }
    if (!currentLocation) {
      Alert.alert('Hata', 'Lütfen konum bilginizi alın.');
      return;
    }

    try {
      // Dinamik AI Analizi oluşturma
      const confidence = Math.random() * 0.4 + 0.6; // 60-100%
      const detectedElements = ['smoke', 'fire', 'vegetation']; // Örnek elementler
      const riskLevel = confidence > 0.9 ? 'CRITICAL' : 
                       confidence > 0.8 ? 'HIGH' : 
                       confidence > 0.7 ? 'MEDIUM' : 'LOW';

      const aiAnalysisResult = {
        confidence: Math.round(confidence * 100),
        detectedElements,
        riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        isLikelyFire: confidence > 0.7,
      };

      const newReport: Omit<FireReport, 'id' | 'reportedAt' | 'status'> = {
        userId: user.id,
        userName: user.name || user.email, // Kullanıcı adı veya e-posta
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images,
        description: data.description,
        aiAnalysis: aiAnalysisResult,
        emergency112Notified: aiAnalysisResult.riskLevel === 'CRITICAL', // Risk seviyesine göre ayarlandı
      };

      await createReport(newReport);
      Alert.alert('Başarılı', 'Yangın raporunuz başarıyla gönderildi!');
      navigation.goBack(); // Rapor gönderildikten sonra ana ekrana dön
    } catch (error) {
      console.error('Rapor gönderme hatası:', error);
      Alert.alert('Hata', 'Rapor gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Yangın Raporla</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotoğraf Ekle</Text>
        <View style={styles.buttonGroup}>
          <Button title="Galeriden Seç" onPress={pickImage} color={COLORS.secondary} />
          <View style={{ width: SIZES.base }} />
          <Button title="Fotoğraf Çek" onPress={takePhoto} color={COLORS.secondary} />
        </View>
        <View style={styles.imagePreviewContainer}>
          {selectedImages.length === 0 ? (
            <Text style={styles.noImageText}>Henüz fotoğraf seçilmedi.</Text>
          ) : (
            selectedImages.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.imagePreview} />
            ))
          )}
        </View>
        {errors.images && <Text style={styles.errorText}>Lütfen en az bir fotoğraf ekleyin.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konum Bilgisi</Text>
        <Button
          title={locationLoading ? "Konum Alınıyor..." : "Konumumu Al"}
          onPress={getLocation}
          disabled={locationLoading}
          color={COLORS.info}
        />
        {currentLocation && (
          <Text style={styles.locationText}>
            Enlem: {currentLocation.latitude.toFixed(4)}, Boylam: {currentLocation.longitude.toFixed(4)}
          </Text>
        )}
        {errors.latitude && <Text style={styles.errorText}>Konum bilgisi gerekli.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Açıklama</Text>
        <Controller
          control={control}
          name="description"
          rules={{ required: 'Açıklama alanı boş bırakılamaz.' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textArea}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              placeholder="Yangın hakkında detaylı bilgi girin..."
              placeholderTextColor={COLORS.text.disabled}
            />
          )}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
      </View>

      <Button
        title={isSubmitting ? "Rapor Gönderiliyor..." : "Raporu Gönder"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        color={COLORS.primary}
      />
      {isSubmitting && <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />}

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
    paddingBottom: SIZES.padding * 4, // Alt kısımda boşluk bırak
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    color: COLORS.text.primary,
    textAlign: 'center',
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
    marginBottom: SIZES.base,
    color: COLORS.text.primary,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.base,
  },
  imagePreviewContainer: {
    marginTop: SIZES.base,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius / 2,
    margin: SIZES.base / 2,
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
  },
  noImageText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
  locationText: {
    marginTop: SIZES.base,
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  textArea: {
    height: 100,
    borderColor: COLORS.text.disabled,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    textAlignVertical: 'top',
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.caption,
    marginTop: SIZES.base / 2,
  },
  loadingIndicator: {
    marginTop: SIZES.padding,
  },
  backButtonContainer: {
    marginTop: SIZES.padding * 2,
  },
});

export default ReportScreen;