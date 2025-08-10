'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MapPin, Clock, DollarSign, Wifi, Car, Users, Shield, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

// Mock data for facility details
const facilityData = {
  id: 1,
  name: 'Elite Fitness Center',
  type: 'Gym & Fitness',
  location: 'Downtown, New York',
  address: '123 Fitness Street, New York, NY 10001',
  rating: 4.8,
  reviewCount: 124,
  price: 25,
  priceUnit: 'hour',
  description: 'A state-of-the-art fitness center equipped with the latest equipment and amenities. Perfect for personal training, group workouts, or individual fitness sessions.',
  images: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop'
  ],
  amenities: [
    { name: 'Free WiFi', icon: Wifi },
    { name: 'Parking Available', icon: Car },
    { name: 'Group Classes', icon: Users },
    { name: 'Security System', icon: Shield }
  ],
  features: [
    'Full Equipment Set',
    'Personal Training Available',
    'Locker Rooms',
    'Shower Facilities',
    'Air Conditioning',
    'Sound System',
    'Mirrors',
    'Rubber Flooring'
  ],
  availability: {
    today: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '6:00 PM'],
    tomorrow: ['8:00 AM', '9:00 AM', '11:00 AM', '1:00 PM', '4:00 PM', '7:00 PM']
  },
  owner: {
    name: 'John Smith',
    rating: 4.9,
    responseTime: '< 1 hour',
    joinedDate: 'Member since 2020'
  },
  reviews: [
    {
      id: 1,
      user: 'Sarah Johnson',
      rating: 5,
      date: '2 days ago',
      comment: 'Amazing facility with top-notch equipment. Very clean and well-maintained.'
    },
    {
      id: 2,
      user: 'Mike Chen',
      rating: 4,
      date: '1 week ago',
      comment: 'Great gym with everything you need. The owner is very responsive and helpful.'
    },
    {
      id: 3,
      user: 'Emily Davis',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Perfect for my training sessions. Highly recommend!'
    }
  ]
}

export default function FacilityDetailPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState('today')
  const [selectedTime, setSelectedTime] = useState('')

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % facilityData.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + facilityData.images.length) % facilityData.images.length)
  }

  const handleBooking = () => {
    if (selectedTime) {
      // Handle booking logic here
      alert(`Booking confirmed for ${selectedDate} at ${selectedTime}`)
    } else {
      alert('Please select a time slot')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={facilityData.images[currentImageIndex]}
                  alt={facilityData.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {facilityData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                      index === currentImageIndex ? 'ring-2 ring-primary-600' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${facilityData.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Facility Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-primary-600 font-medium">{facilityData.type}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{facilityData.rating}</span>
                  <span className="text-gray-500">({facilityData.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{facilityData.name}</h1>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{facilityData.address}</span>
              </div>

              <p className="text-gray-700 mb-6">{facilityData.description}</p>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {facilityData.amenities.map((amenity, index) => {
                    const IconComponent = amenity.icon
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <IconComponent className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700">{amenity.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {facilityData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Reviews</h3>
              <div className="space-y-6">
                {facilityData.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {review.user.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{review.user}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 text-gray-900" />
                  <span className="text-2xl font-bold text-gray-900">{facilityData.price}</span>
                  <span className="text-gray-600">/{facilityData.priceUnit}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Date</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedDate('today')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      selectedDate === 'today'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setSelectedDate('tomorrow')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      selectedDate === 'tomorrow'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Available Times</h4>
                <div className="grid grid-cols-2 gap-2">
                  {facilityData.availability[selectedDate as keyof typeof facilityData.availability].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-lg border text-sm ${
                        selectedTime === time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                className="w-full btn-primary text-lg py-3 mb-6"
              >
                Book Now
              </button>

              {/* Owner Info */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Hosted by</h4>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                    {facilityData.owner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{facilityData.owner.name}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{facilityData.owner.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Response time: {facilityData.owner.responseTime}</p>
                  <p>{facilityData.owner.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}