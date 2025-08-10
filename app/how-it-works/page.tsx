import { Search, Calendar, CreditCard, Play, Users, Shield, Clock, Star } from 'lucide-react'

const steps = [
  {
    id: 1,
    title: 'Search & Discover',
    description: 'Browse facilities by location, type, and availability. Use our advanced filters to find exactly what you need.',
    icon: Search,
    color: 'bg-blue-500',
    details: [
      'Search by facility type, location, or name',
      'Filter by price range, amenities, and availability',
      'View detailed photos and descriptions',
      'Read reviews from other users'
    ]
  },
  {
    id: 2,
    title: 'Book Your Slot',
    description: 'Select your preferred date and time. View real-time availability and pricing information.',
    icon: Calendar,
    color: 'bg-green-500',
    details: [
      'Check real-time availability',
      'Select date and time slots',
      'View transparent pricing',
      'Add special requests or notes'
    ]
  },
  {
    id: 3,
    title: 'Secure Payment',
    description: 'Pay securely online with our encrypted payment system. Get instant confirmation via email.',
    icon: CreditCard,
    color: 'bg-purple-500',
    details: [
      'Multiple payment options accepted',
      'SSL encrypted secure transactions',
      'Instant booking confirmation',
      'Digital receipts and invoices'
    ]
  },
  {
    id: 4,
    title: 'Enjoy Your Activity',
    description: 'Show up and enjoy your booked facility. Rate your experience to help the community.',
    icon: Play,
    color: 'bg-orange-500',
    details: [
      'Receive booking details and directions',
      'Contact facility owner if needed',
      'Enjoy your reserved time slot',
      'Leave a review after your visit'
    ]
  }
]

const benefits = [
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect with local facility owners and fellow sports enthusiasts in your area.'
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'All payments are processed securely and facility owners are verified.'
  },
  {
    icon: Clock,
    title: 'Flexible Booking',
    description: 'Book by the hour, day, or session. Cancel or reschedule with ease.'
  },
  {
    icon: Star,
    title: 'Quality Assured',
    description: 'Read reviews and ratings to ensure you get the best facilities.'
  }
]

const faqs = [
  {
    question: 'How do I book a facility?',
    answer: 'Simply search for facilities in your area, select your preferred date and time, and complete the secure payment process. You&apos;ll receive instant confirmation.'
  },
  {
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes, you can cancel or reschedule your booking up to 24 hours before your reserved time slot. Cancellation policies may vary by facility.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and digital payment methods like PayPal and Apple Pay.'
  },
  {
    question: 'How do I list my facility?',
    answer: 'Click on "List Your Facility" in the navigation menu, fill out the detailed form with your facility information, and submit for review. We&apos;ll get back to you within 24 hours.'
  },
  {
    question: 'Is there a booking fee?',
    answer: 'We charge a small service fee to cover payment processing and platform maintenance. This fee is clearly displayed before you complete your booking.'
  },
  {
    question: 'What if I have issues with a facility?',
    answer: 'Contact our support team immediately. We&apos;re here to help resolve any issues and ensure you have a great experience.'
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How FacilityRent Works
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover how easy it is to find and book the perfect facility for your needs. 
              From search to play, we've made the process simple and secure.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Booking your perfect facility is just four easy steps away.
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              const isEven = index % 2 === 0

              return (
                <div key={step.id} className={`flex flex-col lg:flex-row items-center gap-12 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border-4 border-gray-200 rounded-full text-lg font-bold text-gray-600 mr-4">
                        {step.id}
                      </div>
                      <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-gray-700">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <div className={`${step.color} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-gray-600">
                        Step {step.id} illustration would go here
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FacilityRent?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best experience for both facility renters and owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who have found their perfect facility through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Find Facilities
            </button>
            <button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              List Your Facility
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}