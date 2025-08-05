import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://njyswxeiuyeasdkcusnk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeXN3eGVpdXllYXNka2N1c25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTI0NjUsImV4cCI6MjA2OTk2ODQ2NX0.MO_PuVaTiVm9CqQsdsNiBQg9mb-ialrs3c0aqYW2ElQ'

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