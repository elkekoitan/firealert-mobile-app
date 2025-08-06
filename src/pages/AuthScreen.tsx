import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { COLORS } from '../constants';

const AuthScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FireAlert</Text>
      <View style={styles.authContainer}>
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers for now
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: COLORS.primary,
                  brandAccent: COLORS.primaryDark,
                },
              },
            },
          }}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-posta',
                password_label: 'Şifre',
                email_input_placeholder: 'E-posta adresinizi girin',
                password_input_placeholder: 'Şifrenizi girin',
                button_label: 'Giriş Yap',
                social_provider_text: 'Şununla Giriş Yap',
                link_text: 'Zaten hesabınız var mı? Giriş Yap',
                forgotten_password_text: 'Şifrenizi mi unuttunuz?',
                no_account_text: 'Hesabınız yok mu? Kayıt Ol',
              },
              sign_up: {
                email_label: 'E-posta',
                password_label: 'Şifre',
                email_input_placeholder: 'E-posta adresinizi girin',
                password_input_placeholder: 'Şifrenizi girin',
                button_label: 'Kayıt Ol',
                social_provider_text: 'Şununla Kayıt Ol',
                link_text: 'Hesabınız var mı? Giriş Yap',
              },
              forgotten_password: {
                email_label: 'E-posta',
                password_reset_button_label: 'Şifremi Sıfırla',
                link_text: 'Şifrenizi mi unuttunuz?',
                email_input_placeholder: 'E-posta adresinizi girin',
              },
              update_password: {
                password_label: 'Yeni Şifre',
                password_input_placeholder: 'Yeni şifrenizi girin',
                button_label: 'Şifreyi Güncelle',
              },
            },
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 40,
  },
  authContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AuthScreen;