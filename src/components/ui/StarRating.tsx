import { FaRegStar, FaStar } from 'react-icons/fa'

type StarRatingProps = {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'text-[12px]',
  md: 'text-[16px]',
  lg: 'text-[22px]',
}

export default function StarRating({
  rating,
  size = 'md',
  showValue = false,
  className = '',
}: StarRatingProps) {
  const normalized = Math.max(0, Math.min(5, rating))
  const filledStars = Math.round(normalized)

  return (
    <span
      aria-label={`${normalized.toFixed(1)} de 5 estrellas`}
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
    >
      <span aria-hidden="true" className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) =>
          star <= filledStars ? (
            <FaStar className="text-brand-pink" key={star} />
          ) : (
            <FaRegStar className="text-outline-variant" key={star} />
          ),
        )}
      </span>
      {showValue && (
        <span className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
          {normalized.toFixed(1)}
        </span>
      )}
    </span>
  )
}
