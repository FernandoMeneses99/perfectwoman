import SiteHeader from '../components/layout/SiteHeader'
import SiteFooter from '../components/layout/SiteFooter'
import { usePageMeta } from '../lib/seo'
import HeroSection from '../sections/HeroSection'
import MetricsSection from '../sections/MetricsSection'
import FeaturedServices from '../sections/FeaturedServices'
import SpecialistSection from '../sections/SpecialistSection'
import GallerySection from '../sections/GallerySection'
import TestimonialsSection from '../sections/TestimonialsSection'
import BookingCTA from '../sections/BookingCTA'
import FloatingClientActions from '../components/FloatingClientActions'
import { useSiteContent } from '../lib/siteContentContext'

export default function Home() {
  const { content } = useSiteContent()

  usePageMeta({
    title: content.seo.title,
    description: content.seo.description,
    image: content.seo.image,
    path: '/',
  })

  return (
    <>
      <SiteHeader />
      <main className="w-full pt-20 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          <HeroSection />
          <MetricsSection />
          <FeaturedServices />
          <SpecialistSection />
          <GallerySection />
          <TestimonialsSection />
          <BookingCTA />
        </div>
      </main>
      <SiteFooter />
      <FloatingClientActions />
    </>
  )
}
