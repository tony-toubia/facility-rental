'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, MapPin, DollarSign, Clock, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createFacility, uploadFacilityImage, createFacilityAmenities, createFacilityFeatures, createFacilityCategoryAssignments } from '@/lib/database'
import { saveFacilityAvailability } from '@/lib/availability-database'
import CategoryButtonSelector from '@/components/CategoryButtonSelector'

export default function ListFacilityPage() {
  const router = useRouter()
  const { user, facilityUser } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    categories: [] as string[],
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    priceUnit: 'hour' as 'hour' | 'day' | 'session',
    capacity: '',
    amenities: [] as string[],
    features: [] as string[],
    images: [] as File[],
    availability: null as any
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form validation
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.categories.length > 0 &&
      formData.description.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.state.trim() !== '' &&
      formData.zipCode.trim() !== '' &&
      formData.price.trim() !== '' &&
      formData.capacity.trim() !== '' &&
      true && // Availability will be configured after approval
      user &&
      facilityUser
    )
  }

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setFormData(prev => ({
      ...prev,
      categories
    }))
  }, [])

  const handleAvailabilityChange = useCallback((availability: any) => {
    setFormData(prev => ({
      ...prev,
      availability
    }))
  }, [])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10) // Limit to 10 images
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to list a facility. Please sign in first.')
      return
    }

    // Validate categories
    if (formData.categories.length === 0) {
      setError('Please select at least one category for your facility.')
      return
    }

    setIsLoading(true)
    
    try {
      // Create the facility record
      const facilityData = {
        owner_id: facilityUser?.id || '', // Use facilityUser.id to satisfy foreign key constraint
        name: formData.name,
        type: formData.categories[0], // Use primary category as type for backward compatibility
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: 'US', // Default to US for now
        price: parseFloat(formData.price),
        price_unit: formData.priceUnit,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        status: 'pending_approval' as const
      }

      const facility = await createFacility(facilityData)
      
      if (!facility) {
        throw new Error('Failed to create facility')
      }

      // Upload images if any
      if (formData.images.length > 0) {
        const imageUploadPromises = formData.images.map(async (file, index) => {
          try {
            const imageUrl = await uploadFacilityImage(facility.id, file)
            // You could also create facility_images records here if needed
            return imageUrl
          } catch (error) {
            console.error(`Failed to upload image ${index + 1}:`, error)
            return null
          }
        })
        
        await Promise.all(imageUploadPromises)
      }

      // Create amenities and features records
      if (formData.amenities.length > 0) {
        await createFacilityAmenities(facility.id, formData.amenities)
      }
      
      if (formData.features.length > 0) {
        await createFacilityFeatures(facility.id, formData.features)
      }

      // Create category assignments
      if (formData.categories.length > 0) {
        await createFacilityCategoryAssignments(facility.id, formData.categories)
      }

      // Availability will be configured after approval by the admin team
      
      alert('Facility listing submitted successfully! It will be reviewed before going live.')
      router.push('/') // Redirect to home page
      
    } catch (err: any) {
      console.error('Error creating facility:', err)
      setError(err.message || 'Failed to create facility listing. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Facility</h1>
            <p className="text-gray-600">
              Share your space with the community and start earning. Fill out the details below to get started.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {!user && (
            <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                You must be <a href="/login" className="text-yellow-800 underline">logged in</a> to list a facility.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="e.g., Elite Fitness Center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Facility Categories *
                  </label>
                  <CategoryButtonSelector
                    selectedCategories={formData.categories}
                    onCategoriesChange={handleCategoriesChange}
                    maxSelections={10}
                    allowMultiple={true}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The first category selected will be used as the primary type for your facility.
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="input-field"
                    placeholder="Describe your facility, its features, and what makes it special..."
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Capacity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="input-field pl-10"
                      placeholder="25.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="priceUnit" className="block text-sm font-medium text-gray-700 mb-2">
                    Per *
                  </label>
                  <select
                    id="priceUnit"
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="session">Session</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="input-field"
                    placeholder="20"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload photos of your facility
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB each (max 10 photos)
                      </span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                      <span className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        Choose Files
                      </span>
                    </label>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Features</h2>
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

            {/* Availability Configuration */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability & Scheduling</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-medium text-yellow-800">Availability Configuration</h3>
                </div>
                <p className="text-sm text-yellow-700 mb-4">
                  Availability scheduling will be configured after your facility is approved.
                  Our team will work with you to set up the optimal schedule for your space.
                </p>
                <div className="text-xs text-yellow-600">
                  <strong>Note:</strong> This helps potential renters know when they can book your facility.
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Before You Submit</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p>Your listing will be reviewed by our team within <strong>24-48 hours</strong></p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p>Once approved, your facility will be <strong>immediately visible</strong> to potential renters</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p>If changes are needed, you&apos;ll receive detailed feedback and can resubmit</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p>By submitting, you agree to our <a href="/terms" className="underline hover:text-blue-600">Terms of Service</a> and <a href="/privacy" className="underline hover:text-blue-600">Privacy Policy</a></p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Make sure all information is accurate and complete. High-quality photos and detailed descriptions help your facility get approved faster and attract more bookings!
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t pt-8">
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  className="btn-secondary px-8 py-3"
                  disabled={isLoading}
                >
                  Save as Draft
                </button>
                <button 
                  type="submit" 
                  className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
              {!user || !facilityUser ? (
                <p className="text-sm text-gray-500 text-right mt-2">
                  Please log in to submit your facility listing
                </p>
              ) : !isFormValid() && (
                <p className="text-sm text-gray-500 text-right mt-2">
                  Please fill in all required fields to submit
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}