import React from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Linking } from 'react-native';
import { store } from '../store';
import { apiSlice } from './apiService';
import NavigationService from './navigationService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationData {
  type: 'FIRE_ALERT' | 'VERIFICATION' | 'EMERGENCY' | 'SYSTEM';
  reportId?: string;
  alertId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  deepLink?: string;
}

export interface NotificationResponse {
  notification: Notifications.Notification;
  actionIdentifier: string;
}

class PushNotificationService {
  private token: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        // Still set up minimal listeners if desired in the future
        return;
      }
      // Register for push notifications
      const token = await this.registerForPushNotifications();
      if (token) {
        this.token = token;
        await this.registerTokenWithBackend(token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      console.log('Push notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create emergency channel for critical alerts
      await Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500, 200, 500],
        lightColor: '#FF0000',
        sound: 'default',
        enableVibrate: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || (Constants as any).easConfig?.projectId;
        
        if (!projectId) {
          console.warn('No Expo project ID found, using legacy method');
        }

        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;

        console.log('Push token obtained:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
        throw error; // bubble up to initialize error handler for visibility
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      const platform = Platform.OS as 'ios' | 'android';
      
      // Use RTK Query mutation to register token
      const result = await store.dispatch(
        apiSlice.endpoints.registerPushToken.initiate({
          expo_token: token,
          platform: platform,
        })
      );

      if ('error' in result) {
        console.error('Failed to register push token with backend:', result.error);
      } else {
        console.log('Push token registered with backend successfully');
      }
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotificationReceived(notification: Notifications.Notification): void {
    const data = notification.request.content.data as PushNotificationData;
    
    // Update badge count
    Notifications.setBadgeCountAsync(1);

    // Handle based on notification type
    switch (data.type) {
      case 'FIRE_ALERT':
        // Invalidate reports cache to fetch new data
        store.dispatch(
          apiSlice.util.invalidateTags(['Report'])
        );
        break;
      case 'EMERGENCY':
        // Show immediate alert
        console.log('Emergency notification received:', notification);
        this.showEmergencyAlert(notification);
        break;
      case 'VERIFICATION':
        // Invalidate specific report cache
        if (data.reportId) {
          store.dispatch(
            apiSlice.util.invalidateTags([{ type: 'Report', id: data.reportId }])
          );
        }
        break;
    }
  }

  private handleNotificationResponse(response: NotificationResponse): void {
    const data = response.notification.request.content.data as PushNotificationData;
    
    // Clear badge
    Notifications.setBadgeCountAsync(0);

    // Handle deep linking
    if (data.deepLink) {
      this.handleDeepLink(data.deepLink);
    } else {
      // Default navigation based on type
      this.navigateBasedOnType(data);
    }
  }

  private handleDeepLink(deepLink: string): void {
    console.log('Handling notification deep link:', deepLink);
    NavigationService.handleDeepLink(deepLink);
  }

  private navigateBasedOnType(data: PushNotificationData): void {
    switch (data.type) {
      case 'FIRE_ALERT':
        if (data.reportId) {
          NavigationService.navigateToReport(data.reportId);
        } else if (data.location) {
          NavigationService.navigateToMap({
            initialRegion: {
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
          });
        } else {
          NavigationService.navigateToMap();
        }
        break;
      case 'EMERGENCY':
        if (data.reportId) {
          NavigationService.navigateToReport(data.reportId);
        } else if (data.location) {
          NavigationService.navigateToMap({
            initialRegion: {
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
          });
        }
        break;
      case 'VERIFICATION':
        if (data.reportId) {
          NavigationService.navigateToReport(data.reportId);
        }
        break;
      case 'SYSTEM':
        if (data.alertId) {
          NavigationService.navigateToAlert(data.alertId);
        } else {
          NavigationService.navigateToAlerts();
        }
        break;
      default:
        NavigationService.navigateToMap();
        break;
    }
  }



  private showEmergencyAlert(notification: Notifications.Notification): void {
    const data = notification.request.content.data as PushNotificationData;
    
    // Create emergency alert data
    const emergencyData = {
      id: notification.request.identifier,
      type: data.type as 'FIRE_ALERT' | 'EMERGENCY',
      title: notification.request.content.title || 'Acil Durum',
      message: notification.request.content.body || 'Yakında yangın tespit edildi',
      location: data.location,
      severity: 'CRITICAL' as const,
      reportId: data.reportId,
      timestamp: Date.now(),
      emergency112Contacted: false,
    };
    
    // Dispatch emergency alert to show overlay
    store.dispatch({
      type: 'notifications/showEmergencyAlert',
      payload: emergencyData,
    });
    
    // Also trigger vibration and sound at OS level
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'YANGIN ALARMI',
        body: 'Acil durum! Hemen harekete geçin.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // Immediate
    });
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: PushNotificationData,
    seconds: number = 0
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: data?.type === 'EMERGENCY' ? 'default' : undefined,
      },
      trigger: seconds > 0 ? { seconds } : null,
    });

    return notificationId;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  getToken(): string | null {
    return this.token;
  }

  cleanup(): void {
    if (this.notificationListener) {
      if (typeof this.notificationListener.remove === 'function') {
        this.notificationListener.remove();
      } else {
        Notifications.removeNotificationSubscription(this.notificationListener);
      }
    }
    if (this.responseListener) {
      if (typeof this.responseListener.remove === 'function') {
        this.responseListener.remove();
      } else {
        Notifications.removeNotificationSubscription(this.responseListener);
      }
    }
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

// React hook for using push notifications
export const usePushNotifications = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        await pushNotificationService.initialize();
        setToken(pushNotificationService.getToken());
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initialize();

    return () => {
      pushNotificationService.cleanup();
    };
  }, []);

  return {
    isInitialized,
    token,
    scheduleLocal: pushNotificationService.scheduleLocalNotification.bind(pushNotificationService),
    cancel: pushNotificationService.cancelNotification.bind(pushNotificationService),
    cancelAll: pushNotificationService.cancelAllNotifications.bind(pushNotificationService),
    getBadgeCount: pushNotificationService.getBadgeCount.bind(pushNotificationService),
    setBadgeCount: pushNotificationService.setBadgeCount.bind(pushNotificationService),
  };
};

// Initialize the service
export const initializePushNotifications = async (): Promise<void> => {
  await pushNotificationService.initialize();
};
