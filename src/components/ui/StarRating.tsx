'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;

        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
            className={cn(
              'relative shrink-0',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizes[size],
                filled
                  ? 'fill-[#FACC15] text-[#FACC15]'
                  : partial
                  ? 'fill-[#FDE68A] text-[#FACC15]'
                  : 'fill-none text-[#CBD5E1]'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingDisplay({ rating, count, size = 'md' }: RatingDisplayProps) {
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={rating} size={size} />
      <span className={cn('font-semibold text-[#0F172A]', textSizes[size])}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={cn('text-[#64748B]', textSizes[size])}>({count})</span>
      )}
    </div>
  );
}
