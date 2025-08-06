
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';
import { EmergencyAlertData } from '../../components/common/EmergencyAlertOverlay';

interface NotificationsState {
  notifications: Notification[];
  alerts: any[];
  unreadCount: number;
  selectedAlert: any | null;
  emergencyAlert: EmergencyAlertData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  alerts: [],
  unreadCount: 0,
  selectedAlert: null,
  emergencyAlert: null,
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.unshift(notification);
      if (!notification.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    // Alert-specific actions
    fetchAlerts: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    markAlertAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.isRead = true;
      }
    },
    setSelectedAlert: (state, action: PayloadAction<any>) => {
      state.selectedAlert = action.payload;
    },
    // Emergency alert actions
    showEmergencyAlert: (state, action: PayloadAction<EmergencyAlertData>) => {
      state.emergencyAlert = action.payload;
    },
    clearEmergencyAlert: (state) => {
      state.emergencyAlert = null;
    },
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification,
  fetchAlerts,
  clearAlerts,
  markAlertAsRead,
  setSelectedAlert,
  showEmergencyAlert,
  clearEmergencyAlert
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
