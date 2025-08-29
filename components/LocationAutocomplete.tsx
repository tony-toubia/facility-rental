'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'

interface LocationData {
  address: string
  city: string
  state: string
  country: string
  zipCode?: string
  latitude: number
  longitude: number
  placeId: string
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: LocationData) => void
  onClear?: () => void
  placeholder?: string
  value?: string
  className?: string
  showClearButton?: boolean
}

export default function LocationAutocomplete({
  onLocationSelect,
  onClear,
  placeholder = "Search for a location...",
  value = "",
  className = "",
  showClearButton = false
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isLoaded, setIsLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete()
        return
      }

      // Load Google Maps API
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setIsLoaded(true)
        initializeAutocomplete()
      }
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API')
      }

      document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google) return

      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(cities)'], // Focus on cities, but allow other types
          componentRestrictions: { country: 'us' }, // Restrict to US for now
          fields: [
            'place_id',
            'formatted_address', 
            'address_components',
            'geometry.location',
            'name'
          ]
        }
      )

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        
        if (!place || !place.geometry || !place.geometry.location) {
          console.error('No valid place selected')
          return
        }

        // Extract location data
        const locationData = extractLocationData(place)
        if (locationData) {
          setInputValue(locationData.address)
          onLocationSelect(locationData)
        }
      })
    }

    loadGoogleMaps()

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onLocationSelect])

  const extractLocationData = (place: google.maps.places.PlaceResult): LocationData | null => {
    if (!place.geometry?.location || !place.address_components) {
      return null
    }

    let city = ''
    let state = ''
    let country = ''
    let zipCode = ''

    // Parse address components
    place.address_components.forEach((component) => {
      const types = component.types
      
      if (types.includes('locality')) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name
      } else if (types.includes('country')) {
        country = component.short_name
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name
      }
    })

    return {
      address: place.formatted_address || place.name || '',
      city,
      state,
      country,
      zipCode,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      placeId: place.place_id || ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleClear = () => {
    setInputValue('')
    if (onClear) {
      onClear()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="input-field pl-10 pr-10"
        />
        {showClearButton && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {!isLoaded && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-sm p-2 text-sm text-gray-500">
          Loading location search...
        </div>
      )}
      
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute top-full left-0 right-0 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm p-2 text-sm text-yellow-700">
          Google Maps API key not configured
        </div>
      )}
    </div>
  )
}

// Extend the Window interface to include Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}