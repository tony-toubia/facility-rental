'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle, Clock, RefreshCw, Edit } from 'lucide-react'

interface FacilityReview {
  id: string
  facility_id: string
  status: 'pending' | 'approved' | 'needs_changes'
  basic_info_status: 'pending' | 'approved' | 'needs_changes'
  basic_info_comments: string
  description_status: 'pending' | 'approved' | 'needs_changes'
  description_comments: string
  location_status: 'pending' | 'approved' | 'needs_changes'
  location_comments: string
  pricing_status: 'pending' | 'approved' | 'needs_changes'
  pricing_comments: string
  amenities_status: 'pending' | 'approved' | 'needs_changes'
  amenities_comments: string
  features_status: 'pending' | 'approved' | 'needs_changes'
  features_comments: string
  images_status: 'pending' | 'approved' | 'needs_changes'
  images_comments: string
  policies_status: 'pending' | 'approved' | 'needs_changes'
  policies_comments: string
  availability_status?: 'pending' | 'approved' | 'needs_changes'
  availability_comments?: string
  general_comments: string
  created_at: string
  updated_at: string
}

interface Facility {
  id: string
  name: string
  status: string
}

interface FacilityReviewFeedbackProps {
  facilityId: string
  facilityName: string
  facilityStatus: string
  onResubmit?: () => void
}

