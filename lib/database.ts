import { supabase } from './supabase'
import type { 
  Facility, 
  FacilityCategory, 
  FacilityUser, 
  FacilityBooking, 
  FacilityReview as FacilityReviewType,
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
    // Temporarily show all facilities to debug
    // query = query.eq('status', 'active') // Default to active facilities
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
  const facilityData = {
    ...facility,
    is_active: false // New facilities start as inactive until approved and owner makes them active
  }
  
  const { data, error } = await supabase
    .from('facility_facilities')
    .insert(facilityData)
    .select()
    .single()

  if (error) {
    console.error('Error creating facility:', error)
    return null
  }

  return data
}

export async function getFacilitiesByOwner(ownerId: string): Promise<Facility[]> {
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
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching facilities by owner:', error)
    return []
  }

  return data || []
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

export async function toggleFacilityVisibility(facilityId: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('facility_facilities')
    .update({ is_active: isActive })
    .eq('id', facilityId)

  if (error) {
    console.error('Error toggling facility visibility:', error)
    return false
  }

  return true
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
  
  try {
    // Add retry logic for network issues with shorter timeout
    let retries = 1 // Reduced retries to fail faster
    let lastError = null
    
    while (retries >= 0) {
      try {
        console.log(`getFacilityUserByAuthId attempt ${2 - retries}/2`)
        
        const { data, error } = await supabase
          .from('facility_users')
          .select('*')
          .eq('auth_user_id', authId)
          .maybeSingle()

        console.log('getFacilityUserByAuthId result - data:', data, 'error:', error)

        if (error) {
          console.error('Error fetching facility user by auth ID:', error)
          return null
        }

        console.log('getFacilityUserByAuthId success:', data ? 'found user' : 'no user found')
        return data
      } catch (attemptError) {
        console.error('getFacilityUserByAuthId attempt error:', attemptError)
        lastError = attemptError
        retries--
        if (retries >= 0) {
          console.log(`getFacilityUserByAuthId retry, ${retries + 1} attempts left`)
          await new Promise(resolve => setTimeout(resolve, 500)) // Shorter wait
        }
      }
    }
    
    throw lastError
  } catch (networkError) {
    console.error('Network error in getFacilityUserByAuthId after retries:', networkError)
    return null // Always return null instead of throwing
  }
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
export async function getFacilityReviews(facilityId: string): Promise<FacilityReviewType[]> {
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
}): Promise<FacilityReviewType | null> {
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
    .eq('status', 'approved')
    .eq('is_active', true)

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

// Delete facility image
export async function deleteFacilityImage(imageId: string): Promise<void> {
  try {
    // First get the image record to get the file path
    const { data: imageRecord, error: fetchError } = await supabase
      .from('facility_images')
      .select('image_url')
      .eq('id', imageId)
      .single()

    if (fetchError) {
      console.error('Error fetching image record:', fetchError)
      return
    }

    // Extract the file path from the URL
    if (imageRecord?.image_url) {
      const url = new URL(imageRecord.image_url)
      const filePath = url.pathname.split('/').slice(-2).join('/') // Get the last two parts (facilityId/filename)
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('facility-images')
        .remove([filePath])

      if (storageError) {
        console.error('Error deleting image from storage:', storageError)
      }
    }

    // Delete the database record
    const { error: dbError } = await supabase
      .from('facility_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      console.error('Error deleting image record:', dbError)
    }
  } catch (error) {
    console.error('Error in deleteFacilityImage:', error)
  }
}

// Update facility amenities (replace existing)
export async function updateFacilityAmenities(facilityId: string, amenities: string[]): Promise<void> {
  try {
    // Delete existing amenities
    await supabase
      .from('facility_amenities')
      .delete()
      .eq('facility_id', facilityId)

    // Create new amenities
    if (amenities.length > 0) {
      await createFacilityAmenities(facilityId, amenities)
    }
  } catch (error) {
    console.error('Error updating facility amenities:', error)
  }
}

// Update facility features (replace existing)
export async function updateFacilityFeatures(facilityId: string, features: string[]): Promise<void> {
  try {
    // Delete existing features
    await supabase
      .from('facility_features')
      .delete()
      .eq('facility_id', facilityId)

    // Create new features
    if (features.length > 0) {
      await createFacilityFeatures(facilityId, features)
    }
  } catch (error) {
    console.error('Error updating facility features:', error)
  }
}

// Get facility categories
export async function getFacilityCategories(facilityId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('facility_category_assignments')
      .select('category_id')
      .eq('facility_id', facilityId)

    if (error) {
      console.error('Error fetching facility categories:', error)
      return []
    }

    return data?.map(item => item.category_id) || []
  } catch (error) {
    console.error('Error in getFacilityCategories:', error)
    return []
  }
}

