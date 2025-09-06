'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export default function DebugAuthPage() {
  const { user, facilityUser, loading } = useAuth()
  const [authData, setAuthData] = useState<any>(null)
  const [facilityUserData, setFacilityUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        setAuthData({
          session: session ? {
            userId: session.user?.id,
            email: session.user?.email,
            createdAt: session.user?.created_at
          } : null,
          error: sessionError?.message
        })

        // If we have a user, check facility_users table
        if (session?.user?.id) {
          const { data: facilityUserCheck, error: facilityUserError } = await supabase
            .from('facility_users')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .maybeSingle()

          setFacilityUserData({
            facilityUser: facilityUserCheck,
            error: facilityUserError?.message,
            exists: !!facilityUserCheck
          })
        }
      } catch (err: any) {
        setError(err.message)
      }
    }

    if (!loading) {
      checkAuth()
    }
  }, [loading])

  const createFacilityUser = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('facility_users')
        .insert({
          auth_user_id: user.id,
          email: user.email || '',
          first_name: user.email?.split('@')[0] || 'User',
          last_name: '',
          user_type: 'admin'
        })
        .select()

      if (error) {
        setError(`Error creating facility user: ${error.message}`)
      } else {
        setError(null)
        // Refresh the data
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Auth Debug Information
          </h1>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Auth Hook Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Auth Hook Status</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
                <p><strong>User:</strong> {user ? user.email : 'null'}</p>
                <p><strong>User ID:</strong> {user?.id || 'null'}</p>
                <p><strong>Facility User:</strong> {facilityUser ? 'exists' : 'null'}</p>
                {facilityUser && (
                  <p><strong>Facility User Type:</strong> {facilityUser.user_type}</p>
                )}
              </div>
            </div>

            {/* Raw Auth Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Supabase Auth Session</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(authData, null, 2)}
              </pre>
            </div>

            {/* Facility User Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Facility Users Table</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(facilityUserData, null, 2)}
              </pre>

              {user && facilityUserData && !facilityUserData.exists && (
                <div className="mt-4">
                  <p className="text-red-600 mb-2">
                    <strong>Issue Found:</strong> You have a Supabase auth user but no facility_users record.
                  </p>
                  <button
                    onClick={createFacilityUser}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Create Facility User Record
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
              <div className="space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Go to Admin
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}