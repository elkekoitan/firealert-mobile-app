import { ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext) => ({
  ...config,
  expo: {
    name: 'FireAlert',
    slug: 'firealert-mobile',
    version: '0.1.0',
    orientation: 'portrait',
    privacy: 'public',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FF5722',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.firealert.mobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FF5722',
      },
      package: 'com.firealert.mobile',
      permissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.INTERNET',
        'android.permission.POST_NOTIFICATIONS',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    scheme: 'firealert',
    intentFilters: [
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'firealert',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    plugins: [
      'expo-camera',
      'expo-location',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#FF5722',
          defaultChannel: 'default',
          sounds: ['./assets/notification.wav'],
        },
      ],
      'expo-secure-store',
    ],
    extra: {
      // Environment-specific configuration will be injected at build time
      env: process.env.ENV_NAME || 'development',
    },
  },
});
