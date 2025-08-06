import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

export const AlertsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Surface style={styles.placeholder}>
        <NotificationsOutlinedIcon style={styles.icon} />
        <Text variant="headlineSmall" style={styles.title}>
          Uyarılar
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Yangın uyarıları ve bildirimler burada görünecek
        </Text>
        <Text variant="bodySmall" style={styles.note}>
          Bildirim sistemi Phase 5'te gelecek
        </Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
  },
  icon: {
    fontSize: 64,
    color: '#FFC107',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  note: {
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
});