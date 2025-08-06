import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { CustomButton } from '../../components/common/CustomButton';
import { RiskLevelChip } from '../../components/common/RiskLevelChip';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { RootState } from '../../store';
import { 
  fetchAlerts, 
  clearAlerts,
  markAlertAsRead,
  setSelectedAlert 
} from '../../store/slices/notificationsSlice';
import { 
  useGetAlertsQuery,
  useGetNotificationsQuery 
} from '../../api/generated';
import { RiskLevel } from '../../types/enums';
import { theme } from '../../theme/theme';

interface Alert {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  reportId?: string;
  type: 'new_report' | 'report_verified' | 'critical_alert' | 'system';
}

export const AlertsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isConnected } = useNetworkStatus();
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'critical'>('all');

  // API queries for alerts and notifications
  const { 
    data: alertsData, 
    isLoading: alertsLoading, 
    error: alertsError,
    refetch: refetchAlerts 
  } = useGetAlertsQuery(
    undefined,
    { skip: false }
  );

  const { 
    data: notificationsData, 
    isLoading: notificationsLoading, 
    error: notificationsError,
    refetch: refetchNotifications 
  } = useGetNotificationsQuery(
    undefined,
    { skip: false }
  );

  const isLoading = alertsLoading || notificationsLoading;
  const error = alertsError || notificationsError;

  // Transform API data to our Alert interface
  const transformAlert = (apiAlert: any): Alert => ({
    id: apiAlert.id || Math.random().toString(),
    title: apiAlert.title || `${apiAlert.severity?.toUpperCase() || 'YANGIN'} Uyarısı`,
    description: apiAlert.description || apiAlert.message || 'Yeni yangın tespit edildi',
    riskLevel: apiAlert.severity?.toLowerCase() || 'medium',
    createdAt: apiAlert.created_at || new Date().toISOString(),
    isRead: apiAlert.is_read || false,
    location: apiAlert.latitude && apiAlert.longitude ? {
      latitude: apiAlert.latitude,
      longitude: apiAlert.longitude,
    } : undefined,
    reportId: apiAlert.fire_report_id || apiAlert.report_id,
    type: apiAlert.type || 'critical_alert',
  });

  // Combine alerts and notifications
  const allAlerts: Alert[] = [
    ...(alertsData ? (Array.isArray(alertsData) ? alertsData : [alertsData]).map(transformAlert) : []),
    ...(notificationsData ? (Array.isArray(notificationsData) ? notificationsData : [notificationsData]).map(transformAlert) : [])
  ];

  const filteredAlerts = allAlerts.filter(alert => {
    if (selectedFilter === 'unread') return !alert.isRead;
    if (selectedFilter === 'critical') return alert.riskLevel === 'critical';
    return true;
  });

  const loadAlerts = useCallback(async () => {
    if (!isConnected) {
      RNAlert.alert('Bağlantı Hatası', 'İnternet bağlantınızı kontrol edin');
      return;
    }

    try {
      await Promise.all([refetchAlerts(), refetchNotifications()]);
    } catch (error) {
      console.error('Error loading alerts:', error);
      RNAlert.alert('Hata', 'Uyarılar yüklenirken bir hata oluştu');
    }
  }, [isConnected, refetchAlerts, refetchNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlerts().finally(() => setRefreshing(false));
  }, [loadAlerts]);

  const handleAlertPress = (alert: Alert) => {
    // Mark as read
    dispatch(markAlertAsRead(alert.id));
    
    // Navigate to report detail if available
    if (alert.reportId) {
      dispatch(setSelectedAlert(alert));
      navigation.navigate('ReportDetail' as never);
    } else {
      dispatch(setSelectedAlert(alert));
      navigation.navigate('AlertDetail' as never);
    }
  };

  const handleFilterChange = (filter: 'all' | 'unread' | 'critical') => {
    setSelectedFilter(filter);
  };

  const getUnreadCount = () => {
    return allAlerts.filter(alert => !alert.isRead).length;
  };

  const getAlertTypeText = (type: Alert['type']) => {
    switch (type) {
      case 'new_report':
        return 'Yeni Rapor';
      case 'report_verified':
        return 'Doğrulandı';
      case 'critical_alert':
        return 'Kritik Uyarı';
      case 'system':
        return 'Sistem';
      default:
        return type;
    }
  };

  const getAlertTypeColor = (type: Alert['type']) => {
    switch (type) {
      case 'new_report':
        return theme.colors.primary;
      case 'report_verified':
        return theme.colors.primary;
      case 'critical_alert':
        return theme.colors.error;
      case 'system':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <TouchableOpacity
      style={[
        styles.alertItem,
        !item.isRead && styles.unreadAlertItem
      ]}
      onPress={() => handleAlertPress(item)}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={styles.alertTitleRow}>
            <Text style={[
              styles.alertTitle,
              !item.isRead && styles.unreadAlertTitle
            ]}>
              {item.title}
            </Text>
            <RiskLevelChip riskLevel={RiskLevel[item.riskLevel.toUpperCase() as keyof typeof RiskLevel]} />
          </View>
          
          <View style={styles.alertMeta}>
            <Text style={[
              styles.alertType,
              { color: getAlertTypeColor(item.type) }
            ]}>
              {getAlertTypeText(item.type)}
            </Text>
            <Text style={styles.alertTime}>
              {new Date(item.createdAt).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>
        
        {!item.isRead && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
      
      <Text style={[
        styles.alertDescription,
        !item.isRead && styles.unreadAlertDescription
      ]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Uyarılar</Text>
          {getUnreadCount() > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {getUnreadCount()}
              </Text>
            </View>
          )}
        </View>
        
        {/* Filters */}
        <View style={styles.filters}>
          {(['all', 'unread', 'critical'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilter
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText
              ]}>
                {filter === 'all' ? 'Tümü' : 
                 filter === 'unread' ? 'Okunmamış' : 'Kritik'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Alerts List */}
      <View style={styles.alertsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <Text style={styles.loadingText}>Uyarılar yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAlerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            contentContainerStyle={styles.alertsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedFilter === 'all' ? 'Uyarı bulunamadı' : 
                   selectedFilter === 'unread' ? 'Okunmamış uyarı yok' : 
                   'Kritik uyarı yok'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button for Test Alert */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          const testAlert: Alert = {
            id: Date.now().toString(),
            title: 'Test Uyarısı',
            description: 'Bu bir test uyarısıdır',
            riskLevel: 'medium',
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'new_report',
          };
          dispatch({ type: 'notifications/alertAdded', payload: testAlert });
        }}
      >
        <View style={styles.fabButton}>
          <Text style={styles.fabIcon}>!</Text>
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
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  unreadBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
  },
  unreadBadgeText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: theme.colors.onPrimary,
  },
  alertsContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  alertsList: {
    gap: theme.spacing.md,
  },
  alertItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unreadAlertItem: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  unreadAlertTitle: {
    color: theme.colors.primary,
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertType: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  alertDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  unreadAlertDescription: {
    color: theme.colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});