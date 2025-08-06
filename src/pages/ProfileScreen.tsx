import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profilim</Text>
      <Text style={styles.subtitle}>Bu ekran kullanıcı profil bilgilerinizi gösterecek.</Text>
      <Button title="Geri Dön" onPress={() => navigation.goBack()} color={COLORS.text.secondary} />
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
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: SIZES.h4,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding * 2,
    textAlign: 'center',
  },
});

export default ProfileScreen;