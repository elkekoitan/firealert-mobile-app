import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import AuthScreen from '../pages/AuthScreen';

// Main App Screens
import HomeScreen from '../pages/HomeScreen';
import ReportScreen from '../pages/ReportScreen';
import NotificationsScreen from '../pages/NotificationsScreen';
import ProfileScreen from '../pages/ProfileScreen';
import SettingsScreen from '../pages/SettingsScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
};

const MainAppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    // You might want to render a splash screen or loading indicator here
    return null; 
  }

  return (
    <NavigationContainer>
      {session && session.user ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;