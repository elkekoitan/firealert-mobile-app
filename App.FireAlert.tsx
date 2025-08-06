import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './src/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppDispatch } from './src/hooks/redux';
import { loadStoredAuth } from './src/store/slices/authSlice';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load stored authentication on app start
    dispatch(loadStoredAuth());
  }, [dispatch]);

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}