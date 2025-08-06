import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { CreateReportScreen } from '../screens/main/CreateReportScreen';
import { ReportDetailScreen } from '../screens/main/ReportDetailScreen';
import { useAppSelector } from '../hooks/redux';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  if (isLoading) {
    return <LoadingSpinner message="Uygulama başlatılıyor..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="CreateReport" component={CreateReportScreen} />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};