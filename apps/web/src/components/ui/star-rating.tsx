// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-ui\src\components\ui\star-rating.tsx
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import React from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const sizeClass = sizes[size];

  return (
    <div
      className={cn("flex items-center", className)}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isActive = interactive
          ? starValue <= (hoverRating || rating)
          : starValue <= rating;

        return (
          <Star
            key={i}
            role={interactive ? "button" : undefined} // Add role="button" when interactive
            data-testid={isActive ? "filled-star" : "empty-star"} // Add data-testid
            className={cn(
              sizeClass,
              "transition-all duration-100",
              isActive ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
              interactive && "cursor-pointer hover:scale-110"
            )}
            onClick={() => {
              if (interactive && onRatingChange) {
                // Toggle off if clicking the same star
                onRatingChange(
                  rating === starValue ? starValue - 1 : starValue
                );
              }
            }}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
          />
        );
      })}

      {/* Display numeric rating if not interactive */}
      {!interactive && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  );
}