export default function FacilityReviewFeedback({ 
  facilityId, 
  facilityName, 
  facilityStatus,
  onResubmit 
}: FacilityReviewFeedbackProps) {
  const router = useRouter()
  const [review, setReview] = useState<FacilityReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [resubmitting, setResubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [facilityLastUpdated, setFacilityLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    loadReview()
    loadFacilityLastUpdated()
  }, [facilityId])

  const loadReview = async () => {
    try {
      const { data, error } = await supabase
        .from('facility_reviews')
        .select('*')
        .eq('facility_id', facilityId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading review:', error)
      } else {
        setReview(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFacilityLastUpdated = async () => {
    try {
      const { data, error } = await supabase
        .from('facility_facilities')
        .select('updated_at')
        .eq('id', facilityId)
        .single()

      if (error) {
        console.error('Error loading facility updated time:', error)
      } else {
        setFacilityLastUpdated(data.updated_at)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const hasBeenEditedSinceReview = (): boolean => {
    if (!review || !facilityLastUpdated) return false
    
    const reviewTime = new Date(review.updated_at).getTime()
    const facilityTime = new Date(facilityLastUpdated).getTime()
    
    return facilityTime > reviewTime
  }

  const getRejectedSections = (): string[] => {
    if (!review) return []
    
    const sections = []
    if (review.basic_info_status === 'needs_changes') sections.push('Basic Information')
    if (review.description_status === 'needs_changes') sections.push('Description')
    if (review.location_status === 'needs_changes') sections.push('Location')
    if (review.pricing_status === 'needs_changes') sections.push('Pricing & Booking')
    if (review.amenities_status === 'needs_changes') sections.push('Amenities')
    if (review.features_status === 'needs_changes') sections.push('Features')
    if (review.images_status === 'needs_changes') sections.push('Images')
    if (review.policies_status === 'needs_changes') sections.push('Policies')
    if (review.availability_status === 'needs_changes') sections.push('Availability & Schedule')
    
    return sections
  }

  const canResubmit = (): boolean => {
    if (facilityStatus !== 'needs_changes') return false
    if (!review) return false
    
    const rejectedSections = getRejectedSections()
    if (rejectedSections.length === 0) return true
    
    return hasBeenEditedSinceReview()
  }

  const handleResubmit = async () => {
    setResubmitting(true)
    setMessage('')

    try {
      const { data, error } = await supabase.rpc('resubmit_facility_for_review', {
        facility_id_param: facilityId
      })

      if (error) {
        setMessage(`❌ Error resubmitting facility: ${error.message}`)
      } else if (data) {
        setMessage('✅ Facility resubmitted for review successfully!')
        if (onResubmit) {
          onResubmit()
        }
        // Reload the review data
        loadReview()
      } else {
        setMessage('❌ Failed to resubmit facility. Please try again.')
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`)
    } finally {
      setResubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'needs_changes':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'needs_changes':
        return 'Needs Changes'
      default:
        return 'Pending Review'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'needs_changes':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  // If no review exists and facility is not in needs_changes status, don't show anything
  if (!review && facilityStatus !== 'needs_changes') {
    return null
  }

  const ReviewSection = ({ 
    title, 
    status, 
    comments 
  }: { 
    title: string
    status: string
    comments: string
  }) => {
    // Show all sections so users can see approved status
    // Only hide if status is pending and there are no comments
    if (!comments && status === 'pending') return null

    const wasRejectedButEdited = status === 'needs_changes' && hasBeenEditedSinceReview()

    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <div className="flex items-center space-x-2">
            {wasRejectedButEdited ? (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            ) : (
              getStatusIcon(status)
            )}
            <span className={`text-sm px-2 py-1 rounded border ${
              wasRejectedButEdited 
                ? 'text-blue-700 bg-blue-50 border-blue-200'
                : getStatusColor(status)
            }`}>
              {wasRejectedButEdited ? 'Updated - Ready for Review' : getStatusText(status)}
            </span>
          </div>
        </div>
        {comments ? (
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
            {comments}
          </div>
        ) : status === 'approved' && (
          <div className="bg-green-50 p-3 rounded text-sm text-green-700">
            ✅ This section has been approved by the reviewer.
          </div>
        )}
        {wasRejectedButEdited && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            ✅ This section has been updated since the review and is ready for resubmission.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Review Feedback</h3>
          <p className="text-sm text-gray-600">{facilityName}</p>
        </div>
        {facilityStatus === 'needs_changes' && (
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/edit-facility/${facilityId}`)}
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Facility
            </button>
            <button
              onClick={handleResubmit}
              disabled={resubmitting || !canResubmit()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                canResubmit() && !resubmitting
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              title={
                !canResubmit() 
                  ? 'Please edit the rejected sections before resubmitting'
                  : ''
              }
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${resubmitting ? 'animate-spin' : ''}`} />
              {resubmitting ? 'Resubmitting...' : 'Resubmit for Review'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <pre className="text-sm whitespace-pre-wrap">{message}</pre>
        </div>
      )}

      {review ? (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border ${getStatusColor(review.status)}`}>
            <div className="flex items-center">
              {getStatusIcon(review.status)}
              <span className="ml-2 font-medium">
                Overall Status: {getStatusText(review.status)}
              </span>
            </div>
            {review.status === 'needs_changes' && (
              <div className="mt-2 space-y-2">
                {canResubmit() ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-green-800 mb-1">
                          Ready for Resubmission
                        </p>
                        <p className="text-green-700">
                          You have made changes to the rejected sections. Review the sections below and click "Resubmit for Review" when ready.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">
                      Please review the feedback below and make the necessary changes before resubmitting.
                    </p>
                    {getRejectedSections().length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800 mb-1">
                              Changes Required
                            </p>
                            <p className="text-yellow-700 mb-2">
                              You must edit the following rejected sections before resubmitting:
                            </p>
                            <ul className="list-disc list-inside text-yellow-700 space-y-1">
                              {getRejectedSections().map(section => (
                                <li key={section}>{section}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section-by-section feedback */}
          <div className="space-y-4">
            <ReviewSection
              title="Basic Information"
              status={review.basic_info_status}
              comments={review.basic_info_comments}
            />

            <ReviewSection
              title="Description"
              status={review.description_status}
              comments={review.description_comments}
            />

            <ReviewSection
              title="Location"
              status={review.location_status}
              comments={review.location_comments}
            />

            <ReviewSection
              title="Pricing & Booking"
              status={review.pricing_status}
              comments={review.pricing_comments}
            />

            <ReviewSection
              title="Amenities"
              status={review.amenities_status}
              comments={review.amenities_comments}
            />

            <ReviewSection
              title="Features"
              status={review.features_status}
              comments={review.features_comments}
            />

            <ReviewSection
              title="Images"
              status={review.images_status}
              comments={review.images_comments}
            />

            <ReviewSection
              title="Policies"
              status={review.policies_status}
              comments={review.policies_comments}
            />

            <ReviewSection
              title="Availability & Schedule"
              status={review.availability_status || 'pending'}
              comments={review.availability_comments || ''}
            />

            {/* General Comments */}
            {review.general_comments && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">General Comments</h4>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                  {review.general_comments}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t">
            Last updated: {new Date(review.updated_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Review in Progress</h3>
          <p className="text-gray-600">
            Your facility is currently being reviewed by our admin team.
          </p>
        </div>
      )}
    </div>
  )
}