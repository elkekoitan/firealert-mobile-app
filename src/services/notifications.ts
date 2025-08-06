import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { environment } from '../utils/environment';
import { store } from '../store';
import { apiSlice } from '../store/services/api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification types
export enum NotificationType {
  FIRE_ALERT = 'FIRE_ALERT',
  REPORT_VERIFIED = 'REPORT_VERIFIED',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  EMERGENCY = 'EMERGENCY',
}

// Notification interface
export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  priority?: 'high' | 'normal' | 'low';
  sound?: string;
  badge?: number;
}

// Push notification service
export class PushNotificationService {
  private isInitialized = false;

  // Initialize notification service
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request notification permission
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync();
      
      // Register token with backend
      if (token.data) {
        await this.registerPushToken(token.data);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('Push notification service initialized');

    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  // Register push token with backend
  private async registerPushToken(token: string): Promise<void> {
    try {
      const { data } = await store.dispatch(
        apiSlice.endpoints.registerPushToken.initiate({
          token,
          platform: Platform.OS,
          device: 'mobile',
        })
      );
      
      console.log('Push token registered successfully');
      return data;
    } catch (error) {
      console.error('Failed to register push token:', error);
      throw error;
    }
  }

  // Setup notification listeners
  private setupNotificationListeners(): void {
    // Handle notifications received while app is foreground
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived);

    // Handle notification response (user taps on notification)
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
  }

  // Handle notification received
  private handleNotificationReceived = (notification: Notifications.Notification) => {
    const { request } = notification;
    const data = request.content.data as any;

    // Dispatch notification to Redux store
    store.dispatch({
      type: 'notifications/foregroundNotification',
      payload: {
        id: notification.request.identifier,
        type: data.type || NotificationType.SYSTEM_UPDATE,
        title: request.content.title,
        body: request.content.body,
        data: data,
        timestamp: new Date().toISOString(),
      },
    });

    // Handle specific notification types
    this.handleNotificationType(data.type, data);
  };

  // Handle notification response
  private handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { notification } = response;
    const data = notification.content.data as any;

    // Navigate to appropriate screen based on notification type
    this.handleNotificationNavigation(data.type, data);

    // Dispatch notification response to Redux store
    store.dispatch({
      type: 'notifications/notificationResponse',
      payload: {
        id: notification.request.identifier,
        type: data.type || NotificationType.SYSTEM_UPDATE,
        title: notification.content.title,
        body: notification.content.body,
        data: data,
        timestamp: new Date().toISOString(),
      },
    });
  };

  // Handle specific notification types
  private handleNotificationType(type: string, data: any): void {
    switch (type) {
      case NotificationType.FIRE_ALERT:
        // Play critical sound for fire alerts
        if (data.priority === 'high') {
          Notifications.scheduleNotificationAsync({
            content: {
              title: '🚨 Kritik Yangın Uyarısı',
              body: data.message || 'Yakınında kritik bir yangın tespit edildi',
              sound: 'default',
              priority: 'high',
              badge: 1,
            },
            trigger: null, // Immediate
          });
        }
        break;

      case NotificationType.REPORT_VERIFIED:
        // Play success sound for verified reports
        Notifications.scheduleNotificationAsync({
          content: {
            title: '✅ Rapor Doğrulandı',
            body: data.message || 'Yangın raporunuz doğrulandı',
            sound: 'default',
            priority: 'normal',
            badge: 1,
          },
          trigger: null, // Immediate
        });
        break;

      case NotificationType.EMERGENCY:
        // Emergency notification with sound
        Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 ACİL DURUM',
            body: data.message || 'Acil durum bildirimi',
            sound: 'default',
            priority: 'high',
            badge: 1,
          },
          trigger: null, // Immediate
        });
        break;
    }
  };

  // Handle navigation based on notification type
  private handleNotificationNavigation(type: string, data: any): void {
    // This will be implemented with navigation service
    // For now, just log the navigation intent
    console.log('Navigate to:', type, data);
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound || 'default',
          priority: notification.priority || 'normal',
          badge: notification.badge || 0,
        },
        trigger: null, // Immediate
      });

      return identifier;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      throw error;
    }
  }

  // Send push notification (for testing or admin purposes)
  async sendPushNotification(notification: NotificationData, tokens: string[]): Promise<void> {
    try {
      // This would typically call a backend service to send push notifications
      // For now, we'll just log it
      console.log('Sending push notification to tokens:', tokens);
      console.log('Notification:', notification);
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  // Cancel notification
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      throw error;
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      throw error;
    }
  }

  // Get delivered notifications
  async getDeliveredNotifications(): Promise<Notifications.Notification[]> {
    try {
      return await Notifications.getDeliveredNotificationsAsync();
    } catch (error) {
      console.error('Failed to get delivered notifications:', error);
      throw error;
    }
  }

  // Remove delivered notification
  async removeDeliveredNotification(identifier: string): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(identifier);
    } catch (error) {
      console.error('Failed to remove delivered notification:', error);
      throw error;
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.status === 'granted';
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermissions(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return 'undetermined';
    }
  }

  // Cleanup
  cleanup(): void {
    // Remove listeners
    Notifications.removeNotificationSubscription(
      Notifications.addNotificationReceivedListener(() => {})
    );
    Notifications.removeNotificationSubscription(
      Notifications.addNotificationResponseReceivedListener(() => {})
    );
    
    this.isInitialized = false;
  }
}

// Global push notification service instance
let globalPushNotificationService: PushNotificationService | null = null;

// Get or create push notification service
export const getPushNotificationService = (): PushNotificationService => {
  if (!globalPushNotificationService) {
    globalPushNotificationService = new PushNotificationService();
  }
  return globalPushNotificationService;
};

// Initialize push notifications
export const initializePushNotifications = async (): Promise<void> => {
  const service = getPushNotificationService();
  await service.initialize();
};

// Cleanup push notifications
export const cleanupPushNotifications = (): void => {
  if (globalPushNotificationService) {
    globalPushNotificationService.cleanup();
    globalPushNotificationService = null;
  }
};

// Hook for using push notifications in components
export const usePushNotifications = () => {
  const service = getPushNotificationService();

  const initialize = async () => {
    if (!service.isInitialized) {
      await service.initialize();
    }
  };

  const sendLocalNotification = async (notification: NotificationData) => {
    return await service.sendLocalNotification(notification);
  };

  const cancelNotification = async (identifier: string) => {
    return await service.cancelNotification(identifier);
  };

  const areNotificationsEnabled = async () => {
    return await service.areNotificationsEnabled();
  };

  const requestPermissions = async () => {
    return await service.requestPermissions();
  };

  return {
    initialize,
    sendLocalNotification,
    cancelNotification,
    areNotificationsEnabled,
    requestPermissions,
    isInitialized: service.isInitialized,
  };
};

// Utility function to create notification data
export const createNotificationData = (
  type: NotificationType,
  title: string,
  body: string,
  data?: any,
  priority: 'high' | 'normal' | 'low' = 'normal'
): NotificationData => {
  return {
    type,
    title,
    body,
    data,
    priority,
    sound: priority === 'high' ? 'default' : undefined,
    badge: priority === 'high' ? 1 : 0,
  };
};