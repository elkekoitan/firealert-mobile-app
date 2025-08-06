import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { MapScreen } from '../screens/main/MapScreen';
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { AlertsScreen } from '../screens/main/AlertsScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ReportOutlinedIcon from '@mui/icons-material/ReportOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF5722',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Harita',
          tabBarIcon: ({ color, size }) => (
            <MapOutlinedIcon style={{ fontSize: size, color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Raporlar',
          tabBarIcon: ({ color, size }) => (
            <ReportOutlinedIcon style={{ fontSize: size, color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Uyarılar',
          tabBarIcon: ({ color, size }) => (
            <NotificationsOutlinedIcon style={{ fontSize: size, color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <SettingsOutlinedIcon style={{ fontSize: size, color }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};