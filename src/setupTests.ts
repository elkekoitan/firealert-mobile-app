import '@testing-library/jest-native/extend-expect';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ThemeProvider } from 'react-native-paper';
import { lightTheme } from '../theme/theme';

// Mock expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  stopWatchingPosition: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getDeliveredNotificationsAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  manifest: {
      extra: {
        eas: {
          projectId: 'test-project-id',
        },
      },
    },
  defaultConfig: {
    expo: {
      name: 'FireAlert',
      slug: 'firealert',
      version: '1.0.0',
    },
  },
}));

jest.mock('@react-native-netinfo/netinfo', () => ({
  useNetInfo: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: {
      isConnectionExpensive: false,
      cellularGeneration: '4g',
      downlink: 10,
      effectiveType: '4g',
      rtt: 50,
    },
  }),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return {
    MapView: React.forwardRef((props, ref) => (
      <View testID="map-view" {...props}>
        {props.children}
      </View>
    )),
    Marker: React.forwardRef((props, ref) => (
      <View testID="marker" {...props}>
        {props.children}
      </View>
    )),
    Callout: React.forwardRef((props, ref) => (
      <View testID="callout" {...props}>
        {props.children}
      </View>
    )),
    PROVIDER_DEFAULT: 'default',
    Region: {},
    Coordinate: {},
  };
});

// Custom render function with Redux store and theme provider
const customRender = (component: React.ReactElement, options?: any) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        {component}
      </ThemeProvider>
    </Provider>,
    options
  );
};

// Re-export render function
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to %s inside a test was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Setup global test utilities
global.beforeEach = () => {
  // Reset fetch mock
  (fetch as jest.Mock).mockClear();
  
  // Reset secure store mock
  const { getItemAsync, setItemAsync, deleteItemAsync } = require('expo-secure-store');
  getItemAsync.mockResolvedValue(null);
  setItemAsync.mockResolvedValue();
  deleteItemAsync.mockResolvedValue();
  
  // Reset location mock
  const { requestForegroundPermissionsAsync, getCurrentPositionAsync } = require('expo-location');
  requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  getCurrentPositionAsync.mockResolvedValue({
    coords: {
      latitude: 41.0082,
      longitude: 28.9784,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  });
};

// Cleanup after all tests
global.afterAll = () => {
  // Restore original console.error
  console.error = originalError;
  
  // Clean up all mocks
  jest.restoreAllMocks();
};