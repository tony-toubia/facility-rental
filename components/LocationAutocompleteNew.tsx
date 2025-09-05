'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'

interface LocationData {
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: LocationData) => void
  onClear: () => void
  placeholder?: string
  value?: string
  showClearButton?: boolean
  className?: string
  disabled?: boolean
}

export default function LocationAutocompleteNew({
  onLocationSelect,
  onClear,
  placeholder = "Search for a location...",
  value = "",
  showClearButton = false,
  className = "",
  disabled = false
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use Google Places API (New) via Text Search
      const response = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.addressComponents'
          },
          body: JSON.stringify({
            textQuery: query,
            locationBias: {
              circle: {
                center: {
                  latitude: 39.0267,
                  longitude: -94.6275
                },
                radius: 50000.0
              }
            },
            maxResultCount: 5
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.places) {
        setSuggestions(data.places)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (err) {
      console.error('Places API error:', err)
      setError('Failed to search locations')
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounce search
    timeoutRef.current = setTimeout(() => {
      searchPlaces(newValue)
    }, 300)
  }

  const handleSuggestionClick = (place: any) => {
    const location = place.location
    const addressComponents = place.addressComponents || []
    
    // Extract city and state from address components
    let city = ''
    let state = ''
    let country = ''
    
    addressComponents.forEach((component: any) => {
      const types = component.types || []
      if (types.includes('locality')) {
        city = component.longText
      } else if (types.includes('administrative_area_level_1')) {
        state = component.shortText
      } else if (types.includes('country')) {
        country = component.shortText
      }
    })

    const locationData: LocationData = {
      address: place.formattedAddress || place.displayName?.text || '',
      city: city || '',
      state: state || '',
      country: country || 'US',
      latitude: location.latitude,
      longitude: location.longitude
    }

    setInputValue(place.formattedAddress || place.displayName?.text || '')
    setShowSuggestions(false)
    setSuggestions([])
    onLocationSelect(locationData)
  }

  const handleClear = () => {
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    setError(null)
    onClear()
    inputRef.current?.focus()
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
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
          onBlur={handleBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`input-field pl-10 ${showClearButton ? 'pr-10' : ''} text-gray-900 placeholder-gray-500`}
        />
        {showClearButton && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
          <div className="text-sm text-gray-500">Searching...</div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(place)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {place.displayName?.text || 'Unknown Place'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {place.formattedAddress}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length >= 3 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
          <div className="text-sm text-gray-500">No locations found</div>
        </div>
      )}
    </div>
  )
}