export interface Facility {
  id: number
  name: string
  type: string
  location: string
  address?: string
  rating: number
  reviewCount: number
  price: number
  priceUnit: string
  image: string
  images?: string[]
  features: string[]
  amenities?: Array<{
    name: string
    icon: any
  }>
  availability: string
  description?: string
  capacity?: number
  owner?: {
    name: string
    rating: number
    responseTime: string
    joinedDate: string
  }
}

export interface Review {
  id: number
  user: string
  rating: number
  date: string
  comment: string
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  userType: 'renter' | 'owner'
  avatar?: string
}

export interface Booking {
  id: number
  facilityId: number
  userId: number
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