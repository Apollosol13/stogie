'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  size?: number;
  color?: string;
  inactiveColor?: string;
  onPress?: (rating: number) => void;
  disabled?: boolean;
}

export default function StarRating({
  rating = 0,
  size = 16,
  color = "#D4B896",
  inactiveColor = "#6B7280",
  onPress,
  disabled = false,
}: StarRatingProps) {
  const handleStarClick = (starIndex: number) => {
    if (onPress && !disabled) {
      onPress(starIndex + 1);
    }
  };

  return (
    <div className="flex flex-row gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const isActive = i < Math.round(rating);

        if (onPress && !disabled) {
          return (
            <button
              key={i}
              onClick={() => handleStarClick(i)}
              className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
              type="button"
            >
              <Star
                size={size}
                color={isActive ? color : inactiveColor}
                fill={isActive ? color : "transparent"}
              />
            </button>
          );
        }

        return (
          <div key={i} className="p-0.5">
            <Star
              size={size}
              color={isActive ? color : inactiveColor}
              fill={isActive ? color : "transparent"}
            />
          </div>
        );
      })}
    </div>
  );
}

