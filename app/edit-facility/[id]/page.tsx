'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, CheckCircle, Clock, Upload, X, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getFacilityById, updateFacility, uploadFacilityImage, updateFacilityAmenities, updateFacilityFeatures, deleteFacilityImage, getFacilityCategories, updateFacilityCategoryAssignments } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import CategoryButtonSelector from '@/components/CategoryButtonSelector'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import AvailabilityManager from '@/components/AvailabilityManager'
import type { Facility, FacilityReview } from '@/types'

interface ReviewSection {
  status: 'pending' | 'approved' | 'needs_changes'
  comments: string
}

interface FacilityEditForm {
  name: string
  categories: string[]
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  price: string
  priceUnit: 'hour' | 'day' | 'session'
  capacity: string
  cancellationPolicy: string
  houseRules: string
  amenities: string[]
  features: string[]
  images: File[]
  existingImages: Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>
  isActive: boolean
}

export default function EditFacilityPage() {
  const router = useRouter()
  const params = useParams()
  const facilityId = params.id as string
  const { user, facilityUser } = useAuth()

  // Predefined amenities list (same as list-facility page)
  const predefinedAmenities = [
    'Free WiFi',
    'Parking Available',
    'Air Conditioning',
    'Heating',
    'Locker Rooms',
    'Shower Facilities',
    'Sound System',
    'Security System',
    'Equipment Rental',
    'Refreshments',
    'Towel Service',
    'Water Fountains',
    'First Aid Kit',
    'Wheelchair Accessible',
    'Restrooms',
    'Vending Machines',
    'Reception/Front Desk',
    'Storage Space',
    'Cleaning Service',
    'Equipment Storage',
    'Lighting Control',
    'Temperature Control',
    'Mirrors',
    'Seating Area',
    'Waiting Area'
  ]

  // Predefined features list (same as list-facility page)
  const predefinedFeatures = [
    'Professional Lighting',
    'Rubber Flooring',
    'Hardwood Floors',
    'High Ceilings',
    'Natural Light',
    'Sprung Floors',
    'Mirrored Walls',
    'Ballet Barres',
    'Yoga Props Available',
    'Meditation Space',
    'Outdoor Access',
    'Pool Access',
    'Sauna',
    'Steam Room',
    'Hot Tub',
    'Massage Room',
    'Recovery Area',
    'Cardio Equipment',
    'Weight Equipment',
    'Functional Training Area',
    'Group Exercise Space',
    'Private Training Room',
    'Competition Standard',
    'Spectator Seating',
    'Scoreboard',
    'Professional Grade Equipment',
    'Adjustable Equipment',
    'Multiple Courts/Fields',
    'Indoor/Outdoor Option'
  ]
  
  const [facility, setFacility] = useState<Facility | null>(null)
  const [review, setReview] = useState<FacilityReview | null>(null)
  const [formData, setFormData] = useState<FacilityEditForm>({
    name: '',
    categories: [],
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    priceUnit: 'hour',
    capacity: '',
    cancellationPolicy: '',
    houseRules: '',
    amenities: [],
    features: [],
    images: [],
    existingImages: [],
    isActive: true
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadFacility = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load facility data
      const facilityData = await getFacilityById(facilityId)
      if (!facilityData) {
        setError('Facility not found')
        return
      }
      
      // Check if user owns this facility
      if (facilityData.owner_id !== facilityUser?.id) {
        setError('You can only edit your own facilities')
        return
      }
      
      setFacility(facilityData)
      
      // Load review data (get the most recent review)
      const { data: reviewData } = await supabase
        .from('facility_reviews')
        .select('*')
        .eq('facility_id', facilityId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      
      if (reviewData) {
        setReview(reviewData)
      }
      
      // Load facility categories
      const facilityCategories = await getFacilityCategories(facilityId)
      
      // Populate form with existing data
      setFormData({
        name: facilityData.name || '',
        categories: facilityCategories,
        description: facilityData.description || '',
        address: facilityData.address || '',
        city: facilityData.city || '',
        state: facilityData.state || '',
        zipCode: facilityData.zip_code || '',
        price: facilityData.price?.toString() || '',
        priceUnit: facilityData.price_unit || 'hour',
        capacity: facilityData.capacity?.toString() || '',
        cancellationPolicy: facilityData.cancellation_policy || '',
        houseRules: facilityData.house_rules || '',
        amenities: facilityData.amenities?.map(a => a.name) || [],
        features: facilityData.features?.map(f => f.name) || [],
        images: [],
        existingImages: (facilityData.images || []).map(img => ({
          id: img.id,
          image_url: img.image_url,
          is_primary: img.is_primary || false
        })),
        isActive: facilityData.is_active ?? true
      })
      
    } catch (err: any) {
      setError(err.message || 'Failed to load facility')
    } finally {
      setIsLoading(false)
    }
  }, [facilityId, facilityUser?.id])

  useEffect(() => {
    if (!user || !facilityUser) {
      router.push('/login')
      return
    }
    loadFacility()
  }, [user, facilityUser, router, loadFacility])

  // Toggle functions for amenities and features
  const handleAmenityToggle = useCallback((amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }, [])

  const handleFeatureToggle = useCallback((feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }, [])

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setFormData(prev => ({
      ...prev,
      categories
    }))
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setMessage('')

      // Validate form
      if (!formData.name.trim()) {
        setError('Facility name is required')
        return
      }

      // Update facility
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zipCode.trim(),
        price: parseFloat(formData.price),
        price_unit: formData.priceUnit,
        capacity: parseInt(formData.capacity) || null,
        cancellation_policy: formData.cancellationPolicy.trim(),
        house_rules: formData.houseRules.trim(),
        is_active: formData.isActive,
        updated_at: new Date().toISOString()
      }

      await updateFacility(facilityId, updateData)

      // Upload new images
      for (const image of formData.images) {
        await uploadFacilityImage(facilityId, image)
      }

      // Update categories
      await updateFacilityCategoryAssignments(facilityId, formData.categories)

      // Update amenities
      await updateFacilityAmenities(facilityId, formData.amenities)

      // Update features
      await updateFacilityFeatures(facilityId, formData.features)

      setMessage('✅ Facility updated successfully!')
      
      // Redirect to dashboard after successful save
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (err: any) {
      setError(`Failed to update facility: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeExistingImage = async (imageId: string) => {
    try {
      await deleteFacilityImage(imageId)
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter(img => img.id !== imageId)
      }))
      setMessage('Image removed successfully')
    } catch (err: any) {
      setError(`Failed to remove image: ${err.message}`)
    }
  }

  const getReviewSection = (sectionKey: string): ReviewSection => {
    if (!review) return { status: 'pending', comments: '' }
    
    const statusKey = `${sectionKey}_status` as keyof FacilityReview
    const commentsKey = `${sectionKey}_comments` as keyof FacilityReview
    
    const status = review[statusKey] as string
    return {
      status: (status === 'approved' || status === 'needs_changes') ? status : 'pending',
      comments: (review[commentsKey] as string) || ''
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-200 bg-green-50'
      case 'needs_changes':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  if (!user || !facilityUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to edit facilities.</p>
          <button onClick={() => router.push('/login')} className="btn-primary">
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
        <span className="ml-2 text-gray-600">Loading facility...</span>
      </div>
    )
  }

  if (error && !facility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Facility</h1>
          <p className="text-gray-600">Update your facility information and address admin feedback</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        {/* Review Status Alert */}
        {facility?.status === 'needs_changes' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Changes Required</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Your facility needs changes before it can be approved. Please review the feedback below and update the relevant sections.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Active/Inactive Toggle */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Listing Status</h2>
                <p className="text-sm text-gray-600">
                  Control whether your facility is available for booking
                </p>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>
            
            {/* Important Note */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Even active listings must be approved by our admin team before they become visible to potential renters. 
                    Setting your listing to "Active" means it will be shown once approved. "Inactive" listings are hidden from search results.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('basic_info').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('basic_info').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('basic_info').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('basic_info').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('basic_info').comments}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter facility name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maximum capacity"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <CategoryButtonSelector
                selectedCategories={formData.categories}
                onCategoriesChange={handleCategoriesChange}
                maxSelections={5}
                allowMultiple={true}
              />
            </div>
          </div>

          {/* Description */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('description').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('description').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('description').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('description').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('description').comments}</p>
              </div>
            )}

            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your facility, its features, and what makes it special..."
            />
          </div>

          {/* Location */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('location').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('location').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('location').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('location').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('location').comments}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <LocationAutocomplete
                  value={formData.address}
                  onLocationSelect={(location) => {
                    setFormData(prev => ({
                      ...prev,
                      address: location.address,
                      city: location.city || prev.city,
                      state: location.state || prev.state,
                      zipCode: location.zipCode || prev.zipCode
                    }))
                  }}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('pricing').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pricing & Booking</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('pricing').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('pricing').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('pricing').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('pricing').comments}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Unit *
                </label>
                <select
                  value={formData.priceUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceUnit: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                  <option value="session">Per Session</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('amenities').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('amenities').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('amenities').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('amenities').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('amenities').comments}</p>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-4">Select all amenities available at your facility:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedAmenities.map(amenity => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('features').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Features</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('features').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('features').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('features').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('features').comments}</p>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-4">Select any special features that make your facility unique:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedFeatures.map(feature => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('images').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Images</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('images').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('images').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('images').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('images').comments}</p>
              </div>
            )}

            {/* Existing Images */}
            {formData.existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.existingImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.image_url}
                        alt="Facility"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      {image.is_primary && (
                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                      <button
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {formData.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">New Images to Upload</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="New facility image"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload facility images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Choose Images
              </label>
            </div>
          </div>

          {/* Policies */}
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(getReviewSection('policies').status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Policies</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('policies').status)}
                <span className="text-sm text-gray-600">
                  {getReviewSection('policies').status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {getReviewSection('policies').comments && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-1">Admin Feedback:</p>
                <p className="text-sm text-gray-700">{getReviewSection('policies').comments}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <textarea
                  value={formData.cancellationPolicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your cancellation policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House Rules
                </label>
                <textarea
                  value={formData.houseRules}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseRules: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List any rules or guidelines for using your facility..."
                />
              </div>
            </div>
          </div>

          {/* Availability & Schedule Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Availability & Schedule</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set when your facility is available for booking
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getReviewSection('availability').status)}
                <span className={`text-sm px-2 py-1 rounded ${
                  getReviewSection('availability').status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : getReviewSection('availability').status === 'needs_changes'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getReviewSection('availability').status === 'approved' ? 'Approved' :
                   getReviewSection('availability').status === 'needs_changes' ? 'Needs Changes' : 'Pending Review'}
                </span>
              </div>
            </div>

            {getReviewSection('availability').status === 'needs_changes' && getReviewSection('availability').comments && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Admin Feedback</h4>
                    <p className="text-sm text-red-800">{getReviewSection('availability').comments}</p>
                  </div>
                </div>
              </div>
            )}

            <AvailabilityManager
              facilityId={facilityId}
              facilityName={facility?.name || 'Facility'}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
{isSaving ? 'Saving...' : facility?.status === 'needs_changes' ? 'Save Changes & Return to Dashboard' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}