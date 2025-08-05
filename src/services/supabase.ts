import { supabase } from '../integrations/supabase/client'
import { FireReport, Notification, User } from '../types'

export class SupabaseService {
  // Fire Reports
  static async getFireReports(limit = 100) {
    const { data, error } = await supabase
      .from('fire_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  static async getUserFireReports(userId: string) {
    const { data, error } = await supabase
      .from('fire_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async createFireReport(report: {
    userId: string
    latitude: number
    longitude: number
    images: string[]
    description: string
    aiAnalysis: {
      confidence: number
      detectedElements: string[]
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      isLikelyFire: boolean
    }
  }) {
    const { data, error } = await supabase
      .from('fire_reports')
      .insert({
        user_id: report.userId,
        latitude: report.latitude,
        longitude: report.longitude,
        images: report.images,
        description: report.description,
        ai_confidence: report.aiAnalysis.confidence,
        ai_detected_elements: report.aiAnalysis.detectedElements,
        ai_risk_level: report.aiAnalysis.riskLevel,
        ai_is_likely_fire: report.aiAnalysis.isLikelyFire,
        emergency_112_notified: report.aiAnalysis.riskLevel === 'CRITICAL',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateFireReportStatus(reportId: string, status: string) {
    const { data, error } = await supabase
      .from('fire_reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // User Profiles
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  static async updateUserProfile(userId: string, updates: {
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }) {
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
    return data
  }

  static async updateUserReliability(userId: string, score: number, verifiedReports: number) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        reliability_score: score,
        verified_reports: verifiedReports,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Notifications
  static async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async createNotification(notification: {
    userId: string
    title: string
    body: string
    type: 'FIRE_ALERT' | 'VERIFICATION' | 'EMERGENCY' | 'SYSTEM'
    data?: any
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        data: notification.data || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async markNotificationAsRead(notificationId: string, userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUnreadNotificationCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  }

  // Real-time subscriptions
  static subscribeToFireReports(callback: (payload: any) => void) {
    return supabase
      .channel('fire-reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'fire_reports' },
        callback
      )
      .subscribe()
  }

  static subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe()
  }
}