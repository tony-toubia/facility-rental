import { Search, Calendar, CreditCard, Play } from 'lucide-react'

const steps = [
  {
    id: 1,
    title: 'Search & Discover',
    description: 'Browse facilities by location, type, and availability. Use filters to find exactly what you need.',
    icon: Search,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Book Your Slot',
    description: 'Select your preferred date and time. View real-time availability and pricing.',
    icon: Calendar,
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: 'Secure Payment',
    description: 'Pay securely online with our encrypted payment system. Get instant confirmation.',
    icon: CreditCard,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    title: 'Enjoy Your Activity',
    description: 'Show up and enjoy your booked facility. Rate your experience to help others.',
    icon: Play,
    color: 'bg-orange-500'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Booking your perfect facility is simple and straightforward. Get started in just a few clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={step.id} className="text-center relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gray-300 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white border-4 border-gray-200 rounded-full text-lg font-bold text-gray-600 mb-4">
                    {step.id}
                  </div>

                  {/* Icon */}
                  <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who have found their perfect facility through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-3">
                Find Facilities
              </button>
              <button className="btn-secondary text-lg px-8 py-3">
                List Your Facility
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}