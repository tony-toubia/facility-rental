import { supabase } from './supabase'

export interface LocationData {
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

// Get user's location from browser geolocation API
export async function getBrowserLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        console.log('Browser location:', { latitude, longitude })
        
        // Reverse geocode to get address
        const address = await reverseGeocode(latitude, longitude)
        if (address) {
          resolve(address)
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
      },
      (error) => {
        console.log('Error getting location:', error.message)
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

// Geocode an address to get coordinates using new Places API
export async function geocodeAddress(address: string): Promise<LocationData | null> {
  try {
    console.log('Geocoding address with new API:', address)
    
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
          textQuery: address,
          maxResultCount: 1
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.places && data.places.length > 0) {
      const place = data.places[0]
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

      const result: LocationData = {
        address: place.formattedAddress || address,
        city: city || '',
        state: state || '',
        country: country || 'US',
        latitude: location.latitude,
        longitude: location.longitude
      }

      console.log('Geocoding successful:', result)
      return result
    }

    console.log('No results found for address:', address)
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Reverse geocode coordinates to get address using new Geocoding API
export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationData | null> {
  try {
    console.log('Reverse geocoding with new API:', { latitude, longitude })
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      const components = result.address_components
      
      let city = ''
      let state = ''
      let country = ''
      
      components.forEach((component: any) => {
        const types = component.types
        if (types.includes('locality')) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name
        } else if (types.includes('country')) {
          country = component.short_name
        }
      })

      const locationData: LocationData = {
        address: result.formatted_address,
        city: city || '',
        state: state || '',
        country: country || 'US',
        latitude,
        longitude
      }

      console.log('Reverse geocoding successful:', locationData)
      return locationData
    }

    console.log('No results found for coordinates:', { latitude, longitude })
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Get facilities within radius using PostGIS with category support
export async function getFacilitiesWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusMiles: number = 25,
  categoryFilter?: string
) {
  try {
    console.log('Getting facilities within radius:', { centerLat, centerLng, radiusMiles, categoryFilter })
    
    // Use the original PostGIS function (now updated with categories)
    const { data, error } = await supabase
      .rpc('get_facilities_within_radius', {
        center_lat: centerLat,
        center_lng: centerLng,
        radius_meters: radiusMiles * 1609.34 // Convert miles to meters
      })

    console.log('PostGIS response:', { 
      data: data, 
      error: error,
      dataLength: data?.length
    })

    if (error) {
      console.error('PostGIS query error:', error)
      return { data: null, error }
    }

    // Filter by category if specified
    let filteredData = data
    if (categoryFilter && data) {
      filteredData = data.filter((facility: any) => 
        facility.categories?.some((cat: string) => 
          cat.toLowerCase().includes(categoryFilter.toLowerCase())
        )
      )
    }

    // Transform the function results back to standard format
    const transformedData = filteredData?.map((facility: any) => ({
      id: facility.id,
      name: facility.name,
      type: facility.type,
      description: facility.description,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      latitude: parseFloat(facility.latitude),
      longitude: parseFloat(facility.longitude),
      price: parseFloat(facility.price),
      price_unit: facility.price_unit,
      capacity: facility.capacity,
      availability_increment: facility.availability_increment,
      minimum_rental_duration: facility.minimum_rental_duration,
      rating: facility.rating ? parseFloat(facility.rating) : null,
      review_count: facility.review_count,
      status: facility.status,
      created_at: facility.created_at,
      owner_id: facility.owner_id,
      distance: parseFloat(facility.distance_miles),
      categories: facility.categories || [],
      primary_category: facility.primary_category
    }))

    console.log('Transformed data:', transformedData)
    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Error in PostGIS query:', err)
    return { data: null, error: err }
  }
}