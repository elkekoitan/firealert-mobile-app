import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser } from '../../store/slices/authSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const handleRegister = () => {
    if (isFormValid) {
      dispatch(registerUser({ 
        email: email.trim(), 
        password, 
        name: name.trim(),
        phone: phone.trim() || undefined
      }));
    }
  };

  const isFormValid = 
    email.trim().length > 0 && 
    password.length >= 6 && 
    confirmPassword === password &&
    name.trim().length > 0;

  if (isLoading) {
    return <LoadingSpinner message="Kayıt yapılıyor..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            FireAlert
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Yeni hesap oluşturun
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Ad Soyad"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.input}
          />

          <TextInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />

          <TextInput
            label="Telefon (Opsiyonel)"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            autoComplete="tel"
            style={styles.input}
          />

          <TextInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          <TextInput
            label="Şifre Tekrar"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            style={styles.input}
            error={confirmPassword.length > 0 && confirmPassword !== password}
          />

          {confirmPassword.length > 0 && confirmPassword !== password && (
            <Text variant="bodySmall" style={styles.error}>
              Şifreler eşleşmiyor
            </Text>
          )}

          {error && (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            disabled={!isFormValid}
            style={styles.button}
          >
            Kayıt Ol
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.textButton}
          >
            Zaten hesabınız var mı? Giriş yapın
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
  },
  textButton: {
    marginTop: 8,
  },
  error: {
    color: '#f44336',
    textAlign: 'center',
  },
});