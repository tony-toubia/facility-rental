'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { CheckCircle, XCircle, Eye, Clock, MapPin, DollarSign, MessageSquare, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface Facility {
  id: string
  name: string
  type: string
  description: string
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  price_unit: string
  capacity: number
  min_booking_duration?: number
  max_booking_duration?: number
  advance_booking_days?: number
  cancellation_policy?: string
  house_rules?: string
  status: string
  created_at: string
  owner_id: string
  facility_users?: {
    first_name: string
    last_name: string
    email: string
  }
  facility_images?: {
    image_url: string
    is_primary: boolean
  }[]
  facility_amenities?: {
    name: string
  }[]
  facility_features?: {
    name: string
  }[]
  availability_increment?: number
  minimum_rental_duration?: number
  availability_timezone?: string
  availability_notes?: string
  facility_default_availability?: {
    day_of_week: number
    start_time: string
    end_time: string
    is_available: boolean
  }[]
}

interface FacilityReview {
  id?: string
  facility_id: string
  basic_info_status: 'pending' | 'approved' | 'needs_changes'
  basic_info_comments: string
  basic_info_addressed?: boolean
  description_status: 'pending' | 'approved' | 'needs_changes'
  description_comments: string
  description_addressed?: boolean
  location_status: 'pending' | 'approved' | 'needs_changes'
  location_comments: string
  location_addressed?: boolean
  pricing_status: 'pending' | 'approved' | 'needs_changes'
  pricing_comments: string
  pricing_addressed?: boolean
  amenities_status: 'pending' | 'approved' | 'needs_changes'
  amenities_comments: string
  amenities_addressed?: boolean
  features_status: 'pending' | 'approved' | 'needs_changes'
  features_comments: string
  features_addressed?: boolean
  images_status: 'pending' | 'approved' | 'needs_changes'
  images_comments: string
  images_addressed?: boolean
  policies_status: 'pending' | 'approved' | 'needs_changes'
  policies_comments: string
  policies_addressed?: boolean
  availability_status: 'pending' | 'approved' | 'needs_changes'
  availability_comments: string
  availability_addressed?: boolean
  general_comments: string
  status: 'pending' | 'approved' | 'needs_changes'
  previous_review_id?: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Only redirect when loading is complete and no user exists
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Load pending facilities when switching to review tab
  useEffect(() => {
    if (activeTab === 'review' && user && !loading && pendingFacilities.length === 0) {
      loadPendingFacilities()
    }
  }, [activeTab, user, loading])

