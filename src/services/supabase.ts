// Fixed TypeScript compile-time errors
import { supabase } from '../integrations/supabase/client'

export const updateFireReportStatus = async (reportId: string, status: 'PENDING' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED') => {
  const { data, error } = await supabase
    .from('fire_reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .select()
    .single()

  if (error) throw error
  return data
}