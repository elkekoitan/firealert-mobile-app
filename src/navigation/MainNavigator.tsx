import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { MainTabParamList } from './types';
import { MapScreen } from '../screens/main/MapScreen';
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { AlertsScreen } from '../screens/main/AlertsScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { SubscriptionScreen } from '../screens/main/SubscriptionScreen';
import { theme } from '../theme/theme';

// Icon component for React Native
const TabIcon = ({ focused, color, name }: { focused: boolean; color: string; name: string }) => {
  const iconSize = 24;
  
  // Simple icon representation using text
  const getIcon = () => {
    switch (name) {
      case 'Map':
        return '🗺️';
      case 'Reports':
        return '📋';
      case 'Alerts':
        return '🚨';
      case 'Settings':
        return '⚙️';
      case 'Subscription':
        return '💎';
      default:
        return '📱';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: iconSize, color: focused ? theme.colors.primary : color }}>
        {getIcon()}
      </Text>
      {focused && (
        <View style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors.primary,
          marginTop: 2,
        }} />
      )}
    </View>
  );
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Harita',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="Map" />
          ),
          tabBarLabel: 'Harita',
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Raporlar',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="Reports" />
          ),
          tabBarLabel: 'Raporlar',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Uyarılar',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="Alerts" />
          ),
          tabBarLabel: 'Uyarılar',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="Settings" />
          ),
          tabBarLabel: 'Ayarlar',
        }}
      />
      <Tab.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: 'Premium',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="Subscription" />
          ),
          tabBarLabel: 'Premium',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;