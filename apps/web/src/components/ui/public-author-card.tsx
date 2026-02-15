import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Book as BookIcon, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authorService } from '@/services/authorService';

export interface PublicAuthorCardProps {
  id?: number;
  name: string;
  photoUrl?: string;
  biography?: string;
  birthDate?: string;
  bookCount?: number;
  rating?: number;
  className?: string;
}

export function PublicAuthorCard({
  id,
  name,
  photoUrl,
  biography,
  bookCount = 0,
  rating = 4.7,
  className,
}: PublicAuthorCardProps) {
  const [books, setBooks] = useState<Array<{ id: number; title: string }>>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!id) return;
      try {
        setIsLoadingBooks(true);
        const authorData = await authorService.getAuthorById(id);
        setBooks(authorData.books?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching author books:', error);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [id]);

  const avatarUrl =
    photoUrl ||
    `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div className={cn('relative w-full max-w-sm mx-auto', className)}>
      {/* Scroll Top Roller */}
      <div className="relative h-3 mb-1.5">
        <div className="absolute inset-0 bg-linear-to-b from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-full shadow-lg" />
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-1 bg-amber-900 dark:bg-amber-950 opacity-30" />
      </div>

      {/* Main Scroll Paper */}
      <Card
        className={cn(
          'relative overflow-visible flex flex-col',
          // Parchment/vintage paper effect
          'bg-linear-to-br from-amber-50 via-yellow-50 to-amber-100',
          'dark:from-amber-950 dark:via-yellow-950 dark:to-amber-900',
          'border-x-4 border-amber-700 dark:border-amber-800',
          'border-y-0',
          'shadow-[4px_0_12px_rgba(120,53,15,0.2),-4px_0_12px_rgba(120,53,15,0.2)]',
          'hover:shadow-[6px_0_16px_rgba(120,53,15,0.3),-6px_0_16px_rgba(120,53,15,0.3)]',
          'transition-all duration-300',
        )}
      >
        {/* Decorative scroll top edge */}
        <div className="absolute -top-1 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-600 dark:via-amber-800 to-transparent" />

        {/* Content */}
        <div className="relative flex flex-col items-center px-6 py-6">
          {/* Ornamental top divider */}
          <div className="w-full flex items-center justify-center mb-3">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-400 dark:via-amber-700 to-transparent" />
            <div className="mx-3 w-2 h-2 rotate-45 bg-amber-500 dark:bg-amber-600" />
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-400 dark:via-amber-700 to-transparent" />
          </div>

          {/* Author Image */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-600 dark:border-amber-700 shadow-xl bg-white dark:bg-gray-800">
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
          </div>

          {/* Author Name */}
          <h2
            className="text-2xl font-bold text-center text-amber-950 dark:text-amber-50 mb-1.5 tracking-wide leading-tight"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            {name}
          </h2>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < Math.floor(rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'fill-none text-amber-400 dark:text-amber-600',
                )}
              />
            ))}
          </div>
          <p
            className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            {rating.toFixed(1)}/5
          </p>

          {/* Biography */}
          <p
            className="text-center text-sm text-amber-900 dark:text-amber-100 mb-3 leading-relaxed italic line-clamp-2"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {biography ||
              'A prolific author known for rich storytelling and compelling narratives.'}
          </p>

          {/* Ornamental divider */}
          <div className="w-20 h-px bg-amber-400 dark:bg-amber-700 mb-3" />

          {/* Published Books Section */}
          <div className="w-full mb-4">
            <h3
              className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2.5 text-center tracking-wide"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              Published Books:
            </h3>
            <div className="space-y-1.5 px-2">
              {isLoadingBooks ? (
                <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                  <BookIcon className="h-4 w-4 animate-pulse" />
                  <span
                    style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                  >
                    Loading books...
                  </span>
                </div>
              ) : books.length > 0 ? (
                books.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-start gap-2 text-amber-900 dark:text-amber-100"
                  >
                    <BookIcon className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
                    <span
                      className="text-sm leading-snug"
                      style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                    >
                      {index + 1}. {book.title}
                    </span>
                  </div>
                ))
              ) : (
                <p
                  className="text-center text-sm text-amber-700 dark:text-amber-400 italic"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  No books published yet
                </p>
              )}
              {books.length > 0 && bookCount > 3 && (
                <p
                  className="text-center text-xs text-amber-700 dark:text-amber-400 italic mt-2"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  + {bookCount - 3} more book{bookCount - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Ornamental bottom divider */}
          <div className="w-full flex items-center justify-center mb-4">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-400 dark:via-amber-700 to-transparent" />
            <div className="mx-3 w-2 h-2 rotate-45 bg-amber-500 dark:bg-amber-600" />
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-400 dark:via-amber-700 to-transparent" />
          </div>

          {/* Read More Button */}
          <Button
            asChild
            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg px-6 py-2 rounded-full text-sm font-semibold"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            <Link to={id ? `/authors/${id}` : '#'}>Read more</Link>
          </Button>
        </div>

        {/* Decorative scroll bottom edge */}
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-600 dark:via-amber-800 to-transparent" />

        {/* Subtle paper texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          }}
        />
      </Card>

      {/* Scroll Bottom Roller */}
      <div className="relative h-3 mt-1.5">
        <div className="absolute inset-0 bg-linear-to-t from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-full shadow-lg" />
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-1 bg-amber-900 dark:bg-amber-950 opacity-30" />
      </div>
    </div>
  );
}