// Update facility category assignments (replace existing)
export async function updateFacilityCategoryAssignments(facilityId: string, categoryIds: string[]): Promise<void> {
  try {
    // Delete existing assignments
    await supabase
      .from('facility_category_assignments')
      .delete()
      .eq('facility_id', facilityId)

    // Create new assignments
    if (categoryIds.length > 0) {
      await createFacilityCategoryAssignments(facilityId, categoryIds)
    }
  } catch (error) {
    console.error('Error updating facility category assignments:', error)
  }
}

// Create facility category assignments
export async function createFacilityCategoryAssignments(facilityId: string, categoryIds: string[]): Promise<void> {
  if (categoryIds.length === 0) return

  const assignmentRecords = categoryIds.map((categoryId, index) => ({
    facility_id: facilityId,
    category_id: categoryId,
    is_primary: index === 0 // First category is primary
  }))

  const { error } = await supabase
    .from('facility_category_assignments')
    .insert(assignmentRecords)

  if (error) {
    console.error('Error creating facility category assignments:', error)
    throw error
  }
}

// Admin Review Functions
export async function getFacilitiesForReview(): Promise<Facility[]> {
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
    .in('status', ['pending_approval', 'needs_changes'])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching facilities for review:', error)
    return []
  }

  return data || []
}

export async function getFacilityReview(facilityId: string): Promise<FacilityReviewType | null> {
  const { data, error } = await supabase
    .from('facility_reviews')
    .select(`
      *,
      facility:facility_facilities(*),
      reviewer:facility_users!reviewer_id(*)
    `)
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching facility review:', error)
    return null
  }

  return data
}

export async function createFacilityReview(review: {
  facility_id: string
  reviewer_id: string
  status: 'pending' | 'approved' | 'needs_changes'
  basic_info_status?: 'approved' | 'needs_changes' | 'pending'
  basic_info_comments?: string
  description_status?: 'approved' | 'needs_changes' | 'pending'
  description_comments?: string
  location_status?: 'approved' | 'needs_changes' | 'pending'
  location_comments?: string
  pricing_status?: 'approved' | 'needs_changes' | 'pending'
  pricing_comments?: string
  amenities_status?: 'approved' | 'needs_changes' | 'pending'
  amenities_comments?: string
  features_status?: 'approved' | 'needs_changes' | 'pending'
  features_comments?: string
  images_status?: 'approved' | 'needs_changes' | 'pending'
  images_comments?: string
  policies_status?: 'approved' | 'needs_changes' | 'pending'
  policies_comments?: string
  general_comments?: string
  internal_notes?: string
}): Promise<FacilityReviewType | null> {
  const { data, error } = await supabase
    .from('facility_reviews')
    .insert(review)
    .select()
    .single()

  if (error) {
    console.error('Error creating facility review:', error)
    return null
  }

  // Update facility status based on review status
  if (review.status === 'approved') {
    await supabase
      .from('facility_facilities')
      .update({ status: 'active' })
      .eq('id', review.facility_id)
  } else if (review.status === 'needs_changes') {
    await supabase
      .from('facility_facilities')
      .update({ status: 'needs_changes' })
      .eq('id', review.facility_id)
  }

  return data
}

export async function updateFacilityReview(
  reviewId: string,
  updates: Partial<FacilityReviewType>
): Promise<FacilityReviewType | null> {
  const { data, error } = await supabase
    .from('facility_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single()

  if (error) {
    console.error('Error updating facility review:', error)
    return null
  }

  // Update facility status if review status changed
  if (updates.status) {
    if (updates.status === 'approved') {
      await supabase
        .from('facility_facilities')
        .update({ status: 'active' })
        .eq('id', data.facility_id)
    } else if (updates.status === 'needs_changes') {
      await supabase
        .from('facility_facilities')
        .update({ status: 'needs_changes' })
        .eq('id', data.facility_id)
    }
  }

  return data
}

export async function getFacilityWithReview(facilityId: string): Promise<{
  facility: Facility | null
  review: FacilityReviewType | null
}> {
  // Get facility details
  const { data: facility, error: facilityError } = await supabase
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
    .eq('id', facilityId)
    .single()

  if (facilityError) {
    console.error('Error fetching facility:', facilityError)
    return { facility: null, review: null }
  }

  // Get latest review
  const { data: review, error: reviewError } = await supabase
    .from('facility_reviews')
    .select(`
      *,
      reviewer:facility_users!reviewer_id(*)
    `)
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (reviewError) {
    console.error('Error fetching facility review:', reviewError)
  }

  return { facility, review }
}