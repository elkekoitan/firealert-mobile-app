
export const COLORS = {
  primary: '#FF5722',
  primaryDark: '#D84315',
  secondary: '#FFC107',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
  },
  fire: {
    low: '#FFC107',
    medium: '#FF9800',
    high: '#FF5722',
    critical: '#D32F2F',
  }
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 16,
  margin: 16,

  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 14,
  caption: 12,
  small: 10,

  // App dimensions
  header: 60,
  tabBar: 80,
};

export const API_ENDPOINTS = {
  BASE_URL: 'https://api.wildfireews.com/v1',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  REPORTS: {
    CREATE: '/reports',
    LIST: '/reports',
    GET: '/reports',
    UPDATE: '/reports',
    DELETE: '/reports',
  },
  NASA_FIRMS: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/VIIRS_SNPP_NRT',
  WEBSOCKET: 'wss://api.wildfireews.com/ws',
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  SETTINGS: 'app_settings',
  LOCATION_PERMISSION: 'location_permission',
  NOTIFICATION_PERMISSION: 'notification_permission',
};

export const PERMISSIONS = {
  CAMERA: 'camera',
  LOCATION: 'location',
  NOTIFICATIONS: 'notifications',
  MEDIA_LIBRARY: 'media_library',
};

export const RISK_LEVELS = {
  LOW: { color: COLORS.fire.low, label: 'Düşük Risk' },
  MEDIUM: { color: COLORS.fire.medium, label: 'Orta Risk' },
  HIGH: { color: COLORS.fire.high, label: 'Yüksek Risk' },
  CRITICAL: { color: COLORS.fire.critical, label: 'Kritik Risk' },
};
