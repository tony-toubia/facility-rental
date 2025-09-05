'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Clock, DollarSign, Wifi, Car, Users, Shield, Calendar, ChevronLeft, ChevronRight, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import BookingAvailability from '@/components/BookingAvailability'

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
  rating: number | null
  review_count: number | null
  status: string
  is_active: boolean
  created_at: string
  owner_id: string
  availability_increment?: number
  minimum_rental_duration?: number
  availability_timezone?: string
  availability_notes?: string
  facility_users?: {
    first_name: string
    last_name: string
    email: string
    created_at: string
  }
  facility_images?: {
    image_url: string
    is_primary: boolean
    alt_text?: string
  }[]
  facility_amenities?: {
    name: string
    icon_name?: string
  }[]
  facility_features?: {
    name: string
  }[]
}

export default function FacilityDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState('today')
  const [selectedTime, setSelectedTime] = useState('')

  const loadFacility = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, let's check if the facility exists at all
      const { data: facilityCheck } = await supabase
        .from('facility_facilities')
        .select('id, status, is_active')
        .eq('id', params.id)
        .single()
      
      console.log('Facility check:', facilityCheck)

      const { data, error } = await supabase
        .from('facility_facilities')
        .select(`
          *,
          facility_users:owner_id (
            first_name,
            last_name,
            email,
            created_at
          ),
          facility_images (
            image_url,
            is_primary,
            alt_text
          ),
          facility_amenities (
            name,
            icon_name
          ),
          facility_features (
            name
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error loading facility:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        setError(`Facility not found or not available. Error: ${error.message}`)
        return
      }

      console.log('Loaded facility:', data)
      setFacility(data)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load facility details')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadFacility()
  }, [loadFacility])

  const images = facility?.facility_images || []
  const sortedImages = images.sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return 0
  })

  const nextImage = () => {
    if (sortedImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length)
    }
  }

  const prevImage = () => {
    if (sortedImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
    }
  }

  const handleBooking = () => {
    if (selectedTime) {
      // Handle booking logic here
      alert(`Booking confirmed for ${selectedDate} at ${selectedTime}`)
    } else {
      alert('Please select a time slot')
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

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Facility Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The facility you are looking for does not exist or is not available.'}</p>
          <a href="/browse" className="btn-primary">
            Browse Other Facilities
          </a>
        </div>
      </div>
    )
  }

  const fullAddress = `${facility.address}, ${facility.city}, ${facility.state} ${facility.zip_code}`
  const ownerName = facility.facility_users ? `${facility.facility_users.first_name} ${facility.facility_users.last_name}` : 'Unknown'
  const ownerJoinDate = facility.facility_users?.created_at ? new Date(facility.facility_users.created_at).getFullYear() : 'Unknown'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="relative h-96 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                {sortedImages.length > 0 ? (
                  <>
                    <Image
                      src={sortedImages[currentImageIndex]?.image_url}
                      alt={sortedImages[currentImageIndex]?.alt_text || facility.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available'
                      }}
                    />
                    {sortedImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-2">🏢</div>
                    <p>No images available</p>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Navigation */}
              {sortedImages.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {sortedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                        index === currentImageIndex ? 'ring-2 ring-primary-600' : ''
                      }`}
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || `${facility.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80x64?text=No+Image'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Facility Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-primary-600 font-medium">{facility.type}</span>
                <div className="flex items-center space-x-1">
                  {facility.rating ? (
                    <>
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-medium">{facility.rating}</span>
                      {facility.review_count && facility.review_count > 0 && (
                        <span className="text-gray-500">({facility.review_count} reviews)</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{facility.name}</h1>

              {/* Categories */}
              <div className="mb-4">
                {facility.type && (
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <span className="text-sm px-3 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-200 font-medium">
                      {facility.type}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  facility.status === 'active' ? 'bg-green-100 text-green-800' :
                  facility.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                  facility.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  facility.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Status: {facility.status.replace('_', ' ').toUpperCase()}
                </span>
                {facility.is_active === false && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    INACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{fullAddress}</span>
              </div>

              {facility.description && (
                <p className="text-gray-700 mb-6">{facility.description}</p>
              )}

              {/* Amenities */}
              {facility.facility_amenities && facility.facility_amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {facility.facility_amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-5 h-5 text-primary-600 flex items-center justify-center">
                          {amenity.icon_name ? (
                            <span className="text-sm">🏢</span>
                          ) : (
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-700">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {facility.facility_features && facility.facility_features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {facility.facility_features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {feature.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity */}
              {facility.capacity && (
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Capacity: {facility.capacity} people</span>
                </div>
              )}

              {/* Booking Information */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>Price: ${facility.price}/{facility.price_unit}</span>
                </div>
                {facility.minimum_rental_duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>Minimum booking: {facility.minimum_rental_duration < 60 ? `${facility.minimum_rental_duration} minutes` : `${facility.minimum_rental_duration / 60} hour${facility.minimum_rental_duration > 60 ? 's' : ''}`}</span>
                  </div>
                )}
                {facility.availability_increment && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Time slots: {facility.availability_increment < 60 ? `${facility.availability_increment} minute` : `${facility.availability_increment / 60} hour`} increments</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Reviews</h3>
              {facility.review_count && facility.review_count > 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Reviews feature coming soon!</p>
                  <p className="text-sm text-gray-400 mt-2">This facility has {facility.review_count} review{facility.review_count !== 1 ? 's' : ''}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
                  <p className="text-gray-500">Be the first to review this facility!</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            {user ? (
              <BookingAvailability
                facilityId={facility.id}
                price={facility.price}
                priceUnit={facility.price_unit}
                capacity={facility.capacity}
                availabilityIncrement={facility.availability_increment}
                minimumRentalDuration={facility.minimum_rental_duration}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sign in to check availability
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create an account or sign in to view available times and make a booking.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-block text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Starting at</span>
                      <span className="font-semibold text-lg text-gray-900">
                        ${facility.price}/{facility.price_unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Hosted by</h4>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {ownerName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ownerName}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-600">New host</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Member since {ownerJoinDate}</p>
                <p className="text-gray-500">Contact: {facility.facility_users?.email}</p>
              </div>
              
              {/* Contact Button */}
              <button
                onClick={() => alert('Contact feature coming soon!')}
                className="w-full btn-secondary text-sm py-2 mt-4"
              >
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}