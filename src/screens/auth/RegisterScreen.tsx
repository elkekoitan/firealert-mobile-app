import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNetInfo } from '@react-native-netinfo/netinfo';

import { CustomButton } from '../../components/common/CustomButton';
import { Input } from '../../components/common/Input';
import { Checkbox } from '../../components/common/Checkbox';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { registerSchema, type RegisterFormData } from '../../utils/validations';
import { theme } from '../../theme/theme';
import { useAppSelector } from '../../hooks/redux';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isConnected } = useNetworkStatus();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      agreeToTerms: false,
      privacyPolicy: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!isConnected) {
      Alert.alert('Bağlantı Hatası', 'İnternet bağlantınızı kontrol edin');
      return;
    }

    try {
      await dispatch(registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })).unwrap();
      
      Alert.alert(
        'Kayıt Başarılı',
        'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    } catch (err: any) {
      console.error('Register error:', err);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleGoogleRegister = () => {
    Alert.alert('Google Kaydı', 'Bu özellik yakında eklenecek');
  };

  const handleAppleRegister = () => {
    Alert.alert('Apple Kaydı', 'Bu özellik yakında eklenecek');
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Kayıt Hatası', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <ErrorBoundary>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>FireAlert</Text>
          <Text style={styles.subtitle}>Yangın Erken Uyarı Sistemi</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Kayıt Ol</Text>
          <Text style={styles.formSubtitle}>
            Hesap oluşturarak topluluğa katkıda bulunabilirsiniz
          </Text>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <Controller
                name="firstName"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Ad"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Adınız"
                    containerStyle={styles.nameInput}
                    error={errors.firstName?.message}
                    leftIcon="account"
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Soyad"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Soyadınız"
                    containerStyle={styles.nameInput}
                    error={errors.lastName?.message}
                    leftIcon="account"
                  />
                )}
              />
            </View>

            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="E-posta"
                  value={value}
                  onChangeText={onChange}
                  placeholder="ornek@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email?.message}
                  leftIcon="email"
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Şifre"
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  error={errors.password?.message}
                  leftIcon="lock"
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Şifreyi Onayla"
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                  leftIcon="lock-check"
                />
              )}
            />

            <View style={styles.termsContainer}>
              <Controller
                name="agreeToTerms"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    label="Kullanım Koşulları'nı kabul ediyorum"
                    checked={value}
                    onChange={onChange}
                    error={errors.agreeToTerms?.message}
                  />
                )}
              />

              <Controller
                name="privacyPolicy"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    label="Gizlilik Politikası'nı kabul ediyorum"
                    checked={value}
                    onChange={onChange}
                    error={errors.privacyPolicy?.message}
                  />
                )}
              />
            </View>

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Şifre Gereksinimleri:</Text>
              <View style={styles.requirementsList}>
                <Text style={styles.requirementItem}>• En az 8 karakter</Text>
                <Text style={styles.requirementItem}>• Büyük ve küçük harf</Text>
                <Text style={styles.requirementItem}>• Rakam ve özel karakter</Text>
              </View>
            </View>

            <CustomButton
              title={isLoading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />

            {!isConnected && (
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineText}>📡 Çevrimdışı modda çalışıyorsunuz</Text>
              </View>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <CustomButton
                title="Google ile Kayıt Ol"
                onPress={handleGoogleRegister}
                variant="outline"
                icon="google"
                style={styles.socialButton}
              />
              
              <CustomButton
                title="Apple ile Kayıt Ol"
                onPress={handleAppleRegister}
                variant="outline"
                icon="apple"
                style={styles.socialButton}
              />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Zaten hesabınız var mı?{' '}
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Giriş Yapın</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Kayıt olduğunuzda FireAlert'in Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
          </Text>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  termsContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  passwordRequirements: {
    backgroundColor: theme.colors.background + '80',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  requirementsList: {
    gap: 4,
  },
  requirementItem: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  registerButton: {
    marginBottom: theme.spacing.xl,
  },
  offlineBanner: {
    backgroundColor: theme.colors.warning + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  offlineText: {
    color: theme.colors.warning,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  socialButtons: {
    gap: theme.spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loginText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});