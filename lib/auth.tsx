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
  }) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [facilityUser, setFacilityUser] = useState<FacilityUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadFacilityUser(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadFacilityUser(session.user.id)
        } else {
          setFacilityUser(null)
          setLoading(false)
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
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          const userData = authUser.user.user_metadata || {}
          facilityUser = await createFacilityUser({
            auth_user_id: authUserId,
            first_name: userData.first_name || userData.firstName || '',
            last_name: userData.last_name || userData.lastName || '',
            email: authUser.user.email || '',
            user_type: userData.user_type || userData.userType || 'renter'
          })
        }
      }
      
      setFacilityUser(facilityUser)
    } catch (error) {
      console.error('Error loading facility user:', error)
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
    }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          user_type: userData.userType || 'renter'
        }
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    facilityUser,
    loading,
    signIn,
    signUp,
    signOut
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