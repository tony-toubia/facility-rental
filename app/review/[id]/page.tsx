'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, MapPin, DollarSign, Users, Clock } from 'lucide-react'
import { getFacilityWithReview, createFacilityReview, updateFacilityReview } from '@/lib/database'
import { useAuth } from '@/lib/auth'
import type { Facility, FacilityReview } from '@/types'

interface ReviewSection {
  key: string
  title: string
  status: 'approved' | 'needs_changes' | 'pending'
  comments: string
}

export default function FacilityReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { facilityUser } = useAuth()
  const facilityId = params.id as string

  const [facility, setFacility] = useState<Facility | null>(null)
  const [existingReview, setExistingReview] = useState<FacilityReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [reviewSections, setReviewSections] = useState<ReviewSection[]>([
    { key: 'basic_info', title: 'Basic Information', status: 'pending', comments: '' },
    { key: 'description', title: 'Description', status: 'pending', comments: '' },
    { key: 'location', title: 'Location & Address', status: 'pending', comments: '' },
    { key: 'pricing', title: 'Pricing & Booking', status: 'pending', comments: '' },
    { key: 'amenities', title: 'Amenities', status: 'pending', comments: '' },
    { key: 'features', title: 'Special Features', status: 'pending', comments: '' },
    { key: 'images', title: 'Images', status: 'pending', comments: '' },
    { key: 'policies', title: 'Policies & Rules', status: 'pending', comments: '' },
  ])

  const [generalComments, setGeneralComments] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  const loadFacilityAndReview = useCallback(async () => {
    try {
      setLoading(true)
      const { facility, review } = await getFacilityWithReview(facilityId)
      
      if (!facility) {
        setError('Facility not found')
        return
      }

      setFacility(facility)
      setExistingReview(review)

      // If there's an existing review, populate the form
      if (review) {
        setReviewSections([
          { key: 'basic_info', title: 'Basic Information', status: review.basic_info_status, comments: review.basic_info_comments || '' },
          { key: 'description', title: 'Description', status: review.description_status, comments: review.description_comments || '' },
          { key: 'location', title: 'Location & Address', status: review.location_status, comments: review.location_comments || '' },
          { key: 'pricing', title: 'Pricing & Booking', status: review.pricing_status, comments: review.pricing_comments || '' },
          { key: 'amenities', title: 'Amenities', status: review.amenities_status, comments: review.amenities_comments || '' },
          { key: 'features', title: 'Special Features', status: review.features_status, comments: review.features_comments || '' },
          { key: 'images', title: 'Images', status: review.images_status, comments: review.images_comments || '' },
          { key: 'policies', title: 'Policies & Rules', status: review.policies_status, comments: review.policies_comments || '' },
        ])
        setGeneralComments(review.general_comments || '')
        setInternalNotes(review.internal_notes || '')
      }
    } catch (err) {
      console.error('Error loading facility and review:', err)
      setError('Failed to load facility details')
    } finally {
      setLoading(false)
    }
  }, [facilityId])

  useEffect(() => {
    loadFacilityAndReview()
  }, [loadFacilityAndReview])

  const updateSectionStatus = (sectionKey: string, status: 'approved' | 'needs_changes' | 'pending') => {
    setReviewSections(prev => prev.map(section => 
      section.key === sectionKey ? { ...section, status } : section
    ))
  }

  const updateSectionComments = (sectionKey: string, comments: string) => {
    setReviewSections(prev => prev.map(section => 
      section.key === sectionKey ? { ...section, comments } : section
    ))
  }

  const validateReview = (): string | null => {
    // Check if any section needs changes but has no comments
    const sectionsNeedingChanges = reviewSections.filter(section => section.status === 'needs_changes')
    const sectionsWithoutComments = sectionsNeedingChanges.filter(section => !section.comments.trim())
    
    if (sectionsWithoutComments.length > 0) {
      return `Please provide comments for sections marked as "Needs Changes": ${sectionsWithoutComments.map(s => s.title).join(', ')}`
    }

    return null
  }

  const getOverallStatus = (): 'approved' | 'needs_changes' | 'pending' => {
    const hasNeedsChanges = reviewSections.some(section => section.status === 'needs_changes')
    const hasPending = reviewSections.some(section => section.status === 'pending')
    
    if (hasNeedsChanges) return 'needs_changes'
    if (hasPending) return 'pending'
    return 'approved'
  }

  const handleSubmitReview = async () => {
    if (!facilityUser) {
      setError('You must be logged in to submit a review')
      return
    }

    const validationError = validateReview()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const overallStatus = getOverallStatus()
      
      const reviewData = {
        facility_id: facilityId,
        reviewer_id: facilityUser.id,
        status: overallStatus,
        basic_info_status: reviewSections.find(s => s.key === 'basic_info')?.status || 'pending',
        basic_info_comments: reviewSections.find(s => s.key === 'basic_info')?.comments,
        description_status: reviewSections.find(s => s.key === 'description')?.status || 'pending',
        description_comments: reviewSections.find(s => s.key === 'description')?.comments,
        location_status: reviewSections.find(s => s.key === 'location')?.status || 'pending',
        location_comments: reviewSections.find(s => s.key === 'location')?.comments,
        pricing_status: reviewSections.find(s => s.key === 'pricing')?.status || 'pending',
        pricing_comments: reviewSections.find(s => s.key === 'pricing')?.comments,
        amenities_status: reviewSections.find(s => s.key === 'amenities')?.status || 'pending',
        amenities_comments: reviewSections.find(s => s.key === 'amenities')?.comments,
        features_status: reviewSections.find(s => s.key === 'features')?.status || 'pending',
        features_comments: reviewSections.find(s => s.key === 'features')?.comments,
        images_status: reviewSections.find(s => s.key === 'images')?.status || 'pending',
        images_comments: reviewSections.find(s => s.key === 'images')?.comments,
        policies_status: reviewSections.find(s => s.key === 'policies')?.status || 'pending',
        policies_comments: reviewSections.find(s => s.key === 'policies')?.comments,
        general_comments: generalComments,
        internal_notes: internalNotes,
      }

      if (existingReview) {
        await updateFacilityReview(existingReview.id, reviewData)
      } else {
        await createFacilityReview(reviewData)
      }

      // Redirect back to review dashboard
      router.push('/review')
    } catch (err) {
      console.error('Error submitting review:', err)
      setError('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'needs_changes':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading facility details...</p>
        </div>
      </div>
    )
  }

  if (error && !facility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!facility) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Review Dashboard
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Review Facility</h1>
            <p className="mt-2 text-gray-600">Review and approve this facility listing</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Facility Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{facility.name}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {facility.address}, {facility.city}, {facility.state}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ${facility.price}/{facility.price_unit}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {facility.capacity} capacity
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(facility.created_at || '').toLocaleDateString()}
                </div>
              </div>

              {facility.description && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{facility.description}</p>
                </div>
              )}

              {/* Images */}
              {(facility as any).facility_images && (facility as any).facility_images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(facility as any).facility_images.map((image: any, index: number) => (
                      <Image
                        key={index}
                        src={image.image_url}
                        alt={image.alt_text || facility.name}
                        width={200}
                        height={150}
                        className="rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {(facility as any).facility_amenities && (facility as any).facility_amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(facility as any).facility_amenities.map((amenity: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {amenity.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {(facility as any).facility_features && (facility as any).facility_features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Special Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {(facility as any).facility_features.map((feature: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {feature.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Sections</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {reviewSections.map((section) => (
                  <div key={section.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{section.title}</h4>
                      {getStatusIcon(section.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateSectionStatus(section.key, 'approved')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            section.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateSectionStatus(section.key, 'needs_changes')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            section.status === 'needs_changes'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                          }`}
                        >
                          Needs Changes
                        </button>
                        <button
                          onClick={() => updateSectionStatus(section.key, 'pending')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            section.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                          }`}
                        >
                          Pending
                        </button>
                      </div>
                      
                      {section.status === 'needs_changes' && (
                        <textarea
                          value={section.comments}
                          onChange={(e) => updateSectionComments(section.key, e.target.value)}
                          placeholder="Explain what needs to be changed..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    General Comments
                  </label>
                  <textarea
                    value={generalComments}
                    onChange={(e) => setGeneralComments(e.target.value)}
                    placeholder="Overall feedback for the facility owner..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Internal notes (not visible to facility owner)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}