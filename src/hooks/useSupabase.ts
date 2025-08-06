import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../integrations/supabase/client'
import { FireReport, Notification, SatelliteData, User } from '../types' // User tipini import ettik

export const useFireReports = () => {
  const [reports, setReports] = useState<FireReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fire_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const formattedReports: FireReport[] = data.map(report => ({
        id: report.id,
        userId: report.user_id,
        userName: 'Anonymous User', // Will be populated with user profile
        latitude: report.latitude,
        longitude: report.longitude,
        images: report.images || [],
        description: report.description || '',
        aiAnalysis: {
          confidence: report.ai_confidence || 0,
          detectedElements: report.ai_detected_elements || [],
          riskLevel: report.ai_risk_level || 'LOW',
          isLikelyFire: report.ai_is_likely_fire || false,
        },
        status: report.status || 'PENDING',
        reportedAt: report.reported_at,
        verifiedAt: report.verified_at || undefined,
        emergency112Notified: report.emergency_112_notified || false,
        satelliteData: report.satellite_data as unknown as SatelliteData | undefined, // Fixed type casting
      }))

      setReports(formattedReports)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const createReport = useCallback(async (reportData: Omit<FireReport, 'id' | 'reportedAt' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('fire_reports')
        .insert({
          user_id: reportData.userId,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          images: reportData.images,
          description: reportData.description,
          ai_confidence: reportData.aiAnalysis.confidence,
          ai_detected_elements: reportData.aiAnalysis.detectedElements,
          ai_risk_level: reportData.aiAnalysis.riskLevel,
          ai_is_likely_fire: reportData.aiAnalysis.isLikelyFire,
          emergency_112_notified: reportData.aiAnalysis.riskLevel === 'CRITICAL',
        })
        .select()
        .single()

      if (error) throw error

      const newReport: FireReport = {
        id: data.id,
        userId: data.user_id,
        userName: reportData.userName,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images || [],
        description: data.description || '',
        aiAnalysis: {
          confidence: data.ai_confidence || 0,
          detectedElements: data.ai_detected_elements || [],
          riskLevel: data.ai_risk_level || 'LOW',
          isLikelyFire: data.ai_is_likely_fire || false,
        },
        status: data.status || 'PENDING',
        reportedAt: data.created_at,
        emergency112Notified: data.emergency_112_notified || false,
      }

      setReports(prev => [newReport, ...prev])
      return newReport
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create report')
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return { reports, loading, error, createReport, refetch: fetchReports }
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        type: notification.type as Notification['type'],
        data: notification.data || undefined,
        read: notification.read || false,
        createdAt: notification.created_at,
      }))

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => !n.read).length)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [userId])

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          data: notification.data || null,
        })
        .select()
        .single()

      if (error) throw error

      const newNotification: Notification = {
        id: data.id,
        title: data.title,
        body: data.body,
        type: data.type as Notification['type'],
        data: data.data || undefined,
        read: data.read || false,
        createdAt: data.created_at,
      }

      setNotifications(prev => [newNotification, ...prev])
      if (!newNotification.read) {
        setUnreadCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Error adding notification:', err)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    addNotification,
    refetch: fetchNotifications,
  }
}

// Yeni useUserProfile kancası
export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setProfile({
        id: data.id,
        email: '', // E-posta bilgisi auth.users tablosundan gelir, burada boş bırakıldı
        firstName: data.first_name || undefined,
        lastName: data.last_name || undefined,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        avatarUrl: data.avatar_url || undefined,
        reliabilityScore: data.reliability_score || 50,
        totalReports: data.total_reports || 0,
        verifiedReports: data.verified_reports || 0,
        createdAt: data.created_at,
        isVerified: (data.reliability_score || 50) >= 70,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching profile')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateProfile = useCallback(async (updates: {
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }) => {
    if (!userId) {
      throw new Error('User ID is required to update profile');
    }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      setProfile(prev => {
        if (!prev) return null;
        const updatedUser: User = {
          ...prev,
          firstName: data.first_name || undefined,
          lastName: data.last_name || undefined,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          avatarUrl: data.avatar_url || undefined,
          updatedAt: data.updated_at, // updated_at eklendi
        };
        return updatedUser;
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err;
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, updateProfile, refetchProfile: fetchProfile }
}