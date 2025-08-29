import { supabase } from './supabase'

export interface LocationData {
  address: string
  city: string
  state: string
  country: string
  zipCode?: string
  latitude: number
  longitude: number
  placeId?: string
}

export interface LocationSearchResult {
  data: LocationData
  source: 'search' | 'browser' | 'ip' | 'profile'
}

// Distance calculation using Haversine formula (fallback if PostGIS not available)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Get facilities within radius using PostGIS
export async function getFacilitiesWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusMiles: number = 25
) {
  try {
    // Convert miles to meters for PostGIS
    const radiusMeters = radiusMiles * 1609.34

    // Use PostGIS ST_DWithin for accurate distance filtering
    const { data, error } = await supabase
      .rpc('get_facilities_within_radius', {
        center_lat: centerLat,
        center_lng: centerLng,
        radius_meters: radiusMeters
      })

    if (error) {
      console.error('PostGIS query error:', error)
      // Fallback to basic coordinate filtering
      return getFacilitiesWithinRadiusFallback(centerLat, centerLng, radiusMiles)
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in PostGIS query:', err)
    // Fallback to basic coordinate filtering
    return getFacilitiesWithinRadiusFallback(centerLat, centerLng, radiusMiles)
  }
}

// Fallback method using basic coordinate filtering
async function getFacilitiesWithinRadiusFallback(
  centerLat: number,
  centerLng: number,
  radiusMiles: number
) {
  // Convert miles to approximate degrees (rough approximation)
  const radiusDegrees = radiusMiles / 69 // 1 degree ≈ 69 miles

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
        name,
        icon_name
      ),
      facility_features (
        name
      )
    `)
    .eq('status', 'active')
    .gte('latitude', centerLat - radiusDegrees)
    .lte('latitude', centerLat + radiusDegrees)
    .gte('longitude', centerLng - radiusDegrees)
    .lte('longitude', centerLng + radiusDegrees)

  if (error) {
    return { data: null, error }
  }

  // Filter by actual distance using Haversine formula
  const facilitiesWithDistance = data
    ?.map(facility => {
      if (!facility.latitude || !facility.longitude) return null
      
      const distance = calculateDistance(
        centerLat,
        centerLng,
        parseFloat(facility.latitude.toString()),
        parseFloat(facility.longitude.toString())
      )
      
      return {
        ...facility,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      }
    })
    .filter(facility => facility && facility.distance <= radiusMiles)
    .sort((a, b) => (a?.distance || 0) - (b?.distance || 0))

  return { data: facilitiesWithDistance, error: null }
}

// Geocode an address using Google Maps Geocoding API
export async function geocodeAddress(address: string): Promise<LocationData | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results.length) {
      return null
    }
    
    const result = data.results[0]
    const location = result.geometry.location
    
    let city = ''
    let state = ''
    let country = ''
    let zipCode = ''
    
    result.address_components?.forEach((component: any) => {
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
      address: result.formatted_address,
      city,
      state,
      country,
      zipCode,
      latitude: location.lat,
      longitude: location.lng,
      placeId: result.place_id
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Get user's location using browser geolocation
export function getBrowserLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          )
          
          const data = await response.json()
          
          if (data.status === 'OK' && data.results.length) {
            const result = data.results[0]
            
            let city = ''
            let state = ''
            let country = ''
            let zipCode = ''
            
            result.address_components?.forEach((component: any) => {
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
            
            resolve({
              address: result.formatted_address,
              city,
              state,
              country,
              zipCode,
              latitude,
              longitude,
              placeId: result.place_id
            })
          } else {
            // Fallback with just coordinates
            resolve({
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: '',
              state: '',
              country: 'US',
              latitude,
              longitude
            })
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          resolve({
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: '',
            state: '',
            country: 'US',
            latitude,
            longitude
          })
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}