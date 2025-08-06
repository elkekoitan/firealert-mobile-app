import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';
import { CustomButton } from '../components/common/CustomButton';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigation = useNavigation();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!firstName || !lastName) {
          Alert.alert('Hata', 'Lütfen ad ve soyadınızı girin.');
          return;
        }
        await signUp(email, password, { firstName, lastName });
      }
    } catch (error: any) {
      Alert.alert(
        isLogin ? 'Giriş Hatası' : 'Kayıt Hatası',
        error.message || 'Bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    // Navigation will be handled by AuthContext
    console.log('Google Sign-In successful');
  };

  const handleGoogleError = (error: string) => {
    Alert.alert('Google Giriş Hatası', error);
  };

  const handleForgotPassword = () => {
    navigation.navigate('PasswordReset' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>🔥 FireAlert</Text>
        <Text style={styles.subtitle}>
          Yangın raporlama ve erken uyarı sistemi
        </Text>

        <View style={styles.authContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Ad"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Soyad"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Şifre Tekrarı"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Şifremi Unuttum
                </Text>
              </TouchableOpacity>
            )}

            <CustomButton
              title={
                loading
                  ? (isLogin ? 'Giriş yapılıyor...' : 'Kayıt oluşturuluyor...')
                  : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')
              }
              onPress={handleEmailAuth}
              disabled={loading}
              style={styles.authButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.h1 + 8,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  authContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 4,
    marginBottom: SIZES.padding,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.base,
    alignItems: 'center',
    borderRadius: SIZES.radius - 2,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: 'white',
  },
  form: {
    gap: SIZES.base,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.text.disabled,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75,
    fontSize: SIZES.body,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: SIZES.base / 2,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.caption,
    textDecorationLine: 'underline',
  },
  authButton: {
    marginTop: SIZES.base,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.text.disabled,
  },
  dividerText: {
    marginHorizontal: SIZES.base,
    color: COLORS.text.secondary,
    fontSize: SIZES.caption,
  },
});

export default AuthScreen;