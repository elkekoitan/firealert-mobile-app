import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, Dimensions, PermissionsAndroid, Text } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

// Import types
import { FireReport } from '../../types';

// Import hooks
import { useAppSelector } from '../../hooks/redux';
import { useGetReportsQuery, useGetSatelliteDataQuery } from '../../store/services/api';

// Import components
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CustomButton } from '../common/CustomButton';
import { RiskLevelChip } from '../common/RiskLevelChip';

interface MapContainerProps {
  reports?: FireReport[];
  onReportPress?: (report: FireReport) => void;
  onLocationPress?: (location: { latitude: number; longitude: number }) => void;
  showUserLocation?: boolean;
  timeRange?: number; // hours
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MapContainer: React.FC<MapContainerProps> = ({
  reports: propReports,
  onReportPress,
  onLocationPress,
  showUserLocation = true,
  timeRange = 24,
}) => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [region, setRegion] = useState({
    latitude: 39.9334, // Turkey center
    longitude: 32.8597,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  // API queries
  const { 
    data: reports = [], 
    error: reportsError, 
    isLoading: reportsLoading,
    refetch: refetchReports 
  } = useGetReportsQuery({
    bbox: `${region.longitude - region.longitudeDelta / 2},${region.latitude - region.latitudeDelta / 2},${region.longitude + region.longitudeDelta / 2},${region.latitude + region.latitudeDelta / 2}`,
    hours: timeRange,
  }, { skip: !isAuthenticated });

  const { 
    data: satelliteData = [], 
    error: satelliteError, 
    isLoading: satelliteLoading 
  } = useGetSatelliteDataQuery({
    bbox: `${region.longitude - region.longitudeDelta / 2},${region.latitude - region.latitudeDelta / 2},${region.longitude + region.longitudeDelta / 2},${region.latitude + region.latitudeDelta / 2}`,
    hours: timeRange,
  }, { skip: !isAuthenticated });

  // Use prop reports if provided, otherwise use API data
  const reportsToDisplay = propReports || reports;

  // Request location permission
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Konum İzni',
            message: 'Haritada konumunuzu göstermek için konum izni gerekli',
            buttonNeutral: 'Daha Sonra',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasLocationPermission(true);
          getUserLocation();
        } else {
          console.log('Konum izni verildi');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();
  }, []);

  // Get user location
  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Update region to center on user location
      setRegion(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    } catch (error) {
      console.error('Konum alınamadı:', error);
    }
  };

  // Handle map region change
  const handleRegionChange = (newRegion: any) => {
    setRegion(newRegion);
  };

  // Handle map region change complete
  const handleRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
    // Refetch reports when region changes significantly
    refetchReports();
  };

  // Handle marker press
  const handleMarkerPress = (report: FireReport) => {
    if (onReportPress) {
      onReportPress(report);
    }
  };

  // Handle map press
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (onLocationPress) {
      onLocationPress(coordinate);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get marker color based on risk level
  const getMarkerColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return '#4CAF50';
      case 'MEDIUM': return '#FF9800';
      case 'HIGH': return '#FF5722';
      case 'CRITICAL': return '#D32F2F';
      default: return '#757575';
    }
  };

  // Custom marker component
  const CustomMarker = ({ report }: { report: FireReport }) => {
    const distance = userLocation ? 
      calculateDistance(
        userLocation.latitude, 
        userLocation.longitude, 
        report.latitude, 
        report.longitude
      ) : 0;

    return (
      <Marker
        coordinate={{
          latitude: report.latitude,
          longitude: report.longitude,
        }}
        pinColor={getMarkerColor(report.aiAnalysis.riskLevel)}
        onPress={() => handleMarkerPress(report)}
      >
        <Callout
          tooltip={true}
          style={styles.callout}
        >
          <View style={styles.calloutContent}>
            <RiskLevelChip riskLevel={report.aiAnalysis.riskLevel} />
            <View style={styles.calloutText}>
              <Text variant="bodyMedium" style={styles.calloutTitle}>
                Yangın Raporu
              </Text>
              <Text variant="bodySmall" style={styles.calloutDescription}>
                {report.description}
              </Text>
              <Text variant="bodySmall" style={styles.calloutMeta}>
                {new Date(report.reportedAt).toLocaleDateString('tr-TR')}
              </Text>
              {distance > 0 && (
                <Text variant="bodySmall" style={styles.calloutDistance}>
                  {distance.toFixed(1)} km uzaklıkta
                </Text>
              )}
            </View>
          </View>
        </Callout>
      </Marker>
    );
  };

  // Loading state
  if (reportsLoading || satelliteLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Harita yükleniyor..." />
      </View>
    );
  }

  // Error state
  if (reportsError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Raporlar yüklenemedi</Text>
        <CustomButton
          title="Tekrar Dene"
          onPress={() => refetchReports()}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={region}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleMapPress}
          showsUserLocation={showUserLocation && hasLocationPermission}
          showsMyLocationButton={showUserLocation && hasLocationPermission}
          followsUserLocation={showUserLocation && hasLocationPermission}
          showsCompass={true}
          showsScale={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          {/* User location marker */}
          {userLocation && hasLocationPermission && (
            <Marker
              coordinate={userLocation}
              pinColor="#2196F3"
              title="Konumunuz"
            />
          )}

          {/* Fire report markers */}
          {reportsToDisplay.map((report) => (
            <CustomMarker key={report.id} report={report} />
          ))}

          {/* Satellite data markers (if available) */}
          {satelliteData.map((satelliteReport, index) => (
            <Marker
              key={`satellite-${index}`}
              coordinate={{
                latitude: satelliteReport.latitude,
                longitude: satelliteReport.longitude,
              }}
              pinColor="#9C27B0"
              title="Uydu Verisi"
            />
          ))}
        </MapView>

        {/* Time range selector */}
        <View style={styles.timeRangeSelector}>
          <CustomButton
            title="24h"
            onPress={() => {/* Implement time range change */}}
            variant="secondary"
            size="small"
          />
          <CustomButton
            title="48h"
            onPress={() => {/* Implement time range change */}}
            variant="secondary"
            size="small"
          />
          <CustomButton
            title="72h"
            onPress={() => {/* Implement time range change */}}
            variant="secondary"
            size="small"
          />
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: screenWidth,
    height: screenHeight,
  },
  callout: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  calloutText: {
    flex: 1,
    marginLeft: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDescription: {
    color: '#666',
    marginBottom: 4,
  },
  calloutMeta: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  calloutDistance: {
    color: '#2196F3',
    fontSize: 12,
  },
  timeRangeSelector: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#f44336',
    marginBottom: 16,
  },
});