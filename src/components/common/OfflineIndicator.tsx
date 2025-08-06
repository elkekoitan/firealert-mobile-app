import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineService } from '../../services/offline';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

interface OfflineIndicatorProps {
  style?: any;
  onRetry?: () => void;
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  style,
  onRetry,
  showDetails = false,
}) => {
  const { isConnected } = useNetworkStatus();
  const { getQueueStatus } = useOfflineService();
  const [isExpanded, setIsExpanded] = useState(false);
  const [queueStatus, setQueueStatus] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });

  // Animate the indicator
  const [animatedValue] = useState(new Animated.Value(0));

  // Update queue status
  useEffect(() => {
    const updateQueueStatus = () => {
      const status = getQueueStatus();
      setQueueStatus(status);
    };

    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 2000);
    return () => clearInterval(interval);
  }, [getQueueStatus]);

  // Animate when offline
  useEffect(() => {
    if (!isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [isConnected, animatedValue]);

  // Get status color
  const getStatusColor = () => {
    if (!isConnected) return '#F44336';
    if (queueStatus.failed > 0) return '#FF9800';
    if (queueStatus.pending > 0) return '#2196F3';
    return '#4CAF50';
  };

  // Get status text
  const getStatusText = () => {
    if (!isConnected) return 'Çevrimdışı';
    if (queueStatus.failed > 0) return `${queueStatus.failed} başarısız`;
    if (queueStatus.pending > 0) return `${queueStatus.pending} bekliyor`;
    if (queueStatus.processing > 0) return `${queueStatus.processing} işleniyor`;
    return 'Çevrimiçi';
  };

  // Get status icon
  const getStatusIcon = (): IconSource => {
    if (!isConnected) return 'wifi-off';
    if (queueStatus.failed > 0) return 'alert-circle';
    if (queueStatus.pending > 0) return 'sync';
    if (queueStatus.processing > 0) return 'loading';
    return 'wifi';
  };

  // Handle retry
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Handle expand/collapse
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const indicatorStyle = {
    backgroundColor: getStatusColor(),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, style]} testID="offline-indicator">
      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {/* Details panel */}
      {showDetails && isExpanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Toplam:</Text>
            <Text style={styles.detailsValue}>{queueStatus.total}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Bekliyor:</Text>
            <Text style={styles.detailsValue}>{queueStatus.pending}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>İşleniyor:</Text>
            <Text style={styles.detailsValue}>{queueStatus.processing}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Başarısız:</Text>
            <Text style={styles.detailsValue}>{queueStatus.failed}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Tamamlandı:</Text>
            <Text style={styles.detailsValue}>{queueStatus.completed}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            {queueStatus.failed > 0 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRetry}
              >
                <Text style={styles.actionButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleExpand}
            >
              <Text style={styles.actionButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Expand/collapse button */}
      {!showDetails && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={handleToggleExpand}
        >
          <Text style={styles.expandButtonText}>Detaylar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 1000,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    minWidth: 80,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  expandButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  expandButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

// Alternative compact version
export const CompactOfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  style,
  onRetry,
}) => {
  const { isConnected } = useNetworkStatus();
  const { getQueueStatus } = useOfflineService();
  const [queueStatus, setQueueStatus] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });

  // Update queue status
  useEffect(() => {
    const updateQueueStatus = () => {
      const status = getQueueStatus();
      setQueueStatus(status);
    };

    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 2000);
    return () => clearInterval(interval);
  }, [getQueueStatus]);

  if (isConnected && queueStatus.pending === 0 && queueStatus.failed === 0) {
    return null;
  }

  return (
    <View style={[styles.compactContainer, style]}>
      <View style={styles.compactStatusContainer}>
        <View
          style={[
            styles.compactIndicator,
            {
              backgroundColor: !isConnected
                ? '#F44336'
                : queueStatus.failed > 0
                ? '#FF9800'
                : '#2196F3',
            },
          ]}
        />
        <Text style={styles.compactStatusText}>
          {!isConnected
            ? 'Çevrimdışı'
            : queueStatus.failed > 0
            ? `${queueStatus.failed} hata`
            : `${queueStatus.pending} bekliyor`}
        </Text>
      </View>
      {queueStatus.failed > 0 && (
        <TouchableOpacity style={styles.compactRetryButton} onPress={onRetry}>
          <Text style={styles.compactRetryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const compactStyles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
  },
  compactStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  compactIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  compactStatusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  compactRetryButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  compactRetryButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
