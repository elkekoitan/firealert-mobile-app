
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    fireAlerts: boolean;
    systemUpdates: boolean;
  };
  location: {
    enabled: boolean;
    accuracy: 'high' | 'medium' | 'low';
    backgroundTracking: boolean;
  };
  emergency: {
    auto112Call: boolean;
    emergencyContacts: string[];
  };
  app: {
    language: 'tr' | 'en';
    theme: 'light' | 'dark' | 'auto';
    mapType: 'standard' | 'satellite' | 'hybrid';
  };
}

const initialState: SettingsState = {
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    fireAlerts: true,
    systemUpdates: true,
  },
  location: {
    enabled: true,
    accuracy: 'high',
    backgroundTracking: false,
  },
  emergency: {
    auto112Call: false,
    emergencyContacts: [],
  },
  app: {
    language: 'tr',
    theme: 'light',
    mapType: 'standard',
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateNotificationSettings: (state, action: PayloadAction<Partial<SettingsState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateLocationSettings: (state, action: PayloadAction<Partial<SettingsState['location']>>) => {
      state.location = { ...state.location, ...action.payload };
    },
    updateEmergencySettings: (state, action: PayloadAction<Partial<SettingsState['emergency']>>) => {
      state.emergency = { ...state.emergency, ...action.payload };
    },
    updateAppSettings: (state, action: PayloadAction<Partial<SettingsState['app']>>) => {
      state.app = { ...state.app, ...action.payload };
    },
    resetSettings: () => initialState,
  },
});

export const {
  updateNotificationSettings,
  updateLocationSettings,
  updateEmergencySettings,
  updateAppSettings,
  resetSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
