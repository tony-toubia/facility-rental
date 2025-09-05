'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Clock, MessageSquare, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toggleFacilityVisibility } from '@/lib/database'
import FacilityReviewFeedback from '@/components/FacilityReviewFeedback'
import type { Facility, FacilityReview } from '@/types'

interface FacilityWithReview extends Facility {
  latest_review?: FacilityReview
}

export default function FacilityReviewStatus() {
  const { facilityUser } = useAuth()
  const [facilities, setFacilities] = useState<FacilityWithReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserFacilities = useCallback(async () => {
    if (!facilityUser) return

    try {
      setLoading(true)
      
      // Get user's facilities
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('facility_facilities')
        .select('*')
        .eq('owner_id', facilityUser.id)
        .order('created_at', { ascending: false })

      if (facilitiesError) {
        throw facilitiesError
      }

      // Get reviews for each facility
      const facilitiesWithReviews = await Promise.all(
        (facilitiesData || []).map(async (facility) => {
          const { data: reviewData } = await supabase
            .from('facility_reviews')
            .select('*')
            .eq('facility_id', facility.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          return {
            ...facility,
            latest_review: reviewData
          }
        })
      )

      setFacilities(facilitiesWithReviews)
    } catch (err) {
      console.error('Error loading facilities:', err)
      setError('Failed to load your facilities')
    } finally {
      setLoading(false)
    }
  }, [facilityUser])

  useEffect(() => {
    if (facilityUser) {
      loadUserFacilities()
    }
  }, [facilityUser, loadUserFacilities])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending_approval':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'needs_changes':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live & Active'
      case 'approved':
        return 'Approved'
      case 'pending_approval':
        return 'Pending Review'
      case 'needs_changes':
        return 'Needs Changes'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'needs_changes':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSectionStatus = (review: FacilityReview, sectionKey: string) => {
    const statusKey = `${sectionKey}_status` as keyof FacilityReview
    return review[statusKey] as string
  }

  const getSectionComments = (review: FacilityReview, sectionKey: string) => {
    const commentsKey = `${sectionKey}_comments` as keyof FacilityReview
    return review[commentsKey] as string
  }

  const handleToggleVisibility = async (facilityId: string, currentIsActive: boolean) => {
    const newIsActive = !currentIsActive
    const success = await toggleFacilityVisibility(facilityId, newIsActive)
    
    if (success) {
      // Update the local state
      setFacilities(prev => 
        prev.map(facility => 
          facility.id === facilityId 
            ? { ...facility, is_active: newIsActive }
            : facility
        )
      )
    } else {
      // Handle error - you might want to show a toast notification
      console.error('Failed to toggle facility visibility')
    }
  }

  const reviewSections = [
    { key: 'basic_info', title: 'Basic Information' },
    { key: 'description', title: 'Description' },
    { key: 'location', title: 'Location & Address' },
    { key: 'pricing', title: 'Pricing & Booking' },
    { key: 'amenities', title: 'Amenities' },
    { key: 'features', title: 'Special Features' },
    { key: 'images', title: 'Images' },
    { key: 'policies', title: 'Policies & Rules' },
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (facilities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">You haven&apos;t submitted any facilities yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Your Facility Listings</h2>
      
      {facilities.map((facility) => (
        <div key={facility.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{facility.name}</h3>
              <p className="text-sm text-gray-600">{facility.city}, {facility.state}</p>
            </div>
            <div className="flex items-center space-x-3">
              {facility.status === 'approved' && (
                <button
                  onClick={() => handleToggleVisibility(facility.id, facility.is_active)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    facility.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  title={facility.is_active ? 'Hide from public' : 'Show to public'}
                >
                  {facility.is_active ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Hidden
                    </>
                  )}
                </button>
              )}
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                {getStatusIcon(facility.status)}
                <span className="ml-1">{getStatusText(facility.status)}</span>
              </div>
            </div>
          </div>

          {(facility.status === 'pending_approval' || facility.status === 'needs_changes') && (
            <FacilityReviewFeedback
              facilityId={facility.id}
              facilityName={facility.name}
              facilityStatus={facility.status}
              onResubmit={loadUserFacilities}
            />
          )}

          {facility.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Listing Approved!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {facility.is_active 
                      ? 'Your facility is live and visible to potential renters.'
                      : 'Your facility is approved but currently hidden. Use the visibility toggle to make it public.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Submitted: {new Date(facility.created_at || '').toLocaleDateString()}</span>
            {facility.latest_review && (
              <span>Last reviewed: {new Date(facility.latest_review.updated_at || '').toLocaleDateString()}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}