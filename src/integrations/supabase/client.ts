import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://hddwvgvoqxgbtajwhvqqs.supabase.co'
const supabaseAnonKey = 'eyJhbaGciOiJIUzI1NiIsInR5cCI6IlkpXVCJ9.eyJpc3MiOiJzdXBhaYmFzZSIsInJlZiI6ImhkZHd2rZ3ZxeGdidGFqd2h2cXFzIiwidcm9sZSI6ImFub24iLCJpYXQiaOjE3NTQ0Nzc0NTIsImV4cCI6 MjA3MDA1MzQ1Mn0.mODUafESs0VmAhdPXKPTeGt2JspWOeHKxoj79zXl1zERE'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      async getItem(key: string) {
        const { SecureStore } = require('expo-secure-store')
        return await SecureStore.getItemAsync(key)
      },
      async setItem(key: string, value: string) {
        const { SecureStore } = require('expo-secure-store')
        await SecureStore.setItemAsync(key, value)
      },
      async removeItem(key: string) {
        const { SecureStore } = require('expo-secure-store')
        await SecureStore.deleteItemAsync(key)
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})