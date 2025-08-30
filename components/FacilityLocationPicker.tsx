'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, AlertCircle } from 'lucide-react'
import LocationAutocompleteNew from './LocationAutocompleteNew'
import { LocationData, geocodeAddress } from '@/lib/geolocation-new'

interface FacilityLocationPickerProps {
  initialAddress?: string
  initialCity?: string
  initialState?: string
  initialZipCode?: string
  initialLatitude?: number
  initialLongitude?: number
  onLocationChange: (locationData: {
    address: string
    city: string
    state: string
    zipCode: string
    latitude: number
    longitude: number
  }) => void
  className?: string
}

export default function FacilityLocationPicker({
  initialAddress = '',
  initialCity = '',
  initialState = '',
  initialZipCode = '',
  initialLatitude,
  initialLongitude,
  onLocationChange,
  className = ''
}: FacilityLocationPickerProps) {
  const [locationData, setLocationData] = useState({
    address: initialAddress,
    city: initialCity,
    state: initialState,
    zipCode: initialZipCode,
    latitude: initialLatitude || 0,
    longitude: initialLongitude || 0
  })
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState('')
  const [hasValidCoordinates, setHasValidCoordinates] = useState(
    !!(initialLatitude && initialLongitude)
  )

  useEffect(() => {
    // Update parent when location data changes
    if (hasValidCoordinates) {
      onLocationChange(locationData)
    }
  }, [locationData, hasValidCoordinates, onLocationChange])

  const handleLocationSelect = async (location: LocationData) => {
    const newLocationData = {
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: '',
      latitude: location.latitude,
      longitude: location.longitude
    }
    
    setLocationData(newLocationData)
    setHasValidCoordinates(true)
    setGeocodeError('')
  }

  const handleManualAddressChange = (field: string, value: string) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear coordinates when manual address is changed
    if (field !== 'latitude' && field !== 'longitude') {
      setHasValidCoordinates(false)
    }
  }

  const handleGeocodeAddress = async () => {
    if (!locationData.address && !locationData.city) {
      setGeocodeError('Please enter an address or city')
      return
    }

    setIsGeocoding(true)
    setGeocodeError('')

    try {
      const addressToGeocode = locationData.address || 
        `${locationData.city}, ${locationData.state} ${locationData.zipCode}`.trim()
      
      const result = await geocodeAddress(addressToGeocode)
      
      if (result) {
        const newLocationData = {
          address: result.address,
          city: result.city || locationData.city,
          state: result.state || locationData.state,
          zipCode: locationData.zipCode,
          latitude: result.latitude,
          longitude: result.longitude
        }
        
        setLocationData(newLocationData)
        setHasValidCoordinates(true)
      } else {
        setGeocodeError('Could not find coordinates for this address. Please try a more specific address.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setGeocodeError('Error finding location. Please try again.')
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for Location
        </label>
        <LocationAutocompleteNew
          onLocationSelect={handleLocationSelect}
          onClear={() => {}}
          placeholder="Search for your facility's address..."
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Start typing to search for your facility&apos;s address using Google Places
        </p>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Or enter manually:</h4>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="address"
              value={locationData.address}
              onChange={(e) => handleManualAddressChange('address', e.target.value)}
              className="mt-1 input-field"
              placeholder="123 Main Street"
            />
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                value={locationData.city}
                onChange={(e) => handleManualAddressChange('city', e.target.value)}
                className="mt-1 input-field"
                placeholder="City"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                value={locationData.state}
                onChange={(e) => handleManualAddressChange('state', e.target.value)}
                className="mt-1 input-field"
                placeholder="CA"
                maxLength={2}
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                value={locationData.zipCode}
                onChange={(e) => handleManualAddressChange('zipCode', e.target.value)}
                className="mt-1 input-field"
                placeholder="12345"
                maxLength={10}
              />
            </div>
          </div>

          {/* Geocode Button */}
          <div>
            <button
              type="button"
              onClick={handleGeocodeAddress}
              disabled={isGeocoding || (!locationData.address && !locationData.city)}
              className="btn-secondary flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {isGeocoding ? 'Finding coordinates...' : 'Get Coordinates'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="border-t pt-4">
        {hasValidCoordinates ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <MapPin className="w-4 h-4" />
            <span>
              Location verified: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>
              Coordinates needed for location-based search. Please search for or geocode your address.
            </span>
          </div>
        )}
        
        {geocodeError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span>{geocodeError}</span>
          </div>
        )}
      </div>

      {/* Coordinates Display (for debugging) */}
      {hasValidCoordinates && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Debug Info:</strong><br />
          Address: {locationData.address}<br />
          City: {locationData.city}, State: {locationData.state}<br />
          Coordinates: {locationData.latitude}, {locationData.longitude}
        </div>
      )}
    </div>
  )
}