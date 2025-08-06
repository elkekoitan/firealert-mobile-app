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
import { loginUser, clearError } from '../../store/slices/authSlice';
import { loginSchema, type LoginFormData } from '../../utils/validations';
import { theme } from '../../theme/theme';
import { useAppSelector } from '../../hooks/redux';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isConnected } = useNetworkStatus();
  const { isLoading, error } = useAppSelector(state => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!isConnected) {
      Alert.alert('Bağlantı Hatası', 'İnternet bağlantınızı kontrol edin');
      return;
    }

    try {
      await dispatch(loginUser({
        email: data.email,
        password: data.password,
      })).unwrap();
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  const handleGoogleLogin = () => {
    // Google login implementation
    Alert.alert('Google Girişi', 'Bu özellik yakında eklenecek');
  };

  const handleAppleLogin = () => {
    // Apple login implementation
    Alert.alert('Apple Girişi', 'Bu özellik yakında eklenecek');
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Giriş Hatası', error);
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
          <Text style={styles.formTitle}>Giriş Yap</Text>
          <Text style={styles.formSubtitle}>Hesabınıza erişmek için bilgilerinizi girin</Text>

          <View style={styles.form}>
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
                  secureTextEntry={!showPassword}
                  error={errors.password?.message}
                  leftIcon="lock"
                  rightIcon={showPassword ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              )}
            />

            <View style={styles.optionsRow}>
              <Controller
                name="rememberMe"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    label="Beni hatırla"
                    checked={value}
                    onChange={onChange}
                  />
                )}
              />
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Şifremi unuttum?</Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              title={isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
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
                title="Google ile Devam Et"
                onPress={handleGoogleLogin}
                variant="outline"
                icon="google"
                style={styles.socialButton}
              />
              
              <CustomButton
                title="Apple ile Devam Et"
                onPress={handleAppleLogin}
                variant="outline"
                icon="apple"
                style={styles.socialButton}
              />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Hesabınız yok mu?{' '}
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupLink}>Kayıt Olun</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            FireAlert'e giriş yaparak Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  loginButton: {
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
  signupContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  signupText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  signupLink: {
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