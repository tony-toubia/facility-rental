import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Clock, DollarSign } from 'lucide-react'

// Mock data for featured facilities
const featuredFacilities = [
  {
    id: 1,
    name: 'Elite Fitness Center',
    type: 'Gym & Fitness',
    location: 'Downtown, New York',
    rating: 4.8,
    reviewCount: 124,
    price: 25,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop',
    features: ['Full Equipment', 'Personal Training', 'Locker Rooms'],
    availability: 'Available Today'
  },
  {
    id: 2,
    name: 'Aqua Sports Complex',
    type: 'Swimming Pool',
    location: 'Westside, Los Angeles',
    rating: 4.9,
    reviewCount: 89,
    price: 40,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop',
    features: ['Olympic Size', 'Heated Pool', 'Diving Board'],
    availability: 'Available Tomorrow'
  },
  {
    id: 3,
    name: 'Championship Courts',
    type: 'Basketball Court',
    location: 'Midtown, Chicago',
    rating: 4.7,
    reviewCount: 156,
    price: 35,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=300&fit=crop',
    features: ['Professional Court', 'Sound System', 'Scoreboard'],
    availability: 'Available Now'
  },
  {
    id: 4,
    name: 'Zen Yoga Studio',
    type: 'Yoga Studio',
    location: 'Brooklyn, New York',
    rating: 4.9,
    reviewCount: 67,
    price: 20,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=500&h=300&fit=crop',
    features: ['Peaceful Environment', 'Props Included', 'Natural Light'],
    availability: 'Available Today'
  }
]

export default function FeaturedFacilities() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Facilities
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover top-rated facilities in your area. These venues are loved by our community for their quality and service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredFacilities.map((facility) => (
            <Link
              key={facility.id}
              href={`/facility/${facility.id}`}
              className="card overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="relative h-48">
                <Image
                  src={facility.image}
                  alt={facility.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-green-600">
                  {facility.availability}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-600 font-medium">{facility.type}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{facility.rating}</span>
                    <span className="text-sm text-gray-500">({facility.reviewCount})</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {facility.name}
                </h3>

                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {facility.location}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {facility.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-900">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{facility.price}</span>
                    <span className="text-sm text-gray-600">/{facility.priceUnit}</span>
                  </div>
                  <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                    View Details →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/browse" className="btn-primary text-lg px-8 py-3">
            View All Facilities
          </Link>
        </div>
      </div>
    </section>
  )
}