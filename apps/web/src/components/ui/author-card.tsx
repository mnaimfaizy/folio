import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Book as BookIcon,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface AuthorCardBook {
  id: number;
  title: string;
  cover?: string;
}

export interface AuthorCardProps {
  id?: number;
  name: string;
  photoUrl?: string;
  biography?: string;
  birthDate?: string;
  bookCount?: number;
  books?: AuthorCardBook[];
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function AuthorCard({
  id,
  name,
  photoUrl,
  biography,
  birthDate,
  bookCount = 0,
  books = [],
  variant = 'default',
  className,
}: AuthorCardProps) {
  const avatarUrl =
    photoUrl ||
    `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`;

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'group overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900',
          className,
        )}
      >
        <div className="flex items-center gap-4 p-4">
          <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all">
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`;
              }}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <BookIcon className="h-3.5 w-3.5" />
              <span>{bookCount} works</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0" asChild>
            <Link to={`/authors/${id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
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
      {/* Author Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 p-6 pb-8">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-lg group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition-all">
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`;
                }}
              />
            </div>
            {/* Online indicator style badge */}
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
              <div className="bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center">
                <BookIcon className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl leading-tight line-clamp-1 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <BookIcon className="h-3 w-3 mr-1" />
                {bookCount} works
              </Badge>
              {birthDate && (
                <Badge
                  variant="outline"
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {birthDate}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="pt-4 pb-2 flex-1">
        {biography && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
            {biography}
          </p>
        )}

        {/* Books Preview */}
        {books && books.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Featured Works
            </p>
            <div className="flex gap-2">
              {books.slice(0, 3).map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="group/book relative w-14 h-20 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                  title={book.title}
                >
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/56x80/e2e8f0/64748b?text=${encodeURIComponent(book.title.slice(0, 2))}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <BookIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/book:bg-black/20 transition-colors" />
                </Link>
              ))}
              {/* Placeholder slots */}
              {Array.from({ length: Math.max(0, 3 - books.length) }).map(
                (_, idx) => (
                  <div
                    key={`placeholder-${idx}`}
                    className="w-14 h-20 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700"
                  >
                    <BookIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-4 pb-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          className="w-full group/btn bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
          asChild
        >
          <Link to={`/authors/${id}`}>
            View Profile
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
