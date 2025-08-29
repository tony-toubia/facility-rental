import { supabase } from './supabase'
import type { 
  Facility, 
  FacilityCategory, 
  FacilityUser, 
  FacilityBooking, 
  FacilityReview,
  FacilityImage,
  FacilityAmenity,
  FacilityFeature
} from '@/types'

// Facility Categories
export async function getCategories(): Promise<FacilityCategory[]> {
  const { data, error } = await supabase
    .from('facility_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

// Facilities
export async function getFacilities(options?: {
  limit?: number
  featured?: boolean
  category?: string
  status?: string
}): Promise<Facility[]> {
  let query = supabase
    .from('facility_facilities')
    .select(`
      *,
      owner:facility_users!facility_facilities_owner_id_fkey(*),
      category:facility_categories!facility_facilities_category_id_fkey(*),
      images:facility_images(*),
      amenities:facility_amenities(*),
      features:facility_features(*)
    `)

  // Apply filters
  if (options?.status) {
    query = query.eq('status', options.status)
  } else {
    query = query.eq('status', 'active') // Default to active facilities
  }

  if (options?.featured) {
    query = query.eq('is_featured', true)
  }

  if (options?.category) {
    query = query.eq('category_id', options.category)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  // Order by rating and created date
  query = query.order('rating', { ascending: false })
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching facilities:', error)
    return []
  }

  return data || []
}

export async function getFacilityById(id: string): Promise<Facility | null> {
  const { data, error } = await supabase
    .from('facility_facilities')
    .select(`
      *,
      owner:facility_users!facility_facilities_owner_id_fkey(*),
      category:facility_categories!facility_facilities_category_id_fkey(*),
      images:facility_images(*),
      amenities:facility_amenities(*),
      features:facility_features(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching facility:', error)
    return null
  }

  return data
}

export async function createFacility(facility: {
  owner_id: string
  category_id?: string
  name: string
  type: string
  description?: string
  address: string
  city: string
  state: string
  zip_code: string
  country?: string
  latitude?: number
  longitude?: number
  price: number
  price_unit?: 'hour' | 'day' | 'session'
  capacity?: number
  min_booking_duration?: number
  max_booking_duration?: number
  advance_booking_days?: number
  cancellation_policy?: string
  house_rules?: string
}): Promise<Facility | null> {
  const { data, error } = await supabase
    .from('facility_facilities')
    .insert(facility)
    .select()
    .single()

  if (error) {
    console.error('Error creating facility:', error)
    return null
  }

  return data
}

export async function updateFacility(id: string, updates: Partial<Facility>): Promise<Facility | null> {
  const { data, error } = await supabase
    .from('facility_facilities')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating facility:', error)
    return null
  }

  return data
}

// Facility Images
export async function addFacilityImage(image: {
  facility_id: string
  image_url: string
  alt_text?: string
  is_primary?: boolean
  sort_order?: number
}): Promise<FacilityImage | null> {
  const { data, error } = await supabase
    .from('facility_images')
    .insert(image)
    .select()
    .single()

  if (error) {
    console.error('Error adding facility image:', error)
    return null
  }

  return data
}

// Facility Amenities
export async function addFacilityAmenity(amenity: {
  facility_id: string
  name: string
  icon_name?: string
}): Promise<FacilityAmenity | null> {
  const { data, error } = await supabase
    .from('facility_amenities')
    .insert(amenity)
    .select()
    .single()

  if (error) {
    console.error('Error adding facility amenity:', error)
    return null
  }

  return data
}

// Facility Features
export async function addFacilityFeature(feature: {
  facility_id: string
  name: string
}): Promise<FacilityFeature | null> {
  const { data, error } = await supabase
    .from('facility_features')
    .insert(feature)
    .select()
    .single()

  if (error) {
    console.error('Error adding facility feature:', error)
    return null
  }

  return data
}

// Users
export async function getFacilityUser(id: string): Promise<FacilityUser | null> {
  const { data, error } = await supabase
    .from('facility_users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching facility user:', error)
    return null
  }

  return data
}

export async function getFacilityUserByAuthId(authId: string): Promise<FacilityUser | null> {
  console.log('getFacilityUserByAuthId called with:', authId)
  const { data, error } = await supabase
    .from('facility_users')
    .select('*')
    .eq('auth_user_id', authId)
    .single()

  console.log('getFacilityUserByAuthId result - data:', data, 'error:', error)

  if (error) {
    console.error('Error fetching facility user by auth ID:', error)
    return null
  }

  return data
}

export async function createFacilityUser(user: {
  auth_user_id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  user_type?: 'renter' | 'owner' | 'admin'
  avatar_url?: string
  bio?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
}): Promise<FacilityUser | null> {
  console.log('createFacilityUser called with:', user)
  const { data, error } = await supabase
    .from('facility_users')
    .insert(user)
    .select()
    .single()

  console.log('createFacilityUser result - data:', data, 'error:', error)

  if (error) {
    console.error('Error creating facility user:', error)
    return null
  }

  return data
}

export async function updateFacilityUser(id: string, updates: Partial<FacilityUser>): Promise<FacilityUser | null> {
  const { data, error } = await supabase
    .from('facility_users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating facility user:', error)
    return null
  }

  return data
}

// Bookings
export async function createBooking(booking: {
  facility_id: string
  user_id: string
  booking_date: string
  start_time: string
  end_time: string
  duration_hours: number
  total_price: number
  special_requests?: string
}): Promise<FacilityBooking | null> {
  const { data, error } = await supabase
    .from('facility_bookings')
    .insert(booking)
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    return null
  }

  return data
}

export async function getUserBookings(userId: string): Promise<FacilityBooking[]> {
  const { data, error } = await supabase
    .from('facility_bookings')
    .select(`
      *,
      facility:facility_facilities(*),
      user:facility_users(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }

  return data || []
}

export async function getFacilityBookings(facilityId: string): Promise<FacilityBooking[]> {
  const { data, error } = await supabase
    .from('facility_bookings')
    .select(`
      *,
      facility:facility_facilities(*),
      user:facility_users(*)
    `)
    .eq('facility_id', facilityId)
    .order('booking_date', { ascending: true })

  if (error) {
    console.error('Error fetching facility bookings:', error)
    return []
  }

  return data || []
}

export async function updateBookingStatus(
  id: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  reason?: string
): Promise<FacilityBooking | null> {
  const updates: any = { status }
  
  if (status === 'confirmed') {
    updates.confirmed_at = new Date().toISOString()
  } else if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString()
    if (reason) updates.cancellation_reason = reason
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('facility_bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating booking status:', error)
    return null
  }

  return data
}

// Reviews
export async function getFacilityReviews(facilityId: string): Promise<FacilityReview[]> {
  const { data, error } = await supabase
    .from('facility_reviews')
    .select(`
      *,
      user:facility_users(*),
      booking:facility_bookings(*)
    `)
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching facility reviews:', error)
    return []
  }

  return data || []
}

export async function createReview(review: {
  facility_id: string
  user_id: string
  booking_id?: string
  rating: number
  comment?: string
}): Promise<FacilityReview | null> {
  const { data, error } = await supabase
    .from('facility_reviews')
    .insert(review)
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    return null
  }

  return data
}