  const loadPendingFacilities = async () => {
    setReviewLoading(true)
    try {
      const { data, error } = await supabase
        .from('facility_facilities')
        .select(`
          *,
          facility_users:owner_id (
            first_name,
            last_name,
            email
          ),
          facility_images (
            image_url,
            is_primary
          ),
          facility_amenities (
            name
          ),
          facility_features (
            name
          ),
          facility_default_availability (
            day_of_week,
            start_time,
            end_time,
            is_available
          )
        `)
        .in('status', ['pending_approval', 'needs_changes'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading pending facilities:', error)
        setMessage(`❌ Error loading facilities: ${error.message}`)
      } else {
        console.log('Loaded facilities:', data)
        setPendingFacilities(data || [])
        
        // Load existing reviews for these facilities (get latest review per facility)
        if (data && data.length > 0) {
          const facilityIds = data.map(f => f.id)
          const { data: reviews } = await supabase
            .from('facility_reviews')
            .select('*')
            .in('facility_id', facilityIds)
            .order('updated_at', { ascending: false })
          
          const reviewsMap: {[key: string]: FacilityReview} = {}
          reviews?.forEach(review => {
            // Only keep the latest review per facility (first one due to ordering)
            if (!reviewsMap[review.facility_id]) {
              reviewsMap[review.facility_id] = review
            }
          })
          setFacilityReviews(reviewsMap)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage(`❌ Error: ${err}`)
    } finally {
      setReviewLoading(false)
    }
  }

  const initializeReview = (facilityId: string): FacilityReview => {
    return {
      facility_id: facilityId,
      basic_info_status: 'pending',
      basic_info_comments: '',
      basic_info_addressed: false,
      description_status: 'pending',
      description_comments: '',
      description_addressed: false,
      location_status: 'pending',
      location_comments: '',
      location_addressed: false,
      pricing_status: 'pending',
      pricing_comments: '',
      pricing_addressed: false,
      amenities_status: 'pending',
      amenities_comments: '',
      amenities_addressed: false,
      features_status: 'pending',
      features_comments: '',
      features_addressed: false,
      images_status: 'pending',
      images_comments: '',
      images_addressed: false,
      policies_status: 'pending',
      policies_comments: '',
      policies_addressed: false,
      availability_status: 'pending',
      availability_comments: '',
      availability_addressed: false,
      general_comments: '',
      status: 'pending'
    }
  }

  const updateReviewField = (facilityId: string, field: string, value: string | boolean) => {
    setFacilityReviews(prev => ({
      ...prev,
      [facilityId]: {
        ...(prev[facilityId] || initializeReview(facilityId)),
        [field]: value
      }
    }))
  }

  const hasAnyFeedback = (facilityId: string): boolean => {
    const review = facilityReviews[facilityId]
    if (!review) return false
    
    return !!(
      review.basic_info_comments ||
      review.description_comments ||
      review.location_comments ||
      review.pricing_comments ||
      review.amenities_comments ||
      review.features_comments ||
      review.images_comments ||
      review.policies_comments ||
      review.availability_comments ||
      review.general_comments
    )
  }

  const areAllSectionsApproved = (facilityId: string): boolean => {
    const review = facilityReviews[facilityId]
    if (!review) return false
    
    return (
      review.basic_info_status === 'approved' &&
      review.description_status === 'approved' &&
      review.location_status === 'approved' &&
      review.pricing_status === 'approved' &&
      review.amenities_status === 'approved' &&
      review.features_status === 'approved' &&
      review.images_status === 'approved' &&
      review.policies_status === 'approved' &&
      (review.availability_status ? review.availability_status === 'approved' : true)
    )
  }

  const approveFacility = async (facilityId: string) => {
    try {
      // Update facility status to approved
      const { error: facilityError } = await supabase
        .from('facility_facilities')
        .update({ 
          status: 'approved',
          is_active: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', facilityId)

      if (facilityError) throw facilityError

      // Create or update review record
      const review = facilityReviews[facilityId] || initializeReview(facilityId)
      const reviewData = {
        ...review,
        status: 'approved' as const,
        basic_info_status: 'approved' as const,
        description_status: 'approved' as const,
        location_status: 'approved' as const,
        pricing_status: 'approved' as const,
        amenities_status: 'approved' as const,
        features_status: 'approved' as const,
        images_status: 'approved' as const,
        policies_status: 'approved' as const
      }

      if (review.id) {
        const { error: reviewError } = await supabase
          .from('facility_reviews')
          .update(reviewData)
          .eq('id', review.id)
        if (reviewError) throw reviewError
      } else {
        const { error: reviewError } = await supabase
          .from('facility_reviews')
          .insert(reviewData)
        if (reviewError) throw reviewError
      }

      setMessage('✅ Facility approved successfully!')
      loadPendingFacilities()
    } catch (err: any) {
      setMessage(`❌ Error approving facility: ${err.message}`)
    }
  }

  const rejectFacility = async (facilityId: string) => {
    if (!hasAnyFeedback(facilityId)) {
      setMessage('❌ Please provide feedback before rejecting a facility.')
      return
    }

    try {
      // Update facility status to needs_changes
      const { error: facilityError } = await supabase
        .from('facility_facilities')
        .update({ 
          status: 'needs_changes',
          is_active: false,
          updated_at: new Date().toISOString() 
        })
        .eq('id', facilityId)

      if (facilityError) throw facilityError

      // Create or update review record
      const review = facilityReviews[facilityId] || initializeReview(facilityId)
      const reviewData = {
        ...review,
        status: 'needs_changes' as const
      }

      if (review.id) {
        const { error: reviewError } = await supabase
          .from('facility_reviews')
          .update(reviewData)
          .eq('id', review.id)
        if (reviewError) throw reviewError
      } else {
        const { error: reviewError } = await supabase
          .from('facility_reviews')
          .insert(reviewData)
        if (reviewError) throw reviewError
      }

      setMessage('✅ Facility rejected with feedback. Owner will be notified.')
      loadPendingFacilities()
    } catch (err: any) {
      setMessage(`❌ Error rejecting facility: ${err.message}`)
    }
  }

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Panel
          </h1>
          
          {/* Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('❌') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              <div className="whitespace-pre-line">{message}</div>
            </div>
          )}
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('review')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'review'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Facility Reviews
              </button>
              <button
                onClick={() => setActiveTab('testing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'testing'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Database Testing
              </button>
            </nav>
          </div>

          {/* Facility Review Tab */}
          {activeTab === 'review' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Facility Reviews
                </h2>
                <button
                  onClick={loadPendingFacilities}
                  disabled={reviewLoading}
                  className="btn-secondary"
                >
                  {reviewLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {reviewLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading pending facilities...</p>
                </div>
              ) : pendingFacilities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reviews</h3>
                  <p className="text-gray-600">All facilities have been reviewed!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingFacilities.map((facility) => {
                    const primaryImage = facility.facility_images?.find(img => img.is_primary)?.image_url || 
                                       facility.facility_images?.[0]?.image_url
                    const isExpanded = expandedFacility === facility.id
                    const hasFeedback = hasAnyFeedback(facility.id)
                    const allApproved = areAllSectionsApproved(facility.id)
                    const alreadyRejected = facility.status === 'needs_changes'
                    const review = facilityReviews[facility.id] || initializeReview(facility.id)
                    
                    return (
                      <div key={facility.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex space-x-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                              {primaryImage ? (
                                <Image
                                  src={primaryImage}
                                  alt={facility.name}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                  onError={(e) => {
                                    console.error('Image failed to load:', primaryImage)
                                    const parent = e.currentTarget.parentElement
                                    if (parent) {
                                      parent.innerHTML = '<div class="text-gray-400 text-xs text-center">Image Failed</div>'
                                    }
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-xs text-center">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                              <p className="text-sm text-gray-600">{facility.type}</p>
                              {facility.status === 'needs_changes' && (
                                <div className="flex items-center mt-1">
                                  <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                                  <span className="text-sm text-orange-600">Needs Changes</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setExpandedFacility(isExpanded ? null : facility.id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {isExpanded ? 'Hide Details' : 'Review Details'}
                            </button>
                            <button
                              onClick={() => approveFacility(facility.id)}
                              disabled={!allApproved}
                              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                allApproved 
                                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                              title={!allApproved ? 'All sections must be approved before accepting' : ''}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => rejectFacility(facility.id)}
                              disabled={!hasFeedback || alreadyRejected || allApproved}
                              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                alreadyRejected
                                  ? 'bg-orange-500 cursor-not-allowed'
                                  : allApproved
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : hasFeedback 
                                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                              title={
                                alreadyRejected 
                                  ? 'Facility has already been sent back to user' 
                                  : allApproved
                                  ? 'Cannot reject when all sections are approved'
                                  : !hasFeedback 
                                  ? 'Provide feedback before rejecting' 
                                  : ''
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {alreadyRejected ? 'Sent Back to User' : 'Reject'}
                            </button>
                          </div>
                        </div>

                        {/* Basic Info Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Facility Details</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {facility.address}, {facility.city}, {facility.state}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2" />
                                ${facility.price}/{facility.price_unit}
                              </div>
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-2" />
                                Capacity: {facility.capacity} people
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Owner Information</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                {facility.facility_users?.first_name} {facility.facility_users?.last_name}
                              </p>
                              <p>{facility.facility_users?.email}</p>
                              <p className="text-xs">
                                Submitted: {new Date(facility.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Review Sections */}
                        {isExpanded && (
                          <div className="border-t pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Review</h3>
                            
                            <ReviewSection
                              title="Basic Information"
                              facilityId={facility.id}
                              fieldPrefix="basic_info"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><strong>Name:</strong> {facility.name}</p>
                                  <p><strong>Type:</strong> {facility.type}</p>
                                  <p><strong>Capacity:</strong> {facility.capacity} people</p>
                                </div>
                              }
                            />

                            <ReviewSection
                              title="Description"
                              facilityId={facility.id}
                              fieldPrefix="description"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                  {facility.description || 'No description provided'}
                                </div>
                              }
                            />

                            <ReviewSection
                              title="Location"
                              facilityId={facility.id}
                              fieldPrefix="location"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><strong>Address:</strong> {facility.address}</p>
                                  <p><strong>City:</strong> {facility.city}</p>
                                  <p><strong>State:</strong> {facility.state}</p>
                                  <p><strong>ZIP:</strong> {facility.zip_code}</p>
                                </div>
                              }
                            />

                            <ReviewSection
                              title="Pricing & Booking"
                              facilityId={facility.id}
                              fieldPrefix="pricing"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><strong>Price:</strong> ${facility.price}/{facility.price_unit}</p>
                                  {facility.min_booking_duration && (
                                    <p><strong>Min Duration:</strong> {facility.min_booking_duration} hours</p>
                                  )}
                                  {facility.max_booking_duration && (
                                    <p><strong>Max Duration:</strong> {facility.max_booking_duration} hours</p>
                                  )}
                                  {facility.advance_booking_days && (
                                    <p><strong>Advance Booking:</strong> {facility.advance_booking_days} days</p>
                                  )}
                                </div>
                              }
                            />

                            <ReviewSection
                              title="Amenities"
                              facilityId={facility.id}
                              fieldPrefix="amenities"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600">
                                  {facility.facility_amenities && facility.facility_amenities.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {facility.facility_amenities.map((amenity, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                          {amenity.name}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p>No amenities listed</p>
                                  )}
                                </div>
                              }
                            />

                            <ReviewSection
                              title="Features"
                              facilityId={facility.id}
                              fieldPrefix="features"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600">
                                  {facility.facility_features && facility.facility_features.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {facility.facility_features.map((feature, index) => (
                                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                          {feature.name}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p>No features listed</p>
                                  )}
                                </div>
                              }
                            />

                            <ReviewSection
                              title="Images"
                              facilityId={facility.id}
                              fieldPrefix="images"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600">
                                  {facility.facility_images && facility.facility_images.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                      {facility.facility_images.map((image, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded overflow-hidden bg-gray-100">
                                          <Image
                                            src={image.image_url}
                                            alt={`Facility image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                          />
                                          {image.is_primary && (
                                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                              Primary
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p>No images uploaded</p>
                                  )}
                                </div>
                              }
                            />

                            <ReviewSection
                              title="Policies"
                              facilityId={facility.id}
                              fieldPrefix="policies"
                              facilityReviews={facilityReviews}
                              updateReviewField={updateReviewField}
                              initializeReview={initializeReview}
                              content={
                                <div className="text-sm text-gray-600 space-y-2">
                                  {facility.cancellation_policy && (
                                    <div>
                                      <strong>Cancellation Policy:</strong>
                                      <p className="bg-gray-50 p-2 rounded mt-1">{facility.cancellation_policy}</p>
                                    </div>
                                  )}
                                  {facility.house_rules && (
                                    <div>
                                      <strong>House Rules:</strong>
                                      <p className="bg-gray-50 p-2 rounded mt-1">{facility.house_rules}</p>
                                    </div>
                                  )}
                                  {!facility.cancellation_policy && !facility.house_rules && (
                                    <p>No policies specified</p>
                                  )}
                                </div>
                              }
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Testing Tab */}
          {activeTab === 'testing' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Database Testing
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Database testing functionality would go here...</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-secondary"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}