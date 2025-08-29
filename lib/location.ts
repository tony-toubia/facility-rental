// Location service for handling IP-based location detection and distance calculations

export interface LocationData {
  city: string
  state: string
  zipCode?: string
  latitude?: number
  longitude?: number
  country?: string
}

export interface UserLocation {
  source: 'profile' | 'search' | 'ip' | 'browser'
  data: LocationData
  radius: number // in miles
}

// Get user's location from IP address using ipapi.co (free tier: 1000 requests/day)
export const getLocationFromIP = async (): Promise<LocationData | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) {
      throw new Error('Failed to fetch location from IP')
    }
    
    const data = await response.json()
    
    if (data.error) {
      console.warn('IP location service error:', data.reason)
      return null
    }
    
    return {
      city: data.city || '',
      state: data.region_code || data.region || '',
      zipCode: data.postal || '',
      latitude: data.latitude,
      longitude: data.longitude,
      country: data.country_code || 'US'
    }
  } catch (error) {
    console.error('Error getting location from IP:', error)
    return null
  }
}

// Get user's location using browser geolocation API
export const getLocationFromBrowser = (): Promise<LocationData | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode the coordinates to get city/state
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          
          if (!response.ok) {
            resolve({ city: '', state: '', latitude, longitude })
            return
          }
          
          const data = await response.json()
          resolve({
            city: data.city || data.locality || '',
            state: data.principalSubdivision || '',
            zipCode: data.postcode || '',
            latitude,
            longitude,
            country: data.countryCode || 'US'
          })
        } catch (error) {
          console.error('Error reverse geocoding:', error)
          resolve(null)
        }
      },
      (error) => {
        console.warn('Geolocation error:', error.message)
        resolve(null)
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    )
  })
}

// Determine the best location to use for filtering
export const getUserLocation = async (
  profileLocation?: { city?: string; state?: string; zip_code?: string },
  searchLocation?: string
): Promise<UserLocation | null> => {
  // Priority 1: Search location (if provided)
  if (searchLocation && searchLocation.trim()) {
    // Parse search location (could be "City, State" or "Zip Code")
    const parsed = parseLocationString(searchLocation)
    if (parsed) {
      return {
        source: 'search',
        data: parsed,
        radius: 25 // Wider radius for search
      }
    }
  }

  // Priority 2: Profile location (if user is logged in and has location)
  if (profileLocation?.city && profileLocation?.state) {
    return {
      source: 'profile',
      data: {
        city: profileLocation.city,
        state: profileLocation.state,
        zipCode: profileLocation.zip_code || ''
      },
      radius: 10 // Smaller radius for profile location
    }
  }

  // Priority 3: Browser geolocation (with user permission)
  const browserLocation = await getLocationFromBrowser()
  if (browserLocation) {
    return {
      source: 'browser',
      data: browserLocation,
      radius: 15
    }
  }

  // Priority 4: IP-based location (fallback)
  const ipLocation = await getLocationFromIP()
  if (ipLocation) {
    return {
      source: 'ip',
      data: ipLocation,
      radius: 25 // Wider radius for IP location (less accurate)
    }
  }

  return null
}

// Parse location string like "Fairway, KS" or "66205"
const parseLocationString = (location: string): LocationData | null => {
  const trimmed = location.trim()
  
  // Check if it's a zip code (5 digits or 5+4 format)
  const zipMatch = trimmed.match(/^(\d{5})(-\d{4})?$/)
  if (zipMatch) {
    return {
      city: '',
      state: '',
      zipCode: zipMatch[1]
    }
  }
  
  // Check if it's "City, State" format
  const cityStateMatch = trimmed.match(/^([^,]+),\s*([A-Z]{2})$/i)
  if (cityStateMatch) {
    return {
      city: cityStateMatch[1].trim(),
      state: cityStateMatch[2].trim().toUpperCase(),
      zipCode: ''
    }
  }
  
  // If it's just a city name, assume it's a city
  if (trimmed.length > 0) {
    return {
      city: trimmed,
      state: '',
      zipCode: ''
    }
  }
  
  return null
}

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

// Get coordinates for a city/state combination using a geocoding service
export const getCoordinatesForLocation = async (
  city: string,
  state: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Using OpenStreetMap Nominatim (free, no API key required)
    const query = encodeURIComponent(`${city}, ${state}, USA`)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=us`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      }
    }
    
    return null
  } catch (error) {
    console.error('Error geocoding location:', error)
    return null
  }
}

// Format location for display
export const formatLocationDisplay = (location: UserLocation): string => {
  const { city, state, zipCode } = location.data
  
  if (city && state) {
    return `${city}, ${state}`
  } else if (zipCode) {
    return zipCode
  } else if (city) {
    return city
  } else if (state) {
    return state
  }
  
  return 'Unknown location'
}

// Get location source description for UI
export const getLocationSourceDescription = (source: UserLocation['source']): string => {
  switch (source) {
    case 'profile':
      return 'from your profile'
    case 'search':
      return 'from your search'
    case 'browser':
      return 'from your device location'
    case 'ip':
      return 'from your internet connection'
    default:
      return ''
  }
}