'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import BookingAvailability from '@/components/BookingAvailability'

export default function TestBookingPage() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [selectedFacility, setSelectedFacility] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facility_facilities')
        .select('*')
        .eq('status', 'active')
        .eq('is_active', true)
        .limit(5)

      if (error) {
        console.error('Error loading facilities:', error)
        return
      }

      setFacilities(data || [])
      if (data && data.length > 0) {
        setSelectedFacility(data[0])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading facilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Booking System</h1>
          <p className="text-gray-600">Testing the booking availability component</p>
        </div>

        {facilities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active facilities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Facility Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Facility</h2>
                <div className="space-y-2">
                  {facilities.map(facility => (
                    <button
                      key={facility.id}
                      onClick={() => setSelectedFacility(facility)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedFacility?.id === facility.id
                          ? 'bg-primary-50 border-primary-300 text-primary-900'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-500">{facility.type} - ${facility.price}/{facility.price_unit}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedFacility && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Facility Details</h2>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedFacility.name}</div>
                    <div><strong>Type:</strong> {selectedFacility.type}</div>
                    <div><strong>Price:</strong> ${selectedFacility.price}/{selectedFacility.price_unit}</div>
                    <div><strong>Capacity:</strong> {selectedFacility.capacity} people</div>
                    <div><strong>Availability Increment:</strong> {selectedFacility.availability_increment || 60} minutes</div>
                    <div><strong>Minimum Duration:</strong> {selectedFacility.minimum_rental_duration || 60} minutes</div>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Component */}
            <div className="lg:col-span-1">
              {selectedFacility ? (
                <BookingAvailability
                  facilityId={selectedFacility.id}
                  price={selectedFacility.price}
                  priceUnit={selectedFacility.price_unit}
                  capacity={selectedFacility.capacity}
                  availabilityIncrement={selectedFacility.availability_increment}
                  minimumRentalDuration={selectedFacility.minimum_rental_duration}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-500 text-center">Select a facility to see booking options</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}