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

export default function Home() {
  usePageMeta({
    title: 'Perfect Woman T | Pestañas, cejas y belleza en Bogotá',
    description: 'Estudio de mirada y belleza en Bogotá. Reserva pestañas, cejas, lifting, depilación y cuidado facial con precisión visagista.',
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
    </>
  )
}
