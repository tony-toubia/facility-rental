import Hero from '@/components/Hero'
import FeaturedFacilities from '@/components/FeaturedFacilities'
import HowItWorks from '@/components/HowItWorks'
import Categories from '@/components/Categories'

export default function Home() {
  return (
    <div>
      <Hero />
      <Categories />
      <FeaturedFacilities />
      <HowItWorks />
    </div>
  )
}