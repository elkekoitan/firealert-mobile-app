import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { FAB } from 'react-native-paper';
import { MapContainer } from '../../components/Map/MapContainer';
import { useAppSelector } from '../../hooks/redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type MapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>;

export const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [timeRange, setTimeRange] = useState(24); // hours

  const handleReportPress = (report: any) => {
    // Navigate to report detail screen
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  const handleLocationPress = (location: { latitude: number; longitude: number }) => {
    // Navigate to create report screen with pre-selected location
    navigation.navigate('CreateReport', { location });
  };

  const handleCreateReport = () => {
    navigation.navigate('CreateReport');
  };

  const handleTimeRangeChange = (newRange: number) => {
    setTimeRange(newRange);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Map Container */}
      <MapContainer
        showUserLocation={true}
        timeRange={timeRange}
        onReportPress={handleReportPress}
        onLocationPress={handleLocationPress}
      />

      {/* Floating Action Button for creating reports */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateReport}
        color="#FFFFFF"
        size="large"
      />

      {/* Time Range Selector - Bottom Sheet or Modal */}
      {/* This will be implemented as a bottom sheet or modal */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#FF5722',
    elevation: 8,
  },
});