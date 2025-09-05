'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Only redirect when loading is complete and no user exists
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Show loading while auth is determining state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  // Only show access denied after loading is complete
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access the admin panel.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Panel</h1>
          <div className="space-y-2 text-sm">
            <p><strong>User Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Display Name:</strong> {user.email?.split('@')[0] || 'User'}</p>
          </div>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}