import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Surface, Switch, Divider } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateAppSettings, updateNotificationSettings } from '../../store/slices/settingsSlice';
import { logoutUser } from '../../store/slices/authSlice';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { app, notifications } = useAppSelector(state => state.settings);

  const handleThemeChange = (isDark: boolean) => {
    dispatch(updateAppSettings({ theme: isDark ? 'dark' : 'light' }));
  };

  const handleNotificationToggle = (enabled: boolean) => {
    dispatch(updateNotificationSettings({ enabled }));
  };

  const handleSoundToggle = (sound: boolean) => {
    dispatch(updateNotificationSettings({ sound }));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <SettingsOutlinedIcon style={styles.headerIcon} />
        <Text variant="headlineSmall">Ayarlar</Text>
      </Surface>

      <Surface style={styles.section}>
        <List.Section>
          <List.Subheader>Görünüm</List.Subheader>
          <List.Item
            title="Karanlık Tema"
            description="Uygulamayı karanlık temada kullan"
            right={() => (
              <Switch
                value={app.theme === 'dark'}
                onValueChange={handleThemeChange}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Dil"
            description={app.language === 'tr' ? 'Türkçe' : 'English'}
            right={() => <Text>TR</Text>}
          />
        </List.Section>
      </Surface>

      <Surface style={styles.section}>
        <List.Section>
          <List.Subheader>Bildirimler</List.Subheader>
          <List.Item
            title="Bildirimler"
            description="Push bildirimleri al"
            right={() => (
              <Switch
                value={notifications.enabled}
                onValueChange={handleNotificationToggle}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Ses"
            description="Bildirim sesi çal"
            right={() => (
              <Switch
                value={notifications.sound}
                onValueChange={handleSoundToggle}
              />
            )}
          />
        </List.Section>
      </Surface>

      <Surface style={styles.section}>
        <List.Section>
          <List.Subheader>Hesap</List.Subheader>
          <List.Item
            title="Profil"
            description="Profil bilgilerini düzenle"
            left={props => <List.Icon {...props} icon="account" />}
          />
          <Divider />
          <List.Item
            title="Çıkış Yap"
            description="Hesabından çıkış yap"
            left={props => <List.Icon {...props} icon="logout" />}
            titleStyle={{ color: '#f44336' }}
            onPress={handleLogout}
          />
        </List.Section>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  headerIcon: {
    fontSize: 24,
    color: '#757575',
  },
  section: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
});