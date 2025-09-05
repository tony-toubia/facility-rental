'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Calendar, Settings, Eye, Edit, BarChart3, Users, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getFacilitiesByOwner } from '@/lib/database'
import AvailabilityManager from '@/components/AvailabilityManager'
import FacilityReviewFeedback from '@/components/FacilityReviewFeedback'
import type { Facility } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, facilityUser } = useAuth()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [currentView, setCurrentView] = useState<'overview' | 'availability' | 'bookings' | 'analytics'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFacilities = useCallback(async () => {
    try {
      setIsLoading(true)
      const userFacilities = await getFacilitiesByOwner(facilityUser?.id || user?.id || '')
      setFacilities(userFacilities)
      
      // Only set selected facility if none is currently selected
      setSelectedFacility(prev => {
        if (!prev && userFacilities.length > 0) {
          return userFacilities[0]
        }
        return prev
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load facilities')
    } finally {
      setIsLoading(false)
    }
  }, [facilityUser?.id, user?.id])

  useEffect(() => {
    if (!user || !facilityUser) {
      router.push('/login')
      return
    }
    loadFacilities()
  }, [user, facilityUser, router])

  if (!user || !facilityUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access the dashboard.</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  if (facilities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Facilities Found</h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t listed any facilities yet. Get started by adding your first facility.
            </p>
            <button
              onClick={() => router.push('/list-facility')}
              className="btn-primary"
            >
              List Your First Facility
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Facility Dashboard</h1>
          <p className="text-gray-600">Manage your facilities and bookings</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Facility List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Your Facilities</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {facilities.map(facility => (
                  <button
                    key={facility.id}
                    onClick={() => setSelectedFacility(facility)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedFacility?.id === facility.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900 truncate">{facility.name}</div>
                    <div className="text-sm text-gray-600 truncate">{facility.city}, {facility.state}</div>
                    <div className="flex items-center mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        facility.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : facility.status === 'pending_approval'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {facility.status.replace('_', ' ')}
                      </span>
                      {facility.is_active && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => router.push('/list-facility')}
                  className="w-full btn-primary text-sm"
                >
                  Add New Facility
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedFacility && (
              <div className="space-y-6">
                {/* Facility Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedFacility.name}</h2>
                      <p className="text-gray-600">{selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/facility/${selectedFacility.id}`)}
                        className="btn-secondary flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Public
                      </button>
                      <button 
                        onClick={() => router.push(`/edit-facility/${selectedFacility.id}`)}
                        className="btn-secondary flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {[
                        { id: 'overview', name: 'Overview', icon: BarChart3 },
                        { id: 'availability', name: 'Availability', icon: Calendar },
                        { id: 'bookings', name: 'Bookings', icon: Users },
                        { id: 'analytics', name: 'Analytics', icon: BarChart3 }
                      ].map(tab => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setCurrentView(tab.id as any)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                              currentView === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {tab.name}
                          </button>
                        )
                      })}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* Overview */}
                    {currentView === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <Calendar className="w-8 h-8 text-blue-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-blue-900">Total Bookings</p>
                                <p className="text-2xl font-bold text-blue-600">{selectedFacility.total_bookings || 0}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <BarChart3 className="w-8 h-8 text-green-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-green-900">Rating</p>
                                <p className="text-2xl font-bold text-green-600">
                                  {selectedFacility.rating ? selectedFacility.rating.toFixed(1) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <Eye className="w-8 h-8 text-purple-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900">Views</p>
                                <p className="text-2xl font-bold text-purple-600">{selectedFacility.views_count || 0}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-3">Facility Status</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Approval Status:</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                selectedFacility.status === 'approved' 
                                  ? 'bg-green-100 text-green-800'
                                  : selectedFacility.status === 'pending_approval'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedFacility.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Visibility:</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                selectedFacility.is_active 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {selectedFacility.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Price:</span>
                              <span className="text-sm font-medium text-gray-900">
                                ${selectedFacility.price}/{selectedFacility.price_unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedFacility.status === 'pending_approval' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-900">Pending Approval</h4>
                                <p className="text-sm text-yellow-800 mt-1">
                                  Your facility is currently under review. You&apos;ll receive an email notification once it&apos;s approved or if changes are needed.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedFacility.status === 'needs_changes' && (
                          <FacilityReviewFeedback
                            facilityId={selectedFacility.id}
                            facilityName={selectedFacility.name}
                            facilityStatus={selectedFacility.status}
                            onResubmit={loadFacilities}
                          />
                        )}
                      </div>
                    )}

                    {/* Availability Management */}
                    {currentView === 'availability' && (
                      <AvailabilityManager
                        facilityId={selectedFacility.id}
                        facilityName={selectedFacility.name}
                      />
                    )}

                    {/* Bookings */}
                    {currentView === 'bookings' && (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Bookings Management</h3>
                        <p>View and manage your facility bookings</p>
                        <p className="text-sm">Coming soon!</p>
                      </div>
                    )}

                    {/* Analytics */}
                    {currentView === 'analytics' && (
                      <div className="text-center py-12 text-gray-500">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & Insights</h3>
                        <p>Track your facility&apos;s performance and earnings</p>
                        <p className="text-sm">Coming soon!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}