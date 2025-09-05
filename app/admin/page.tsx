'use client'

import { useState, useEffect, useRef } from 'react'
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

interface ReviewFeedback {
  [key: string]: string
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

// Move ReviewSection outside to prevent recreation on every render
const ReviewSection = ({ 
  title, 
  content, 
  facilityId, 
  fieldPrefix,
  facilityReviews,
  updateReviewField,
  initializeReview
}: { 
  title: string
  content: React.ReactNode
  facilityId: string
  fieldPrefix: string
  facilityReviews: {[key: string]: FacilityReview}
  updateReviewField: (facilityId: string, field: string, value: string | boolean) => void
  initializeReview: (facilityId: string) => FacilityReview
}) => {
  const review = facilityReviews[facilityId] || initializeReview(facilityId)
  const statusField = `${fieldPrefix}_status` as keyof FacilityReview
  const commentsField = `${fieldPrefix}_comments` as keyof FacilityReview
  const addressedField = `${fieldPrefix}_addressed` as keyof FacilityReview
  const currentStatus = review[statusField] as string || 'pending'
  const previousComments = review[commentsField] as string || ''
  const isAddressed = review[addressedField] as boolean || false
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <select
          value={currentStatus}
          onChange={(e) => updateReviewField(facilityId, statusField, e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="needs_changes">Needs Changes</option>
        </select>
      </div>
      
      <div className="mb-3">
        {content}
      </div>
      
      {/* Show previous feedback if it exists */}
      {previousComments && currentStatus === 'pending' && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="text-sm font-medium text-yellow-800 mb-1">Previous Feedback:</h5>
              <p className="text-sm text-yellow-700">{previousComments}</p>
            </div>
            <label className="flex items-center ml-3 text-sm">
              <input
                type="checkbox"
                checked={isAddressed}
                onChange={(e) => updateReviewField(facilityId, addressedField, e.target.checked)}
                className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className={`${isAddressed ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                Addressed
              </span>
            </label>
          </div>
        </div>
      )}
      
      {/* Only show comments box if status is "needs_changes" */}
      {currentStatus === 'needs_changes' && (
        <textarea
          placeholder={`Feedback for ${title.toLowerCase()}...`}
          value={review[commentsField] as string || ''}
          onChange={(e) => updateReviewField(facilityId, commentsField, e.target.value)}
          className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-none"
          rows={3}
        />
      )}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { user, facilityUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'review' | 'testing'>('review')
  const [pendingFacilities, setPendingFacilities] = useState<Facility[]>([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null)
  const [facilityReviews, setFacilityReviews] = useState<{[key: string]: FacilityReview}>({})
  const facilitiesLoadedRef = useRef(false)

  // Redirect if not authenticated - only after auth loading is complete
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load pending facilities only when user is confirmed and on review tab
  // Don't require facilityUser to be loaded for admin functionality
  useEffect(() => {
    if (user && !authLoading && activeTab === 'review' && !facilitiesLoadedRef.current) {
      console.log('Admin: Loading pending facilities for authenticated user')
      loadPendingFacilities()
    }
  }, [user, authLoading, activeTab]) // Removed facilityUser dependency

  const loadPendingFacilities = async () => {
    console.log('Admin: Starting to load pending facilities')
    setReviewLoading(true)
    facilitiesLoadedRef.current = true
    try {
      console.log('Admin: Executing database query for pending facilities')
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
        console.error('Admin: Database error loading pending facilities:', error)
        console.error('Admin: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        setMessage(`❌ Error loading facilities: ${error.message}`)
      } else {
        console.log('Admin: Successfully loaded facilities:', data?.length || 0, 'facilities')
        setPendingFacilities(data || [])

        // Load existing reviews for these facilities (get latest review per facility)
        if (data && data.length > 0) {
          console.log('Admin: Loading reviews for facilities')
          const facilityIds = data.map(f => f.id)
          const { data: reviews, error: reviewError } = await supabase
            .from('facility_reviews')
            .select('*')
            .in('facility_id', facilityIds)
            .order('updated_at', { ascending: false })

          if (reviewError) {
            console.error('Admin: Error loading reviews:', reviewError)
          } else {
            console.log('Admin: Loaded reviews:', reviews?.length || 0)
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
      }
    } catch (err) {
      console.error('Admin: Exception in loadPendingFacilities:', err)
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

  const isAlreadyRejected = (facilityId: string): boolean => {
    const facility = pendingFacilities.find(f => f.id === facilityId)
    return facility?.status === 'needs_changes'
  }

  const areAllSectionsApproved = (facilityId: string): boolean => {
    const review = facilityReviews[facilityId]
    if (!review) return false
    
    // All sections must be explicitly set to 'approved'
    // Note: availability_status check is conditional in case DB columns don't exist yet
    const basicSectionsApproved = (
      review.basic_info_status === 'approved' &&
      review.description_status === 'approved' &&
      review.location_status === 'approved' &&
      review.pricing_status === 'approved' &&
      review.amenities_status === 'approved' &&
      review.features_status === 'approved' &&
      review.images_status === 'approved' &&
      review.policies_status === 'approved'
    )
    
    // Only check availability if the field exists (for backward compatibility)
    const availabilityApproved = review.availability_status ? 
      review.availability_status === 'approved' : true
    
    // Check that all previous feedback has been addressed (only if this is a resubmission)
    const isResubmission = !!review.previous_review_id
    const allPreviousFeedbackAddressed = !isResubmission || (
      (!review.basic_info_comments || (review.basic_info_addressed ?? false)) &&
      (!review.description_comments || (review.description_addressed ?? false)) &&
      (!review.location_comments || (review.location_addressed ?? false)) &&
      (!review.pricing_comments || (review.pricing_addressed ?? false)) &&
      (!review.amenities_comments || (review.amenities_addressed ?? false)) &&
      (!review.features_comments || (review.features_addressed ?? false)) &&
      (!review.images_comments || (review.images_addressed ?? false)) &&
      (!review.policies_comments || (review.policies_addressed ?? false)) &&
      (!review.availability_comments || (review.availability_addressed ?? false))
    )
    
    return basicSectionsApproved && availabilityApproved && allPreviousFeedbackAddressed
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

  const testConnection = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('facility_categories')
        .select('count')
        .limit(1)

      if (testError) {
        setMessage(`❌ Connection failed: ${testError.message}`)
        return
      }

      // Test facility_users table access
      const { data: userData, error: userError } = await supabase
        .from('facility_users')
        .select('count')
        .limit(1)

      if (userError) {
        setMessage(`❌ facility_users table access failed: ${userError.message}\n\n💡 This might be due to RLS policies or missing table.`)
        return
      }

      // Test current user's facility user record
      if (user) {
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('facility_users')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (currentUserError) {
          setMessage(`❌ Error checking current user: ${currentUserError.message}`)
          return
        }

        if (!currentUserData) {
          setMessage(`⚠️ No facility user record found for current user.\n\n✅ Database connection: OK\n✅ facility_users table: Accessible\n❌ User record: Missing`)
        } else {
          setMessage(`✅ Database fully accessible!\n✅ Connection: OK\n✅ facility_users table: OK\n✅ User record: Found (${currentUserData.first_name} ${currentUserData.last_name})`)
        }
      } else {
        setMessage('✅ Database connection successful, but no authenticated user.')
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createCurrentUserRecord = async () => {
    if (!user) {
      setMessage('❌ No authenticated user found')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Check if user record already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('facility_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (checkError) {
        setMessage(`❌ Error checking existing user: ${checkError.message}`)
        return
      }

      if (existingUser) {
        setMessage(`✅ User record already exists: ${existingUser.first_name} ${existingUser.last_name}`)
        return
      }

      // Create facility user record
      const userData = {
        auth_user_id: user.id,
        first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || 'User',
        last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
        email: user.email || '',
        user_type: user.user_metadata?.user_type || user.user_metadata?.userType || 'renter',
        city: user.user_metadata?.city || '',
        state: user.user_metadata?.state || '',
        zip_code: user.user_metadata?.zip_code || '',
        country: 'US'
      }

      const { data, error } = await supabase
        .from('facility_users')
        .insert(userData)
        .select()
        .single()

      if (error) {
        setMessage(`❌ Failed to create facility user: ${error.message}\n\n💡 This might be due to RLS policies. Check your Supabase dashboard.`)
      } else {
        setMessage(`✅ Created facility user record: ${data.first_name} ${data.last_name}`)
        // Refresh the auth context to pick up the new user data
        window.location.reload()
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createSampleUser = async () => {
    setLoading(true)
    setMessage('')

    try {
      // First try to create a Supabase auth user
      const email = `test.user.${Date.now()}@example.com`
      const password = 'testpassword123'

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            user_type: 'owner'
          }
        }
      })

      if (authError) {
        setMessage(`❌ Failed to create auth user: ${authError.message}`)
        return
      }

      // If auth user creation succeeded, the facility_user should be created automatically
      // by our auth context, but let's also try direct insertion for testing
      const { data, error } = await supabase
        .from('facility_users')
        .insert({
          auth_user_id: authData.user?.id,
          first_name: 'Test',
          last_name: 'User',
          email: email,
          user_type: 'owner',
          city: 'Test City',
          state: 'TS',
          country: 'US'
        })
        .select()
        .single()

      if (error) {
        setMessage(`❌ Failed to create facility user: ${error.message}\n\n💡 This might be due to RLS policies. Try running the fix-rls-policies.sql script in your Supabase SQL editor.`)
      } else {
        setMessage(`✅ Created test user: ${data.first_name} ${data.last_name} (${data.email})\n✅ Auth user ID: ${authData.user?.id}`)
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createSampleFacility = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // First, get or create a user
      let { data: users, error: userError } = await supabase
        .from('facility_users')
        .select('id')
        .eq('user_type', 'owner')
        .limit(1)
      
      if (userError || !users || users.length === 0) {
        setMessage('❌ No owner users found. Create a user first.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('facility_facilities')
        .insert({
          owner_id: users[0].id,
          category_id: 'gyms',
          name: `Test Facility ${Date.now()}`,
          type: 'Test Gym',
          description: 'A test facility for development',
          address: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zip_code: '12345',
          price: 25.00,
          price_unit: 'hour',
          capacity: 20,
          status: 'pending_approval',
          is_featured: false
        })
        .select()
        .single()
      
      if (error) {
        setMessage(`❌ Failed to create facility: ${error.message}`)
      } else {
        setMessage(`✅ Created test facility: ${data.name}`)
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const checkTables = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const tables = [
        'facility_categories',
        'facility_users', 
        'facility_facilities',
        'facility_images',
        'facility_amenities',
        'facility_features',
        'facility_reviews'
      ]
      
      const results = []
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results.push(`❌ ${table}: Error - ${error.message}`)
        } else {
          results.push(`✅ ${table}: ${count} records`)
        }
      }
      
      setMessage(results.join('\n'))
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }



  // Show loading while checking authentication
  // Don't wait for facilityUser as it might fail to load but admin should still work
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Panel
          </h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('review')
                  // Reset the loaded flag when switching to review tab to allow refresh if needed
                  if (activeTab !== 'review') {
                    facilitiesLoadedRef.current = false
                  }
                }}
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
                    const alreadyRejected = isAlreadyRejected(facility.id)
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
                            title={!allApproved ? 'All sections must be approved and previous feedback must be marked as addressed before accepting' : ''}
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
                          {/* Show changes if this is a resubmission */}
                          {review.previous_review_id && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                              <h4 className="font-medium text-yellow-800 mb-2">Resubmission</h4>
                              <p className="text-sm text-yellow-700">
                                This facility has been resubmitted after previous feedback.
                                Please review the changes and ensure all previous issues have been addressed.
                              </p>
                            </div>
                          )}
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

                          {/* Availability Section - Only show if we have availability data */}
                          <ReviewSection
                            title="Availability & Schedule"
                            facilityId={facility.id}
                            fieldPrefix="availability"
                            facilityReviews={facilityReviews}
                            updateReviewField={updateReviewField}
                            initializeReview={initializeReview}
                            content={
                              <div className="text-sm text-gray-600 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <strong>Booking Settings:</strong>
                                    <div className="bg-gray-50 p-2 rounded mt-1 space-y-1">
                                      {facility.availability_increment && (
                                        <p><span className="font-medium">Time Increment:</span> {facility.availability_increment} minutes</p>
                                      )}
                                      {facility.minimum_rental_duration && (
                                        <p><span className="font-medium">Min Duration:</span> {facility.minimum_rental_duration} hours</p>
                                      )}
                                      {facility.availability_timezone && (
                                        <p><span className="font-medium">Timezone:</span> {facility.availability_timezone}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <strong>Weekly Schedule:</strong>
                                    <div className="bg-gray-50 p-2 rounded mt-1">
                                      {facility.facility_default_availability && facility.facility_default_availability.length > 0 ? (
                                        <div className="space-y-1">
                                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                                            const daySlots = facility.facility_default_availability?.filter(slot => slot.day_of_week === index && slot.is_available) || []
                                            return (
                                              <div key={day} className="flex justify-between text-xs">
                                                <span className="font-medium">{day}:</span>
                                                <span>
                                                  {daySlots.length > 0 
                                                    ? daySlots.map(slot => `${slot.start_time}-${slot.end_time}`).join(', ')
                                                    : 'Closed'
                                                  }
                                                </span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      ) : (
                                        <p className="text-xs">No schedule configured</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {facility.availability_notes && (
                                  <div>
                                    <strong>Availability Notes:</strong>
                                    <p className="bg-gray-50 p-2 rounded mt-1">{facility.availability_notes}</p>
                                  </div>
                                )}
                              </div>
                            }
                          />

                          {/* General Comments */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">General Comments</h4>
                            <textarea
                              placeholder="Overall feedback for the facility owner..."
                              value={facilityReviews[facility.id]?.general_comments || ''}
                              onChange={(e) => updateReviewField(facility.id, 'general_comments', e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Database Testing Tab */}
          {activeTab === 'testing' && (
          
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
              <p className="text-gray-600 mb-4">
                Test the connection to your Supabase database and check user records.
              </p>
              <div className="space-x-4">
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Testing...' : 'Test Connection'}
                </button>
                {user && (
                  <button
                    onClick={createCurrentUserRecord}
                    disabled={loading}
                    className="btn-secondary"
                  >
                    {loading ? 'Creating...' : 'Create My User Record'}
                  </button>
                )}
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Check Tables</h2>
              <p className="text-gray-600 mb-4">
                Check if all facility tables exist and show record counts.
              </p>
              <button
                onClick={checkTables}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Checking...' : 'Check Tables'}
              </button>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Create Sample Data</h2>
              <p className="text-gray-600 mb-4">
                Create sample users and facilities for testing.
              </p>
              <div className="space-x-4">
                <button
                  onClick={createSampleUser}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Sample User'}
                </button>
                <button
                  onClick={createSampleFacility}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? 'Creating...' : 'Create Sample Facility'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Required Environment Variables:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  </ul>
                  <p className="text-sm text-yellow-700 mt-2">
                    Make sure these are set in your .env.local file with your actual Supabase project values.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Fix RLS Policies (if getting permission errors):</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    If you&apos;re getting &quot;row-level security policy&quot; errors, run the fix-rls-policies.sql script:
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to your Supabase dashboard</li>
                    <li>Open the SQL Editor</li>
                    <li>Copy and paste the contents of <code className="bg-blue-100 px-1 rounded">fix-rls-policies.sql</code></li>
                    <li>Run the SQL script</li>
                    <li>Try creating sample data again</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          )}

          {message && (
            <div className="mt-8 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm whitespace-pre-wrap">{message}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}