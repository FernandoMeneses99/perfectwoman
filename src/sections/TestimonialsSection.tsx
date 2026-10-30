import { useEffect, useState } from 'react'
import { FaQuoteLeft } from 'react-icons/fa'
import StarRating from '../components/ui/StarRating'
import {
  fetchPublicReviewSummary,
  fetchPublicReviews,
} from '../lib/reviews'
import type { PublicReview, PublicReviewSummary } from '../lib/reviews'

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [summary, setSummary] = useState<PublicReviewSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([fetchPublicReviews(9), fetchPublicReviewSummary()])
      .then(([reviewRows, reviewSummary]) => {
        if (active) {
          setReviews(reviewRows)
          setSummary(reviewSummary)
        }
      })
      .catch(() => {
        if (active) {
          setReviews([])
          setSummary(null)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const hasReviews = reviews.length > 0

  return (
    <section
      id="opiniones"
      className="w-full bg-surface-container px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Opiniones
          </span>
          <h2 className="mt-1 font-headline-lg text-headline-lg-mobile uppercase tracking-tight text-primary md:text-headline-lg">
            Experiencias de clientas
          </h2>
          <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
            Las opiniones se comparten con autorización de sus autoras.
          </p>
        </div>

        {loading && (
          <div
            aria-label="Cargando opiniones"
            className="mt-space-2xl grid grid-cols-1 gap-gutter md:grid-cols-3"
          >
            {[0, 1, 2].map((item) => (
              <div
                className="h-52 animate-pulse border border-outline-variant/30 bg-surface-container-lowest"
                key={item}
              />
            ))}
          </div>
        )}

        {!loading && !hasReviews && (
          <div className="mt-space-2xl border-y border-outline-variant/50 py-space-xl text-center">
            <p className="font-editorial text-3xl italic text-primary sm:text-4xl">
              Espacio reservado para opiniones autorizadas
            </p>
          </div>
        )}

        {!loading && hasReviews && (
          <>
            <div className="mt-space-lg flex flex-col items-center justify-center gap-2 text-center">
              <StarRating
                rating={summary?.averageRating ?? 0}
                showValue
                size="lg"
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {summary?.averageRating?.toFixed(1) ?? 'Nuevo'} de 5 ·{' '}
                {summary?.reviewCount ?? reviews.length}{' '}
                {(summary?.reviewCount ?? reviews.length) === 1
                  ? 'opinión publicada'
                  : 'opiniones publicadas'}
              </p>
            </div>

            <div className="mt-space-2xl grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <article
                  className="flex h-full flex-col border border-outline-variant/35 bg-surface-container-lowest p-space-lg shadow-sm"
                  key={review.id}
                >
                  <FaQuoteLeft
                    aria-hidden="true"
                    className="text-[18px] text-secondary/40"
                  />
                  <p className="mt-space-sm line-clamp-6 flex-1 font-editorial text-xl italic leading-relaxed text-primary">
                    “{review.message}”
                  </p>
                  <div className="mt-space-lg border-t border-surface-container pt-space-md">
                    <StarRating rating={review.rating} size="sm" />
                    <p className="mt-2 font-label-caps text-[10px] uppercase tracking-wider text-primary">
                      {review.display_name}
                    </p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">
                      Clienta de Perfect Woman T
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
