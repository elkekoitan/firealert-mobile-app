import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFireReports } from '../hooks/useSupabase';
import { FireReport } from '../types';
import { formatDate, calculateDistance } from '../utils';

const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { reports, loading, error, refetch } = useFireReports();
  const [refreshing, setRefreshing] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Çıkış yaparken bir hata oluştu.');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Default region for the map (e.g., Ankara, Turkey)
  const initialRegion = {
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 2,
    longitudeDelta: 2,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hoş Geldiniz, {user?.name || user?.email}!</Text>
        <Button title="Çıkış Yap" onPress={handleSignOut} color={COLORS.error} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yangın Haritası</Text>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
          >
            {reports.map((report: FireReport) => (
              <Marker
                key={report.id}
                coordinate={{ latitude: report.latitude, longitude: report.longitude }}
                title={`Risk: ${report.aiAnalysis.riskLevel}`}
                description={`Raporlayan: ${report.userName || 'Anonim'} - ${formatDate(report.reportedAt)}`}
                pinColor={
                  report.aiAnalysis.riskLevel === 'CRITICAL' ? COLORS.fire.critical :
                  report.aiAnalysis.riskLevel === 'HIGH' ? COLORS.fire.high :
                  report.aiAnalysis.riskLevel === 'MEDIUM' ? COLORS.fire.medium :
                  COLORS.fire.low
                }
              />
            ))}
          </MapView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Yangın Raporları</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : error ? (
            <Text style={styles.errorText}>Raporlar yüklenirken bir hata oluştu: {error}</Text>
          ) : reports.length === 0 ? (
            <Text style={styles.noReportsText}>Henüz yangın raporu bulunmamaktadır.</Text>
          ) : (
            reports.map((report: FireReport) => (
              <View key={report.id} style={styles.reportCard}>
                <Text style={styles.reportTitle}>Rapor ID: {report.id.substring(0, 8)}...</Text>
                <Text style={styles.reportDetail}>Risk Seviyesi: <Text style={{ color: report.aiAnalysis.riskLevel === 'CRITICAL' ? COLORS.fire.critical : COLORS.fire.medium }}>{report.aiAnalysis.riskLevel}</Text></Text>
                <Text style={styles.reportDetail}>Açıklama: {report.description || 'Açıklama yok'}</Text>
                <Text style={styles.reportDetail}>Konum: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</Text>
                <Text style={styles.reportDetail}>Raporlayan: {report.userName || 'Anonim'}</Text>
                <Text style={styles.reportDetail}>Rapor Tarihi: {formatDate(report.reportedAt)}</Text>
                <Text style={styles.reportDetail}>Durum: {report.status}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.navigationButtons}>
          <Button title="Yangın Raporla" onPress={() => navigation.navigate('Report')} color={COLORS.primary} />
          <View style={{ marginVertical: SIZES.base }} />
          <Button title="Bildirimler" onPress={() => navigation.navigate('Notifications')} color={COLORS.secondary} />
          <View style={{ marginVertical: SIZES.base }} />
          <Button title="Profilim" onPress={() => navigation.navigate('Profile')} color={COLORS.info} />
          <View style={{ marginVertical: SIZES.base }} />
          <Button title="Ayarlar" onPress={() => navigation.navigate('Settings')} color={COLORS.text.secondary} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2, // Adjust for status bar
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  welcomeText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flexShrink: 1,
    marginRight: SIZES.base,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 4,
  },
  section: {
    marginBottom: SIZES.padding * 2,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    color: COLORS.text.primary,
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: SIZES.radius / 2,
    marginBottom: SIZES.base,
  },
  reportCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  reportTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.base / 2,
  },
  reportDetail: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    marginBottom: SIZES.base / 4,
  },
  noReportsText: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingVertical: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.body,
    color: COLORS.error,
    textAlign: 'center',
    paddingVertical: SIZES.padding,
  },
  navigationButtons: {
    marginTop: SIZES.padding,
  },
});

export default HomeScreen;