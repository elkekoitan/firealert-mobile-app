import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useSupabase';
import { formatDate } from '../utils';
import { Ionicons } from '@expo/vector-icons'; // İkonlar için

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, refetch } = useNotifications(user?.id || '');
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Ekran odaklandığında bildirimleri yenile
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.id) {
        refetch();
      }
    });
    return unsubscribe;
  }, [navigation, user?.id, refetch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await refetch();
    }
    setRefreshing(false);
  }, [user?.id, refetch]);

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.read ? styles.readCard : styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {!item.read && (
          <Ionicons name="ellipse" size={10} color={COLORS.primary} style={styles.unreadIndicator} />
        )}
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <Text style={styles.notificationDate}>{formatDate(item.createdAt)}</Text>
      <Text style={styles.notificationType}>Tür: {item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Bildirimler</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={80} color={COLORS.text.disabled} />
          <Text style={styles.emptyStateText}>Henüz hiç bildiriminiz yok.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2, // Adjust for status bar
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    left: SIZES.padding,
    top: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  unreadBadge: {
    position: 'absolute',
    right: SIZES.padding,
    top: SIZES.padding * 2 + 5, // Adjust position
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    minWidth: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: COLORS.background,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyStateText: {
    fontSize: SIZES.h4,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
  listContentContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 4,
  },
  notificationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  readCard: {
    opacity: 0.7,
    backgroundColor: COLORS.surface,
  },
  unreadCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  notificationTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flexShrink: 1,
  },
  unreadIndicator: {
    marginLeft: SIZES.base,
  },
  notificationBody: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    marginBottom: SIZES.base / 2,
  },
  notificationDate: {
    fontSize: SIZES.caption,
    color: COLORS.text.disabled,
    textAlign: 'right',
  },
  notificationType: {
    fontSize: SIZES.caption,
    color: COLORS.text.secondary,
    marginTop: SIZES.base / 2,
  },
});

export default NotificationsScreen;