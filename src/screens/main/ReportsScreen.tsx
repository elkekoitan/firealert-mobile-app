import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
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
  fetchReports, 
  clearReports,
  setSelectedReport 
} from '../../store/slices/reportsSlice';
import { 
  useGetReportsQuery,
  useGetMyReportsQuery 
} from '../../api/generated';
import { RiskLevel } from '../../types/enums';
import { theme } from '../../theme/theme';

interface Report {
  id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  imageUrl?: string;
  user: {
    name: string;
    reliabilityScore: number;
  };
  status: 'pending' | 'verified' | 'rejected';
}

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isConnected } = useNetworkStatus();
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'my' | 'nearby'>('all');
  const [timeFilter, setTimeFilter] = useState<'24h' | '48h' | '72h'>('24h');

  // Determine time filter hours for API
  const timeFilterHours = timeFilter === '24h' ? 24 : timeFilter === '48h' ? 48 : 72;

  // API queries based on selected tab
  const { 
    data: allReportsData, 
    isLoading: allReportsLoading, 
    error: allReportsError,
    refetch: refetchAllReports 
  } = useGetReportsQuery(
    { 
      limit: 50 
    },
    { skip: selectedTab !== 'all' }
  );

  const { 
    data: myReportsData, 
    isLoading: myReportsLoading, 
    error: myReportsError,
    refetch: refetchMyReports 
  } = useGetMyReportsQuery(
    { limit: 50 },
    { skip: selectedTab !== 'my' }
  );

  // For nearby reports, we'll use the same endpoint but filter by location later
  const { 
    data: nearbyReportsData, 
    isLoading: nearbyReportsLoading, 
    error: nearbyReportsError,
    refetch: refetchNearbyReports 
  } = useGetReportsQuery(
    { 
      limit: 50
      // TODO: Add bbox parameter based on user location
    },
    { skip: selectedTab !== 'nearby' }
  );

  // Select the appropriate data based on current tab
  const getCurrentData = () => {
    switch (selectedTab) {
      case 'all':
        return {
          data: allReportsData,
          isLoading: allReportsLoading,
          error: allReportsError,
          refetch: refetchAllReports
        };
      case 'my':
        return {
          data: myReportsData,
          isLoading: myReportsLoading,
          error: myReportsError,
          refetch: refetchMyReports
        };
      case 'nearby':
        return {
          data: nearbyReportsData,
          isLoading: nearbyReportsLoading,
          error: nearbyReportsError,
          refetch: refetchNearbyReports
        };
      default:
        return {
          data: undefined,
          isLoading: false,
          error: null,
          refetch: () => {}
        };
    }
  };

  const { data: currentData, isLoading, error, refetch } = getCurrentData();
  
  // Transform API data to our Report interface
  const transformReport = (apiReport: any): Report => ({
    id: apiReport.id,
    title: `${apiReport.severity?.toUpperCase() || 'YANGIN'} - ${apiReport.latitude?.toFixed(4)}, ${apiReport.longitude?.toFixed(4)}`,
    description: apiReport.description || 'Açıklama yok',
    location: {
      latitude: apiReport.latitude,
      longitude: apiReport.longitude,
    },
    riskLevel: apiReport.severity?.toLowerCase() || 'medium',
    createdAt: apiReport.created_at,
    imageUrl: apiReport.image_urls?.[0] || undefined,
    user: {
      name: 'Anonim Kullanıcı', // Will be enhanced when user data is available
      reliabilityScore: apiReport.confidence_score || 50,
    },
    status: apiReport.status?.toLowerCase() || 'pending',
  });

  // Get reports from API data
  const reports = (currentData?.data?.reports || []).map(transformReport);

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const loadReports = useCallback(async () => {
    if (!isConnected) {
      RNAlert.alert('Bağlantı Hatası', 'İnternet bağlantınızı kontrol edin');
      return;
    }

    try {
      await refetch();
    } catch (error) {
      console.error('Error loading reports:', error);
      RNAlert.alert('Hata', 'Raporlar yüklenirken bir hata oluştu');
    }
  }, [isConnected, refetch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports().finally(() => setRefreshing(false));
  }, [loadReports]);

  const handleReportPress = (report: Report) => {
    dispatch(setSelectedReport(report));
    navigation.navigate('ReportDetail' as never);
  };

  const handleCreateReport = () => {
    navigation.navigate('CreateReport');
  };

  const handleTabChange = (tab: 'all' | 'my' | 'nearby') => {
    setSelectedTab(tab);
    // The data will be automatically refetched by the appropriate query hook
  };

  const handleTimeFilterChange = (filter: '24h' | '48h' | '72h') => {
    setTimeFilter(filter);
    // The data will be automatically refetched by the query hooks
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'verified':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.primary;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'verified':
        return 'Doğrulandı';
      case 'pending':
        return 'Bekliyor';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => handleReportPress(item)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <View style={styles.reportTitleRow}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <RiskLevelChip riskLevel={RiskLevel[item.riskLevel.toUpperCase() as keyof typeof RiskLevel]} />
          </View>
          <Text style={styles.reportDescription}>{item.description}</Text>
          <Text style={styles.reportTime}>
            {new Date(item.createdAt).toLocaleString('tr-TR')}
          </Text>
        </View>
      </View>
      
      <View style={styles.reportFooter}>
        <View style={styles.reportMeta}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.reliabilityScore}>
            Güvenilirlik: {item.user.reliabilityScore}%
          </Text>
        </View>
        
        <View style={styles.reportStatus}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Yangın Raporları</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rapor ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        
        {/* Tabs */}
        <View style={styles.tabs}>
          {(['all', 'my', 'nearby'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.activeTab
              ]}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText
              ]}>
                {tab === 'all' ? 'Tümü' : tab === 'my' ? 'Benim' : 'Yakın'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Time Filter */}
        <View style={styles.timeFilters}>
          {(['24h', '48h', '72h'] as const).map((filter) => (
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
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reports List */}
      <View style={styles.reportsContainer}>
        <View style={styles.reportsHeader}>
          <Text style={styles.reportsTitle}>
            {selectedTab === 'all' ? 'Tüm Raporlar' : 
             selectedTab === 'my' ? 'Benim Raporlarım' : 'Yakın Raporlar'}
          </Text>
          <Text style={styles.reportsCount}>
            {filteredReports.length} rapor
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <Text style={styles.loadingText}>Raporlar yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredReports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            contentContainerStyle={styles.reportsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Rapor bulunamadı</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
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
    borderBottomColor: theme.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.onPrimary,
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
    borderColor: theme.colors.primary,
  },
  activeTimeFilter: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeFilterText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTimeFilterText: {
    color: theme.colors.onPrimary,
  },
  reportsContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  reportsCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  reportsList: {
    gap: theme.spacing.md,
  },
  reportItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reportHeader: {
    marginBottom: theme.spacing.sm,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  reportDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  reportTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary,
  },
  reportMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  reliabilityScore: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reportStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.colors.primary,
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