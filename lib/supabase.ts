import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our facility schema
export type Database = {
  public: {
    Tables: {
      facility_users: {
        Row: {
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
        Insert: {
          id?: string
          auth_user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          user_type?: 'renter' | 'owner' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          is_verified?: boolean | null
          rating?: number | null
          total_bookings?: number | null
          total_listings?: number | null
          joined_date?: string | null
          last_active?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          user_type?: 'renter' | 'owner' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          is_verified?: boolean | null
          rating?: number | null
          total_bookings?: number | null
          total_listings?: number | null
          joined_date?: string | null
          last_active?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      facility_categories: {
        Row: {
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
        Insert: {
          id: string
          name: string
          description?: string | null
          icon_name?: string | null
          color?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_name?: string | null
          color?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      facility_facilities: {
        Row: {
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
        }
        Insert: {
          id?: string
          owner_id: string
          category_id?: string | null
          name: string
          type: string
          description?: string | null
          address: string
          city: string
          state: string
          zip_code: string
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          price: number
          price_unit?: 'hour' | 'day' | 'session'
          capacity?: number | null
          min_booking_duration?: number | null
          max_booking_duration?: number | null
          advance_booking_days?: number | null
          cancellation_policy?: string | null
          house_rules?: string | null
          status?: 'active' | 'inactive' | 'pending_approval' | 'suspended' | 'pending_review' | 'needs_changes' | 'approved'
          is_active?: boolean
          is_featured?: boolean | null
          rating?: number | null
          review_count?: number | null
          total_bookings?: number | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          category_id?: string | null
          name?: string
          type?: string
          description?: string | null
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          price?: number
          price_unit?: 'hour' | 'day' | 'session'
          capacity?: number | null
          min_booking_duration?: number | null
          max_booking_duration?: number | null
          advance_booking_days?: number | null
          cancellation_policy?: string | null
          house_rules?: string | null
          status?: 'active' | 'inactive' | 'pending_approval' | 'suspended' | 'pending_review' | 'needs_changes' | 'approved'
          is_active?: boolean
          is_featured?: boolean | null
          rating?: number | null
          review_count?: number | null
          total_bookings?: number | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      facility_images: {
        Row: {
          id: string
          facility_id: string
          image_url: string
          alt_text: string | null
          is_primary: boolean | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          facility_id: string
          image_url: string
          alt_text?: string | null
          is_primary?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          facility_id?: string
          image_url?: string
          alt_text?: string | null
          is_primary?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      facility_amenities: {
        Row: {
          id: string
          facility_id: string
          name: string
          icon_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          icon_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          icon_name?: string | null
          created_at?: string | null
        }
      }
      facility_features: {
        Row: {
          id: string
          facility_id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          created_at?: string | null
        }
      }
      facility_bookings: {
        Row: {
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
        }
        Insert: {
          id?: string
          facility_id: string
          user_id: string
          booking_date: string
          start_time: string
          end_time: string
          duration_hours: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          duration_hours?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      facility_reviews: {
        Row: {
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
        }
        Insert: {
          id?: string
          facility_id: string
          user_id: string
          booking_id?: string | null
          rating: number
          comment?: string | null
          is_verified?: boolean | null
          owner_response?: string | null
          owner_response_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          booking_id?: string | null
          rating?: number
          comment?: string | null
          is_verified?: boolean | null
          owner_response?: string | null
          owner_response_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}