import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  AppState,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { CustomButton } from '../../components/common/CustomButton';
import { RiskLevelChip } from '../../components/common/RiskLevelChip';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useErrorHandler } from '../../services/errorHandling';
import { useScreenTracking } from '../../hooks/useScreenTracking';
import { useMemoryManagement, useMemorySafeInterval } from '../../services/memoryManagement';
import { monitoringService } from '../../services/monitoring';
import { RootState } from '../../store';
import { 
  clearReports,
  setSelectedReport 
} from '../../store/slices/reportsSlice';
import { 
  useGetReportsQuery, 
  useGetSatelliteDataQuery 
} from '../../services/apiService';
import { useRealtimeConnection } from '../../services/realtime';
import { theme } from '../../theme/theme';
import type { components } from '../../types/api-types';
import { RiskLevel } from '../../types/enums';
import { ClusteredMapView } from '../../components/Map/ClusteredMapView';

// Simple debounce utility with typed signature
const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Use OpenAPI generated types
type FireReport = components['schemas']['FireReport'];
type OpenAPIRiskLevel = components['schemas']['RiskLevel'];

export const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const net = (useNetworkStatus() as any) || {};
  const isConnected = !!net.isConnected;
  const { handleRTKError, showError } = useErrorHandler();
  const { memoryStats, registerSubscription, unregisterSubscription } = useMemoryManagement();
  const { trackUserAction } = useScreenTracking('MapScreen', {
    customProperties: {
      isConnected,
      timestamp: new Date().toISOString(),
      memoryUsage: memoryStats,
    },
  });
  
  // Optional selects; avoid failures in test environments if slice is undefined
  // const { selectedReport } = useSelector((state: RootState) => (state as any)?.reports || {});
  const { user } = useSelector((state: RootState) => ((state as any)?.auth) || {} as any);
  
  // Realtime connection status
  const { status: realtimeStatus, isConnected: isRealtimeConnected } = useRealtimeConnection();
  
  // Memory-safe performance monitoring
  useMemorySafeInterval(() => {
    if (AppState.currentState === 'active') {
      monitoringService.trackAppPerformance();
    }
  }, 60000); // Every minute

  const [timeFilter, setTimeFilter] = useState<24 | 48 | 72>(24);
  const [riskFilter, setRiskFilter] = useState<OpenAPIRiskLevel | 'ALL'>('ALL');
  const [bbox, setBbox] = useState<number[]>([40.7, -74.0, 40.8, -73.9]); // NYC default

  // RTK Query hooks for data fetching
  const {
    data: reports = [],
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useGetReportsQuery(
    {
      bbox,
      hours: timeFilter,
      riskLevel: riskFilter === 'ALL' ? undefined : riskFilter,
    },
    {
      skip: !isConnected, // Skip if offline
      pollingInterval: 30000, // Poll every 30 seconds when online
    }
  );

  const {
    data: satelliteData = [],
    isLoading: satelliteLoading,
    error: satelliteError,
    refetch: refetchSatellite,
  } = useGetSatelliteDataQuery(
    {
      bbox,
      hours: timeFilter,
    },
    {
      skip: !isConnected,
      pollingInterval: 60000, // Poll every minute
    }
  );

  // Memoized filter application for performance
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    
    return reports.filter(report => {
      if (riskFilter === 'ALL') return true;
      return report.ai_risk_level === riskFilter;
    });
  }, [reports, riskFilter]);

  // Debounced bbox update function for map region changes
  const updateBbox = useMemo(
    () => debounce((newBbox: number[]) => {
      setBbox(newBbox);
    }, 500),
    []
  );

  const isLoading = reportsLoading || satelliteLoading;
  const hasError = reportsError || satelliteError;

  const handleRefresh = useCallback(() => {
    if (!isConnected) {
      const error = handleRTKError({ status: 'FETCH_ERROR', data: 'No internet connection' });
      showError(error);
      return;
    }
    
    // Refetch both reports and satellite data
    refetchReports();
    refetchSatellite();
  }, [isConnected, refetchReports, refetchSatellite, handleRTKError, showError]);

  const handleReportPress = useCallback((report: FireReport) => {
    try {
      // Track user action
      trackUserAction('report_press', 'fire_report', {
        reportId: report.id,
        riskLevel: report.ai_risk_level,
        confidence: report.ai_confidence,
      });
      
      // Convert OpenAPI type to legacy format for compatibility
      const legacyReport: import('../../types').FireReport = {
        id: report.id || '',
        userId: report.user_id || '',
        userName: 'Kullanıcı', // Will be enhanced when user data is available
        description: report.description || '',
        latitude: report.location?.latitude || 0,
        longitude: report.location?.longitude || 0,
        images: report.images || [],
        aiAnalysis: {
          confidence: report.ai_confidence || 0,
          detectedElements: report.ai_detected || [],
          riskLevel: (report.ai_risk_level as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || 'LOW',
          isLikelyFire: (report.ai_confidence || 0) > 70,
        },
        status: report.status as 'PENDING' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED' || 'PENDING',
        reportedAt: report.reported_at || new Date().toISOString(),
        verifiedAt: report.verified_at,
        emergency112Notified: report.emergency112_notified || false,
      };
      
      dispatch(setSelectedReport(legacyReport));
      navigation.navigate('ReportDetail', { id: report.id || '' });
    } catch (error) {
      const appError = handleRTKError(error);
      showError(appError);
    }
  }, [dispatch, navigation, handleRTKError, showError, trackUserAction]);

  const handleCreateReport = useCallback(() => {
    trackUserAction('create_report_press', 'fab_button');
    navigation.navigate('CreateReport');
  }, [navigation, trackUserAction]);

  const handleTimeFilterChange = useCallback((filter: 24 | 48 | 72) => {
    trackUserAction('time_filter_change', 'filter_button', { filter });
    setTimeFilter(filter);
  }, [trackUserAction]);

  const handleRiskFilterChange = useCallback((filter: OpenAPIRiskLevel | 'ALL') => {
    trackUserAction('risk_filter_change', 'filter_button', { filter });
    setRiskFilter(filter);
  }, [trackUserAction]);

  // Handle errors with enhanced error handling
  useEffect(() => {
    if (reportsError) {
      const appError = handleRTKError(reportsError);
      console.error('Reports API Error:', appError);
      // Don't show intrusive dialog for polling errors, just log
      if (appError.code !== 'NETWORK_ERROR') {
        showError(appError);
      }
    }
    if (satelliteError) {
      const appError = handleRTKError(satelliteError);
      console.error('Satellite API Error:', appError);
      // Don't show intrusive dialog for polling errors, just log
      if (appError.code !== 'NETWORK_ERROR') {
        showError(appError);
      }
    }
  }, [reportsError, satelliteError, handleRTKError, showError]);

  const renderReportItem = useCallback(({ item }: { item: FireReport }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => handleReportPress(item)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{item.description || 'Yangın raporu'}</Text>
          <Text style={styles.reportDescription}>
            {item.ai_detected?.join(', ') || 'Yangın raporu'}
          </Text>
          <Text style={styles.reportTime}>
            {item.reported_at ? new Date(item.reported_at).toLocaleString('tr-TR') : 'Tarih bilinmiyor'}
          </Text>
        </View>
        <RiskLevelChip 
          riskLevel={RiskLevel[item.ai_risk_level?.toUpperCase() as keyof typeof RiskLevel] || RiskLevel.LOW} 
        />
      </View>
      
      <View style={styles.reportFooter}>
        <Text style={styles.userName}>
          {item.user_id ? `Kullanıcı: ${item.user_id}` : 'Anonim'}
        </Text>
        <Text style={styles.reliabilityScore}>
          Güven: {item.ai_confidence || 0}%
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleReportPress]);

  const keyExtractor = useCallback((item: FireReport) => item.id || 'unknown', []);

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      
      {/* Header with Realtime Status */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Yangın Haritası</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isRealtimeConnected ? '#4CAF50' : '#FF5722' }
            ]} />
            <Text style={styles.statusText}>
              {isRealtimeConnected ? 'Canlı' : 'Çevrimdışı'}
            </Text>
          </View>
        </View>
        <View style={styles.filters}>
          <View style={styles.timeFilters}>
            {([24, 48, 72] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.timeFilterButton,
                  timeFilter === filter && styles.activeTimeFilter
                ]}
                onPress={() => handleTimeFilterChange(filter)}
              >
                <Text style={[
                  styles.timeFilterText,
                  timeFilter === filter && styles.activeTimeFilterText
                ]}>
                  {filter}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.riskFilters}>
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                testID={`risk-level-chip-${filter}`}
                style={[
                  styles.riskFilterButton,
                  riskFilter === filter && styles.activeRiskFilter
                ]}
                onPress={() => handleRiskFilterChange(filter)}
              >
                {filter === 'ALL' ? (
                  <Text style={[
                    styles.riskFilterText,
                    riskFilter === filter && styles.activeRiskFilterText
                  ]}>Tümü</Text>
                ) : (
                  <RiskLevelChip 
                    riskLevel={RiskLevel[filter as keyof typeof RiskLevel]} 
                    size="small"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Map Area with Real Clustering */}
      <View style={styles.mapContainer}>
        <ClusteredMapView
          reports={filteredReports}
          satelliteData={satelliteData}
          onRegionChange={updateBbox}
          onReportPress={handleReportPress}
          loading={isLoading}
        />
        
        <CustomButton
          title="Yangın Raporu Oluştur"
          onPress={handleCreateReport}
          style={styles.createReportButton}
          icon="plus"
        />
      </View>

      {/* Reports List */}
      <View style={styles.reportsContainer}>
        <View style={styles.reportsHeader}>
          <Text style={styles.reportsTitle}>Yangın Raporları</Text>
          <Text style={styles.reportsCount}>
            {filteredReports.length} rapor {satelliteData.length > 0 && ` | ${satelliteData.length} uydu noktası`}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <Text style={styles.loadingText}>
              {reportsLoading ? 'Raporlar yükleniyor...' : 'Uydu verileri yükleniyor...'}
            </Text>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Veriler yüklenirken hata oluştu
            </Text>
            <CustomButton
              title="Tekrar Dene"
              onPress={handleRefresh}
              style={styles.retryButton}
            />
          </View>
        ) : (
          <FlatList
            testID="reports-list"
            data={filteredReports}
            renderItem={renderReportItem}
            keyExtractor={keyExtractor}
            onRefresh={handleRefresh}
            refreshing={isLoading}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            contentContainerStyle={styles.reportsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isConnected 
                    ? 'Bu bölgede rapor bulunamadı' 
                    : 'Bağlantı olmadığında veriler gösterilemiyor'
                  }
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        testID="fab-button"
        style={styles.fab}
        onPress={handleCreateReport}
      >
        <View style={styles.fabButton}>
          <Text style={styles.fabIcon}>+</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  filters: {
    gap: theme.spacing.md,
  },
  timeFilters: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  timeFilterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  activeTimeFilter: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeFilterText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTimeFilterText: {
    color: theme.colors.onPrimary,
  },
  riskFilters: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  riskFilterButton: {
    padding: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
  },
  activeRiskFilter: {
    backgroundColor: theme.colors.primaryContainer,
  },
  riskFilterText: {
    color: theme.colors.onSurface,
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  activeRiskFilterText: {
    color: theme.colors.onPrimaryContainer,
  },
  mapContainer: {
    height: 300,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  createReportButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  reportsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  reportsCount: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  reportsList: {
    padding: theme.spacing.lg,
  },
  reportItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  reportInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  reportDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  reportTime: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  userName: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  reliabilityScore: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    marginTop: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    fontSize: 24,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});