// Search facilities
export async function searchFacilities(query: {
  search?: string
  category?: string
  city?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  latitude?: number
  longitude?: number
  radius?: number // in miles
  limit?: number
  offset?: number
}): Promise<Facility[]> {
  let supabaseQuery = supabase
    .from('facility_facilities')
    .select(`
      *,
      owner:facility_users!facility_facilities_owner_id_fkey(*),
      category:facility_categories!facility_facilities_category_id_fkey(*),
      images:facility_images(*),
      amenities:facility_amenities(*),
      features:facility_features(*)
    `)
    .eq('status', 'active')

  // Text search
  if (query.search) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%,type.ilike.%${query.search}%`)
  }

  // Category filter
  if (query.category) {
    supabaseQuery = supabaseQuery.eq('category_id', query.category)
  }

  // Location filters
  if (query.city) {
    supabaseQuery = supabaseQuery.ilike('city', `%${query.city}%`)
  }

  if (query.state) {
    supabaseQuery = supabaseQuery.ilike('state', `%${query.state}%`)
  }

  // Price filters
  if (query.minPrice !== undefined) {
    supabaseQuery = supabaseQuery.gte('price', query.minPrice)
  }

  if (query.maxPrice !== undefined) {
    supabaseQuery = supabaseQuery.lte('price', query.maxPrice)
  }

  // Pagination
  if (query.limit) {
    supabaseQuery = supabaseQuery.limit(query.limit)
  }

  if (query.offset) {
    supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 10) - 1)
  }

  // Order by rating and created date
  supabaseQuery = supabaseQuery.order('rating', { ascending: false })
  supabaseQuery = supabaseQuery.order('created_at', { ascending: false })

  const { data, error } = await supabaseQuery

  if (error) {
    console.error('Error searching facilities:', error)
    return []
  }

  // If location-based search is requested, filter by distance
  if (query.latitude && query.longitude && query.radius && data) {
    const facilitiesWithDistance = data
      .map(facility => {
        if (facility.latitude && facility.longitude) {
          const distance = calculateDistance(
            query.latitude!,
            query.longitude!,
            facility.latitude,
            facility.longitude
          )
          return { ...facility, distance }
        }
        return { ...facility, distance: Infinity }
      })
      .filter(facility => facility.distance <= query.radius!)
      .sort((a, b) => a.distance - b.distance)

    return facilitiesWithDistance
  }

  return data || []
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// File Upload Functions
export async function uploadFacilityImage(facilityId: string, file: File): Promise<string | null> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${facilityId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('facility-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('facility-images')
      .getPublicUrl(fileName)

    // Create a facility_images record
    const { error: dbError } = await supabase
      .from('facility_images')
      .insert({
        facility_id: facilityId,
        image_url: publicUrl,
        alt_text: `${file.name}`,
        is_primary: false, // You might want to set the first image as primary
        sort_order: 0
      })

    if (dbError) {
      console.error('Error creating image record:', dbError)
      // Still return the URL even if DB record creation fails
    }

    return publicUrl
  } catch (error) {
    console.error('Error in uploadFacilityImage:', error)
    return null
  }
}

// Create facility amenities and features
export async function createFacilityAmenities(facilityId: string, amenities: string[]): Promise<void> {
  if (amenities.length === 0) return

  const amenityRecords = amenities.map(name => ({
    facility_id: facilityId,
    name,
    icon_name: null // You could map amenity names to icon names here
  }))

  const { error } = await supabase
    .from('facility_amenities')
    .insert(amenityRecords)

  if (error) {
    console.error('Error creating facility amenities:', error)
  }
}

export async function createFacilityFeatures(facilityId: string, features: string[]): Promise<void> {
  if (features.length === 0) return

  const featureRecords = features.map(name => ({
    facility_id: facilityId,
    name
  }))

  const { error } = await supabase
    .from('facility_features')
    .insert(featureRecords)

  if (error) {
    console.error('Error creating facility features:', error)
  }
}