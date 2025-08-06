import { useState, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { PermissionType } from '../types/enums';

export interface PermissionStatus {
  camera?: 'granted' | 'denied' | 'undetermined';
  location?: 'granted' | 'denied' | 'undetermined';
  notifications?: 'granted' | 'denied' | 'undetermined';
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({});

  const checkPermissions = async () => {
    try {
      const [cameraStatus, locationStatus, notificationStatus] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      setPermissions({
        camera: cameraStatus.status,
        location: locationStatus.status,
        notifications: notificationStatus.status,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestPermission = async (type: PermissionType): Promise<boolean> => {
    try {
      let result;
      
      switch (type) {
        case PermissionType.CAMERA:
          result = await Camera.requestCameraPermissionsAsync();
          setPermissions(prev => ({ ...prev, camera: result.status }));
          break;
        case PermissionType.LOCATION:
          result = await Location.requestForegroundPermissionsAsync();
          setPermissions(prev => ({ ...prev, location: result.status }));
          break;
        case PermissionType.NOTIFICATIONS:
          result = await Notifications.requestPermissionsAsync();
          setPermissions(prev => ({ ...prev, notifications: result.status }));
          break;
        default:
          return false;
      }

      if (result.status === 'denied') {
        showPermissionAlert(type);
        return false;
      }

      return result.status === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const showPermissionAlert = (type: PermissionType) => {
    const messages = {
      [PermissionType.CAMERA]: {
        title: 'Kamera İzni Gerekli',
        message: 'Yangın fotoğrafı çekebilmek için kamera erişimine ihtiyacımız var. Lütfen ayarlardan kamera iznini açın.',
      },
      [PermissionType.LOCATION]: {
        title: 'Konum İzni Gerekli',
        message: 'Yangın konumunu belirleyebilmek için konum erişimine ihtiyacımız var. Lütfen ayarlardan konum iznini açın.',
      },
      [PermissionType.NOTIFICATIONS]: {
        title: 'Bildirim İzni Gerekli',
        message: 'Kritik yangın uyarılarını alabilmek için bildirim iznine ihtiyacımız var. Lütfen ayarlardan bildirim iznini açın.',
      },
      [PermissionType.MEDIA_LIBRARY]: {
        title: 'Medya İzni Gerekli',
        message: 'Fotoğraf seçebilmek için medya kütüphanesi erişimine ihtiyacımız var.',
      },
    };

    const { title, message } = messages[type];

    Alert.alert(
      title,
      message,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ayarlara Git', 
          onPress: () => Linking.openSettings() 
        }
      ]
    );
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissions,
    requestPermission,
    checkPermissions,
  };
};