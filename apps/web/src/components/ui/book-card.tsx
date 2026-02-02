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
          'group overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900',
          className,
        )}
      >
        <div className="flex gap-4 p-4">
          <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <img
              src={coverUrl}
              alt={`${title} cover`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <Badge
              variant="outline"
              className="self-start mb-2 text-xs bg-gray-50 dark:bg-gray-800"
            >
              {genre || 'Uncategorized'}
            </Badge>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                className="ml-auto h-8 px-3"
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
        'group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 flex flex-col',
        variant === 'featured' && 'shadow-lg',
        className,
      )}
    >
      {/* Cover Image Section */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <img
          src={coverUrl}
          alt={`${title} cover`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Genre Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-200 backdrop-blur-sm shadow-sm border-0 font-medium">
            {genre || 'Uncategorized'}
          </Badge>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Collection Badge */}
        {isInCollection && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-emerald-500/95 text-white backdrop-blur-sm shadow-sm border-0">
              <BookmarkCheck className="h-3 w-3 mr-1" />
              In Collection
            </Badge>
          </div>
        )}

        {/* Quick View on Hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg border-0"
            asChild
          >
            <Link to={`/books/${id}`}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Quick View
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
          {author}
          {publishYear && (
            <span className="text-gray-400 dark:text-gray-500">
              • {publishYear}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3 pt-0 flex-1">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {description || 'No description available.'}
        </p>
      </CardContent>

      {/* Footer with Actions */}
      <CardFooter className="pt-0 pb-4 gap-2">
        <Button
          className="flex-1 group/btn bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
          asChild
        >
          <Link to={`/books/${id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>

        {showCollectionButton && (
          <Button
            variant={isInCollection ? 'secondary' : 'outline'}
            size="icon"
            className={cn(
              'flex-shrink-0 transition-colors',
              isInCollection &&
                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
            )}
            onClick={handleCollectionClick}
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
