// Database types matching our facility schema
export interface FacilityUser {
  id: string
  auth_user_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  user_type: 'renter' | 'owner' | 'admin'
  avatar_url: string | null
  bio: string | null
  date_of_birth: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  is_verified: boolean | null
  rating: number | null
  total_bookings: number | null
  total_listings: number | null
  joined_date: string | null
  last_active: string | null
  created_at: string | null
  updated_at: string | null
}

export interface FacilityCategory {
  id: string
  name: string
  description: string | null
  icon_name: string | null
  color: string | null
  is_active: boolean | null
  sort_order: number | null
  created_at: string | null
  updated_at: string | null
}

export interface Facility {
  id: string
  owner_id: string
  category_id: string | null
  name: string
  type: string
  description: string | null
  address: string
  city: string
  state: string
  zip_code: string
  country: string | null
  latitude: number | null
  longitude: number | null
  price: number
  price_unit: 'hour' | 'day' | 'session'
  capacity: number | null
  min_booking_duration: number | null
  max_booking_duration: number | null
  advance_booking_days: number | null
  cancellation_policy: string | null
  house_rules: string | null
  status: 'active' | 'inactive' | 'pending_approval' | 'suspended' | 'pending_review' | 'needs_changes' | 'approved'
  is_active: boolean
  is_featured: boolean | null
  rating: number | null
  review_count: number | null
  total_bookings: number | null
  views_count: number | null
  created_at: string | null
  updated_at: string | null
  // Relations
  owner?: FacilityUser
  category?: FacilityCategory
  images?: FacilityImage[]
  amenities?: FacilityAmenity[]
  features?: FacilityFeature[]
}

export interface FacilityImage {
  id: string
  facility_id: string
  image_url: string
  alt_text: string | null
  is_primary: boolean | null
  sort_order: number | null
  created_at: string | null
}

export interface FacilityAmenity {
  id: string
  facility_id: string
  name: string
  icon_name: string | null
  created_at: string | null
}

export interface FacilityFeature {
  id: string
  facility_id: string
  name: string
  created_at: string | null
}

export interface FacilityBooking {
  id: string
  facility_id: string
  user_id: string
  booking_date: string
  start_time: string
  end_time: string
  duration_hours: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests: string | null
  cancellation_reason: string | null
  cancelled_at: string | null
  confirmed_at: string | null
  completed_at: string | null
  created_at: string | null
  updated_at: string | null
  // Relations
  facility?: Facility
  user?: FacilityUser
}

export interface FacilityUserReview {
  id: string
  facility_id: string
  user_id: string
  booking_id: string | null
  rating: number
  comment: string | null
  is_verified: boolean | null
  owner_response: string | null
  owner_response_date: string | null
  created_at: string | null
  updated_at: string | null
  // Relations
  user?: FacilityUser
  facility?: Facility
  booking?: FacilityBooking
}

export interface FacilityReviewSection {
  status: 'approved' | 'needs_changes' | 'pending'
  comments?: string
}

export interface FacilityReview {
  id: string
  facility_id: string
  reviewer_id: string | null
  status: 'pending' | 'approved' | 'needs_changes'
  
  // Section-by-section review fields
  basic_info_status: 'approved' | 'needs_changes' | 'pending'
  basic_info_comments?: string
  
  description_status: 'approved' | 'needs_changes' | 'pending'
  description_comments?: string
  
  location_status: 'approved' | 'needs_changes' | 'pending'
  location_comments?: string
  
  pricing_status: 'approved' | 'needs_changes' | 'pending'
  pricing_comments?: string
  
  amenities_status: 'approved' | 'needs_changes' | 'pending'
  amenities_comments?: string
  
  features_status: 'approved' | 'needs_changes' | 'pending'
  features_comments?: string
  
  images_status: 'approved' | 'needs_changes' | 'pending'
  images_comments?: string
  
  policies_status: 'approved' | 'needs_changes' | 'pending'
  policies_comments?: string
  
  // Overall review comments
  general_comments?: string
  internal_notes?: string
  
  created_at: string | null
  updated_at: string | null
  
  // Relations
  facility?: Facility
  reviewer?: FacilityUser
}

// Legacy interfaces for backward compatibility (can be removed later)
export interface Review {
  id: string
  user: string
  rating: number
  date: string
  comment: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  userType: 'renter' | 'owner'
  avatar?: string
}

export interface Booking {
  id: string
  facilityId: string
  userId: string
  date: string
  timeSlot: string
  duration: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: any
  description: string
  count: string
  color: string
}