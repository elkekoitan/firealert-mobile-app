import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import { lightTheme } from '../theme/theme';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <PaperProvider theme={lightTheme}>
            <NavigationContainer>
              {children}
            </NavigationContainer>
          </PaperProvider>
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};