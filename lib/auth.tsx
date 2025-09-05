'use client'

import { createContext, useContext, useEffect, useState } from 'react'
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [facilityUser, setFacilityUser] = useState<FacilityUser | null>(null)
  const [loading, setLoading] = useState(true)

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

    // Get initial session with more robust checking
    const checkInitialSession = async () => {
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
          await loadFacilityUser(session.user.id)
        } else {
          console.log('No valid session found')
          setUser(null)
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
          setLoading(false)
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, loading facility user...')
          setUser(session.user)
          await loadFacilityUser(session.user.id)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
          setUser(session?.user ?? null)
        } else {
          console.log('Other auth event:', event)
          setUser(session?.user ?? null)
          if (!session?.user) {
            setFacilityUser(null)
            setLoading(false)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadFacilityUser = async (authUserId: string) => {
    try {
      let facilityUser = await getFacilityUserByAuthId(authUserId)
      
      // If no facility user exists, create one from auth user data
      if (!facilityUser) {
        const { data: authUser, error: authError } = await supabase.auth.getUser()
        
        if (authUser.user) {
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
          
          facilityUser = await createFacilityUser(newUserData)
        }
      }
      
      setFacilityUser(facilityUser)
    } catch (error) {
      console.error('Error in loadFacilityUser:', error)
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