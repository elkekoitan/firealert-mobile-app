import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '../types'
import { useLoginMutation, useRegisterMutation, useGetProfileQuery, useLogoutMutation } from '../api/generated'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch } from 'react-redux'
import { fireAlertApi } from '../api/generated'
import { useGoogleAuth, GoogleSignInResult } from '../services/googleAuth'

interface AuthContextType {
  user: User | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signInWithGoogle: () => Promise<GoogleSignInResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => ({ success: false }),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const { signInWithGoogle: googleSignIn } = useGoogleAuth()
  
  // RTK Query hooks
  const [login] = useLoginMutation()
  const [register] = useRegisterMutation()
  const [logout] = useLogoutMutation()
  const { data: profileData, refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: !session?.access_token
  })

  useEffect(() => {
    // Check for existing session on app startup
    loadStoredSession()
  }, [])

  useEffect(() => {
    // Update user when profile data changes
    if (profileData?.success && profileData.data) {
      const profile = profileData.data
      setUser({
        id: profile.id,
        email: session?.user?.email || '',
        firstName: profile.first_name || undefined,
        lastName: profile.last_name || undefined,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        avatarUrl: profile.avatar_url || undefined,
        reliabilityScore: profile.reliability_score || 50,
        totalReports: profile.total_reports || 0,
        verifiedReports: profile.verified_reports || 0,
        createdAt: profile.created_at,
        isVerified: (profile.reliability_score || 50) >= 70,
      })
    }
  }, [profileData, session])

  const loadStoredSession = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('auth_session')
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession)
        // Check if session is still valid
        const expiresAt = new Date(parsedSession.expires_at || 0)
        if (expiresAt.getTime() > Date.now()) {
          setSession(parsedSession)
        } else {
          // Session expired, clear it
          await AsyncStorage.removeItem('auth_session')
        }
      }
    } catch (error) {
      console.error('Error loading stored session:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSession = async (sessionData: any) => {
    try {
      await AsyncStorage.setItem('auth_session', JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem('auth_session')
      setSession(null)
      setUser(null)
      // Clear RTK Query cache
      dispatch(fireAlertApi.util.resetApiState())
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await login({ email, password }).unwrap()
      if (result.success && result.data) {
        const authData = result.data
        const sessionData = {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          expires_at: new Date(Date.now() + (authData.expires_in * 1000)).toISOString(),
          user: authData.user,
        }
        setSession(sessionData)
        await saveSession(sessionData)
        // Profile will be fetched automatically via useGetProfileQuery
      } else {
        throw new Error('Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.data?.message || 'Login failed')
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const result = await register({
        email,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }).unwrap()
      
      if (result.success && result.data) {
        const authData = result.data
        const sessionData = {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          expires_at: new Date(Date.now() + (authData.expires_in * 1000)).toISOString(),
          user: authData.user,
        }
        setSession(sessionData)
        await saveSession(sessionData)
        // Profile will be fetched automatically via useGetProfileQuery
      } else {
        throw new Error('Registration failed')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.data?.message || 'Registration failed')
    }
  }

  const signOut = async () => {
    try {
      if (session?.access_token) {
        await logout().unwrap()
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with local logout even if API call fails
    } finally {
      await clearSession()
    }
  }

  const refreshProfile = async () => {
    try {
      await refetchProfile()
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    try {
      const result = await googleSignIn()
      
      if (result.success && result.user) {
        // Create a session-like object for Google auth
        const googleSession = {
          access_token: 'google_token', // This would be handled by Supabase
          user: result.user,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }
        
        setSession(googleSession)
        await saveSession(googleSession)
        
        // Set user data
        setUser({
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          name: result.user.name,
          avatarUrl: result.user.avatarUrl,
          reliabilityScore: 50, // Default for new users
          totalReports: 0,
          verifiedReports: 0,
          createdAt: new Date().toISOString(),
          isVerified: false,
        })
      }
      
      return result
    } catch (error: any) {
      console.error('Google Sign-In error:', error)
      return {
        success: false,
        error: error.message || 'Google Sign-In failed'
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}