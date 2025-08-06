import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser } from '../../store/slices/authSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const handleLogin = () => {
    if (email.trim() && password.trim()) {
      dispatch(loginUser({ email: email.trim(), password }));
    }
  };

  const isFormValid = email.trim().length > 0 && password.length > 0;

  if (isLoading) {
    return <LoadingSpinner message="Giriş yapılıyor..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            FireAlert
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Hesabınıza giriş yapın
          </Text>
        </View>

        <View style={styles.form}>
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
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoComplete="password"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          {error && (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={!isFormValid}
            style={styles.button}
          >
            Giriş Yap
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.textButton}
          >
            Hesabınız yok mu? Kayıt olun
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