import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half = !filled && i < rating && i + 1 > rating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            disabled={!interactive}
            className={cn(
              'relative transition-transform duration-150',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
          >
            {/* Empty star background */}
            <Star
              className={cn(
                sizeMap[size],
                'text-surface-300 dark:text-surface-600'
              )}
            />
            {/* Filled overlay */}
            {(filled || half) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: half ? '50%' : '100%' }}
              >
                <Star
                  className={cn(sizeMap[size], 'text-amber-400 fill-amber-400')}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
