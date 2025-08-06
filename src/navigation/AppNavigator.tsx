import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { setNavigationRef, setupDeepLinkListener, deepLinkMapping } from '../services/navigationService';

// Auth Navigator
import AuthNavigator from './AuthNavigator';

// Main Navigator  
import MainNavigator from './MainNavigator';

// Define RootStackParamList for type safety
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const authState = useSelector((state: any) => state.auth);
  const { isAuthenticated = false, isLoading = false } = authState || {};

  // Setup navigation reference and deep linking
  useEffect(() => {
    // Set navigation reference for the navigation service
    setNavigationRef(navigationRef);
    
    // Setup deep link listener
    const unsubscribe = setupDeepLinkListener();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    // You might want to render a splash screen or loading indicator here
    return null; 
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      linking={deepLinkMapping}
      onReady={() => {
        console.log('Navigation container ready');
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;