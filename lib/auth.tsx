'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { FacilityUser } from '@/types'
import { getFacilityUserByAuthId, createFacilityUser } from './database'

interface AuthContextType {
  user: User | null
  facilityUser: FacilityUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: {
    firstName: string
    lastName: string
    userType?: 'renter' | 'owner'
    city?: string
    state?: string
    zipCode?: string
  }) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshFacilityUser: () => Promise<void>
  prefetchAdminData: () => Promise<void> // New function to prefetch admin data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [facilityUser, setFacilityUser] = useState<FacilityUser | null>(null)
  const [loading, setLoading] = useState(true)
  const hasCheckedInitialSession = useRef(false)
  const currentUserRef = useRef<User | null>(null)

  useEffect(() => {
    // Check if we just signed out (from URL parameter)
    const urlParams = new URLSearchParams(window.location.search)
    const justSignedOut = urlParams.get('signed_out') === 'true'

    if (justSignedOut) {
      console.log('Detected signout from URL parameter, ensuring clean state...')
      // Force clear all auth-related storage
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()

      setUser(null)
      setFacilityUser(null)
      setLoading(false)

      // Clean up the URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
      return
    }

    // Only check initial session once when the auth provider mounts
    const checkInitialSession = async () => {
      if (hasCheckedInitialSession.current) return
      hasCheckedInitialSession.current = true
      
      console.log('Checking initial session...')

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session result:', session?.user?.id || 'no session', error?.message || 'no error')

        if (error) {
          console.error('Session check error:', error)
          setUser(null)
          setFacilityUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('Valid session found, loading user data...')
          setUser(session.user)
          currentUserRef.current = session.user
          await loadFacilityUser(session.user.id)
        } else {
          console.log('No valid session found')
          setUser(null)
          currentUserRef.current = null
          setFacilityUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking initial session:', error)
        setUser(null)
        setFacilityUser(null)
        setLoading(false)
      }
    }

    checkInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'no user')

        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing facility user...')
          setFacilityUser(null)
          setUser(null)
          currentUserRef.current = null
          setLoading(false)
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, loading facility user...')
          setUser(session.user)
          currentUserRef.current = session.user
          await loadFacilityUser(session.user.id)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
          // Only update user if it's actually different to prevent unnecessary re-renders
          if (session?.user && session.user.id !== currentUserRef.current?.id) {
            setUser(session.user)
            currentUserRef.current = session.user
          }
        } else {
          console.log('Other auth event:', event)
          // For INITIAL_SESSION, only set user if we don't already have one
          if (event === 'INITIAL_SESSION') {
            if (!currentUserRef.current && session?.user) {
              setUser(session.user)
              currentUserRef.current = session.user
              await loadFacilityUser(session.user.id)
            } else if (!session?.user) {
              setUser(null)
              currentUserRef.current = null
              setFacilityUser(null)
              setLoading(false)
            }
          } else {
            setUser(session?.user ?? null)
            currentUserRef.current = session?.user ?? null
            if (!session?.user) {
              setFacilityUser(null)
              setLoading(false)
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadFacilityUser = async (authUserId: string) => {
    // Prevent duplicate loading for the same user
    if (facilityUser && facilityUser.auth_user_id === authUserId) {
      console.log('Auth: Facility user already loaded for this auth ID, skipping...')
      setLoading(false) // Ensure loading is false
      return
    }

    try {
      console.log('Auth: Loading facility user for auth ID:', authUserId)
      
      // Reduce timeout to 3 seconds to fail faster and not hang UI
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Facility user loading timeout')), 3000)
      )
      
      const loadPromise = getFacilityUserByAuthId(authUserId)
      let facilityUser = await Promise.race([loadPromise, timeoutPromise]) as FacilityUser | null
      
      console.log('Auth: Facility user lookup result:', facilityUser)

      // If no facility user exists, create one from auth user data
      if (!facilityUser) {
        console.log('Auth: No facility user found, attempting to create one...')
        const { data: authUser, error: authError } = await supabase.auth.getUser()

        if (authError) {
          console.error('Auth: Error getting auth user:', authError)
        } else if (authUser.user) {
          const userData = authUser.user.user_metadata || {}

          const newUserData = {
            auth_user_id: authUserId,
            first_name: userData.first_name || userData.firstName || 'User',
            last_name: userData.last_name || userData.lastName || '',
            email: authUser.user.email || '',
            user_type: userData.user_type || userData.userType || 'renter',
            city: userData.city || '',
            state: userData.state || '',
            zip_code: userData.zip_code || ''
          }

          console.log('Auth: Creating facility user with data:', newUserData)
          facilityUser = await createFacilityUser(newUserData)
          console.log('Auth: Facility user creation result:', facilityUser)
        } else {
          console.log('Auth: No auth user data available')
        }
      }

      console.log('Auth: Setting facility user:', facilityUser)
      setFacilityUser(facilityUser)
    } catch (error) {
      console.error('Auth: Error in loadFacilityUser:', error)
      // Don't let facility user loading failure block the app
      setFacilityUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      firstName: string
      lastName: string
      userType?: 'renter' | 'owner'
      city?: string
      state?: string
      zipCode?: string
    }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          user_type: userData.userType || 'renter',
          city: userData.city || '',
          state: userData.state || '',
          zip_code: userData.zipCode || ''
        }
      }
    })
    return { error }
  }

  const signOut = async () => {
    console.log('SignOut called - starting proper signout process')

    try {
      console.log('Calling Supabase signOut...')

      // Create a promise that resolves when signout completes
      const signOutPromise = supabase.auth.signOut()

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SignOut timeout')), 5000)
      )

      // Wait for either signout to complete or timeout
      await Promise.race([signOutPromise, timeoutPromise])
      console.log('Supabase signOut completed successfully')

      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check if session is actually cleared
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('Session still exists after signout, forcing local clear...')
        // Force clear local storage
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }

      console.log('Signout process complete, reloading page...')
      window.location.href = window.location.pathname + '?signed_out=true&t=' + Date.now()

    } catch (error: any) {
      console.error('SignOut failed:', error?.message)

      // Even if signout fails, force clear everything
      console.log('Forcing local cleanup due to signout failure...')
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
      setUser(null)
      setFacilityUser(null)
      setLoading(false)

      // Still reload the page
      window.location.href = window.location.pathname + '?signed_out=true&t=' + Date.now()
    }
  }

  const refreshFacilityUser = async () => {
    if (user?.id) {
      await loadFacilityUser(user.id)
    }
  }

  // Pre-fetch admin data to avoid re-auth on admin page
  const prefetchAdminData = async () => {
    console.log('Pre-fetching admin data...')
    
    // Ensure we have the latest auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Error pre-fetching session:', sessionError)
      return
    }
    
    if (!session?.user) {
      console.log('No valid session found during pre-fetch')
      return
    }
    
    // Make sure user state is set
    if (!user || user.id !== session.user.id) {
      console.log('Updating user state with latest session data')
      setUser(session.user)
      currentUserRef.current = session.user
      
      // Also refresh facility user if needed
      if (!facilityUser || facilityUser.auth_user_id !== session.user.id) {
        console.log('Refreshing facility user data')
        await loadFacilityUser(session.user.id)
      }
    }
    
    // Pre-fetch pending facilities for admin page
    try {
      console.log('Pre-fetching pending facilities...')
      
      // First, refresh the auth token to ensure it's valid
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        console.error('Error refreshing auth token:', refreshError)
      }
      
      // Then fetch some minimal data to warm up the connection
      await supabase
        .from('facility_facilities')
        .select(`
          id,
          status,
          name
        `)
        .in('status', ['pending_approval', 'needs_changes'])
        .limit(5) // Fetch a few records to better warm up the connection
      
      // Also pre-fetch a small amount of review data
      await supabase
        .from('facility_reviews')
        .select('id, facility_id, status')
        .limit(5)
      
      console.log('Admin data pre-fetched successfully')
    } catch (err) {
      console.error('Error pre-fetching admin data:', err)
    }
  }

  const value = {
    user,
    facilityUser,
    loading,
    signIn,
    signUp,
    signOut,
    refreshFacilityUser,
    prefetchAdminData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}