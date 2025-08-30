import { supabase } from './supabase'

// Simple version that doesn't use Google Maps API at all
export async function getFacilitiesWithinRadiusSimple(
  centerLat: number,
  centerLng: number,
  radiusMiles: number = 25
) {
  try {
    console.log('Testing PostGIS function with coordinates:', { centerLat, centerLng, radiusMiles })
    
    // Use PostGIS ST_DWithin for accurate distance filtering
    const { data, error } = await supabase
      .rpc('get_facilities_within_radius', {
        center_lat: centerLat,
        center_lng: centerLng,
        radius_miles: radiusMiles
      })

    console.log('PostGIS response:', { data, error })

    if (error) {
      console.error('PostGIS query error:', error)
      return { data: null, error }
    }

    // Transform the function results back to standard format
    const transformedData = data?.map((facility: any) => ({
      id: facility.facility_id,
      name: facility.facility_name,
      type: facility.facility_type,
      description: facility.facility_description,
      address: facility.facility_address,
      city: facility.facility_city,
      state: facility.facility_state,
      latitude: facility.facility_latitude,
      longitude: facility.facility_longitude,
      price: facility.facility_price,
      price_unit: facility.facility_price_unit,
      capacity: facility.facility_capacity,
      rating: facility.facility_rating,
      review_count: facility.facility_review_count,
      status: facility.facility_status,
      created_at: facility.facility_created_at,
      owner_id: facility.facility_owner_id,
      distance: parseFloat(facility.distance_miles)
    }))

    console.log('Transformed data:', transformedData)
    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Error in PostGIS query:', err)
    return { data: null, error: err }
  }
}