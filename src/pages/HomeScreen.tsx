import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // NativeStackNavigationProp eklendi
import { RootStackParamList } from '../navigation/AppNavigator'; // RootStackParamList eklendi

const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // useNavigation'a tür eklendi

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Çıkış yaparken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hoş Geldiniz, {user?.name || user?.email}!</Text>
      <Text style={styles.subtitle}>Bu ana ekranınız.</Text>
      <Button title="Yangın Raporla" onPress={() => navigation.navigate('Report')} color={COLORS.primary} />
      <View style={{ marginVertical: SIZES.base }} />
      <Button title="Bildirimler" onPress={() => navigation.navigate('Notifications')} color={COLORS.secondary} />
      <View style={{ marginVertical: SIZES.base }} />
      <Button title="Profilim" onPress={() => navigation.navigate('Profile')} color={COLORS.info} />
      <View style={{ marginVertical: SIZES.base }} />
      <Button title="Ayarlar" onPress={() => navigation.navigate('Settings')} color={COLORS.text.secondary} />
      <View style={{ marginVertical: SIZES.base * 2 }} />
      <Button title="Çıkış Yap" onPress={handleSignOut} color={COLORS.error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  welcomeText: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.h4,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding * 2,
    textAlign: 'center',
  },
});

export default HomeScreen;