import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BookmarkCheck,
  BookmarkPlus,
  Eye,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BookCardProps {
  id?: number;
  title: string;
  author?: string;
  genre?: string;
  publishYear?: number;
  description?: string;
  coverImage?: string;
  cover?: string;
  rating?: number;
  isInCollection?: boolean;
  showCollectionButton?: boolean;
  onAddToCollection?: (id: number) => void;
  onRemoveFromCollection?: (id: number) => void;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function BookCard({
  id,
  title,
  author,
  genre,
  publishYear,
  description,
  coverImage,
  cover,
  rating = 4.5,
  isInCollection = false,
  showCollectionButton = false,
  onAddToCollection,
  onRemoveFromCollection,
  variant = 'default',
  className,
}: BookCardProps) {
  const coverUrl =
    coverImage ||
    cover ||
    `https://placehold.co/200x300/e2e8f0/64748b?text=${encodeURIComponent(title.slice(0, 10))}`;

  const handleCollectionClick = () => {
    if (!id) return;
    if (isInCollection) {
      onRemoveFromCollection?.(id);
    } else {
      onAddToCollection?.(id);
    }
  };

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'group overflow-hidden rounded-xl py-0!',
          'border border-gray-200/80 dark:border-gray-800',
          'bg-white dark:bg-gray-950',
          'shadow-[0_1px_3px_rgba(0,0,0,.06),0_4px_12px_rgba(0,0,0,.04)]',
          'hover:shadow-[0_4px_16px_rgba(0,0,0,.1),0_12px_28px_rgba(0,0,0,.08)]',
          'hover:-translate-y-0.5',
          'transition-all duration-300 ease-out',
          className,
        )}
      >
        <div className="flex gap-4 p-4">
          <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm">
            <img
              src={coverUrl}
              alt={`${title} cover`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <Badge
              variant="outline"
              className="self-start mb-2 text-[11px] rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              {genre || 'Uncategorized'}
            </Badge>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {author} {publishYear && `(${publishYear})`}
            </p>
            <div className="mt-auto pt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {rating.toFixed(1)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-8 px-3 rounded-lg"
                asChild
              >
                <Link to={`/books/${id}`}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-2xl flex flex-col',
        'py-0! gap-0!',
        'border border-gray-200/60 dark:border-gray-800',
        'bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-900/80 dark:to-gray-950',
        'shadow-[0_2px_8px_rgba(0,0,0,.06),0_8px_24px_rgba(0,0,0,.04)]',
        'hover:shadow-[0_8px_24px_rgba(0,0,0,.1),0_16px_40px_rgba(0,0,0,.08)]',
        'hover:-translate-y-1',
        'transition-all duration-300 ease-out',
        variant === 'featured' &&
          'shadow-lg ring-1 ring-gray-200/60 dark:ring-gray-700/60',
        className,
      )}
    >
      {/* Cover Image Section — inset with padding */}
      <div className="relative px-4 pt-4 pb-2">
        {/* Genre Badge — centered, overlapping top of cover */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gray-800/90 dark:bg-gray-200/90 text-white dark:text-gray-900 backdrop-blur-sm shadow-md border-0 font-semibold text-[11px] uppercase tracking-wider px-4 py-1 rounded-full">
            {genre || 'Uncategorized'}
          </Badge>
        </div>

        {/* Collection Badge — top-left corner */}
        {isInCollection && (
          <div className="absolute top-2 left-6 z-10">
            <Badge className="bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm border-0 text-[10px] px-2 py-0.5 rounded-full">
              <BookmarkCheck className="h-3 w-3 mr-0.5" />
              Saved
            </Badge>
          </div>
        )}

        <div className="relative rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.12)] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 aspect-[3/4]">
          <img
            src={coverUrl}
            alt={`${title} cover`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      </div>

      {/* Star Rating — centered below cover */}
      <div className="flex items-center justify-center gap-1.5 py-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-4 w-4',
                star <= Math.floor(rating)
                  ? 'text-amber-500 fill-amber-500'
                  : star === Math.ceil(rating) && rating % 1 > 0
                    ? 'text-amber-500 fill-amber-500/50'
                    : 'text-gray-300 dark:text-gray-600',
              )}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-0.5">
          {rating.toFixed(1)}/5
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-200/80 dark:border-gray-800" />

      {/* Content Section */}
      <CardHeader className="px-4! pb-0! pt-3! gap-0.5!">
        <CardTitle className="text-[15px] font-bold uppercase tracking-wide leading-snug line-clamp-2 text-gray-900 dark:text-gray-50">
          {title}
        </CardTitle>
        <CardDescription className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {author && <>By {author}</>}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4! pt-2! flex-1">
        <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-relaxed line-clamp-3">
          {description || 'No description available.'}
        </p>
      </CardContent>

      {/* Footer — View Details button + year */}
      <CardFooter className="px-4! pt-2! pb-4! gap-3">
        <Button
          className="group/btn rounded-full h-10 px-6 text-sm font-semibold uppercase tracking-wide bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 shadow-sm"
          asChild
        >
          <Link to={`/books/${id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Link>
        </Button>

        {publishYear && (
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500 ml-auto">
            {publishYear}
          </span>
        )}

        {showCollectionButton && (
          <Button
            variant={isInCollection ? 'secondary' : 'outline'}
            size="icon"
            className={cn(
              'shrink-0 rounded-full h-10 w-10 transition-colors',
              isInCollection
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                : 'border-gray-200 dark:border-gray-700',
              !publishYear && 'ml-auto',
            )}
            onClick={handleCollectionClick}
            aria-label={
              isInCollection ? 'Remove from collection' : 'Add to collection'
            }
            title={
              isInCollection ? 'Remove from collection' : 'Add to collection'
            }
          >
            {isInCollection ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <BookmarkPlus className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
