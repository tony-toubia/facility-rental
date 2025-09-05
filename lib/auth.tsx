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
  const isInitialized = useRef(false)

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
          await loadFacilityUser(session.user.id, true)
        } else {
          console.log('No valid session found')
          setUser(null)
          currentUserRef.current = null
          setFacilityUser(null)
          if (!isInitialized.current) {
            setLoading(false)
            isInitialized.current = true
          }
        }
      } catch (error) {
        console.error('Error checking initial session:', error)
        setUser(null)
        setFacilityUser(null)
        if (!isInitialized.current) {
          setLoading(false)
          isInitialized.current = true
        }
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
          // Don't reset loading on signout unless it's the initial check
          if (!isInitialized.current) {
            setLoading(false)
            isInitialized.current = true
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, loading facility user...')
          setUser(session.user)
          currentUserRef.current = session.user
          // Load facility user but don't reset loading state after initialization
          if (isInitialized.current) {
            // Already initialized, just update facility user silently
            loadFacilityUser(session.user.id, false).catch(console.error)
          } else {
            // First initialization
            await loadFacilityUser(session.user.id, true)
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
          // Only update user if it's actually different to prevent unnecessary re-renders
          if (session?.user && session.user.id !== currentUserRef.current?.id) {
            setUser(session.user)
            currentUserRef.current = session.user
          }
        } else {
          console.log('Other auth event:', event)
          // For INITIAL_SESSION, always process the session
          if (event === 'INITIAL_SESSION') {
            if (session?.user) {
              setUser(session.user)
              currentUserRef.current = session.user
              if (isInitialized.current) {
                // Already initialized, just update facility user silently
                loadFacilityUser(session.user.id, false).catch(console.error)
              } else {
                // First initialization
                await loadFacilityUser(session.user.id, true)
              }
            } else {
              setUser(null)
              currentUserRef.current = null
              setFacilityUser(null)
              if (!isInitialized.current) {
                setLoading(false)
                isInitialized.current = true
              }
            }
          } else {
            setUser(session?.user ?? null)
            currentUserRef.current = session?.user ?? null
            if (!session?.user) {
              setFacilityUser(null)
              // Don't reset loading state after initialization
              if (!isInitialized.current) {
                setLoading(false)
                isInitialized.current = true
              }
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadFacilityUser = async (authUserId: string, isInitialLoad = false) => {
    try {
      console.log('Auth: Loading facility user for auth ID:', authUserId, isInitialLoad ? '(initial)' : '(update)')
      
      const result = await getFacilityUserByAuthId(authUserId)
      console.log('Auth: Facility user lookup result:', result)

      setFacilityUser(result)
    } catch (error) {
      console.error('Auth: Error loading facility user:', error)
      setFacilityUser(null)
    } finally {
      // Only set loading to false on the very first initialization
      if (isInitialLoad && !isInitialized.current) {
        setLoading(false)
        isInitialized.current = true
      }
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
      await loadFacilityUser(user.id, false)
    }
  }

  const value = {
    user,
    facilityUser,
    loading,
    signIn,
    signUp,
    signOut,
    refreshFacilityUser
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