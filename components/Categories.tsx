import Link from 'next/link'
import { Dumbbell, Waves, Trophy, Users, Zap, Target } from 'lucide-react'

const categories = [
  {
    id: 'gyms',
    name: 'Gyms & Fitness',
    icon: Dumbbell,
    description: 'Fully equipped gyms and fitness centers',
    count: '250+ facilities',
    color: 'bg-red-500'
  },
  {
    id: 'pools',
    name: 'Swimming Pools',
    icon: Waves,
    description: 'Indoor and outdoor swimming pools',
    count: '180+ facilities',
    color: 'bg-blue-500'
  },
  {
    id: 'courts',
    name: 'Sports Courts',
    icon: Trophy,
    description: 'Basketball, tennis, volleyball courts',
    count: '320+ facilities',
    color: 'bg-green-500'
  },
  {
    id: 'fields',
    name: 'Sports Fields',
    icon: Target,
    description: 'Soccer, football, baseball fields',
    count: '150+ facilities',
    color: 'bg-yellow-500'
  },
  {
    id: 'studios',
    name: 'Dance Studios',
    icon: Zap,
    description: 'Dance and yoga studios',
    count: '120+ facilities',
    color: 'bg-purple-500'
  },
  {
    id: 'events',
    name: 'Event Spaces',
    icon: Users,
    description: 'Multi-purpose event and meeting spaces',
    count: '90+ facilities',
    color: 'bg-indigo-500'
  }
]

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect facility for your activity. From gyms to courts, we have spaces for every sport and occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${category.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {category.description}
                    </p>
                    <p className="text-primary-600 text-sm font-medium">
                      {category.count}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
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