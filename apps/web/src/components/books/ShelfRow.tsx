import { cn } from '@/lib/utils';
import { BookOnShelf } from './BookOnShelf';
import { BookShelfPlank } from './BookShelfPlank';
import { EmptyShelfDecor } from './EmptyShelfDecor';
import type { ShelfBook } from './bookShelfTypes';

/* ================================================================
   Single shelf row — books + plank + under-shelf lighting
   ================================================================ */

interface ShelfRowProps {
  books: ShelfBook[];
  shelfHeight: number;
  animKey: number;
  direction: 'left' | 'right';
}

export function ShelfRow({
  books,
  shelfHeight,
  animKey,
  direction,
}: ShelfRowProps) {
  const isEmpty = books.length === 0;

  return (
    <div className="relative">
      {/* Under-shelf lighting glow */}
      <div
        className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(180deg,rgba(180,140,60,.06) 0%,transparent 100%)',
        }}
      />

      {/* Books container — keyed so React re-mounts on page change */}
      <div
        key={animKey}
        className={cn(
          'relative flex items-end justify-center gap-[3px] px-6',
          !isEmpty &&
            (direction === 'left'
              ? 'animate-[shelfSlideFromRight_0.45s_ease-out]'
              : 'animate-[shelfSlideFromLeft_0.45s_ease-out]'),
        )}
        style={{ height: shelfHeight, paddingBottom: 2, overflow: 'visible' }}
      >
        {isEmpty ? (
          <EmptyShelfDecor />
        ) : (
          <>
            {books.map((book, i) => (
              <BookOnShelf
                key={book.id ?? i}
                book={book}
                shelfHeight={shelfHeight - 8}
              />
            ))}

            {/* Metal bookend when few books */}
            {books.length <= 3 && (
              <div className="shrink-0 self-end mb-0.5" aria-hidden>
                <svg width="14" height="60" viewBox="0 0 14 60">
                  <defs>
                    <linearGradient
                      id="bookendGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#5D4037" />
                      <stop offset="50%" stopColor="#795548" />
                      <stop offset="100%" stopColor="#4E342E" />
                    </linearGradient>
                  </defs>
                  {/* L-shaped bookend */}
                  <rect
                    x="0"
                    y="0"
                    width="4"
                    height="60"
                    rx="1"
                    fill="url(#bookendGrad)"
                  />
                  <rect
                    x="0"
                    y="52"
                    width="14"
                    height="8"
                    rx="1"
                    fill="url(#bookendGrad)"
                  />
                  {/* Highlight */}
                  <line
                    x1="2"
                    y1="2"
                    x2="2"
                    y2="58"
                    stroke="rgba(255,255,255,.08)"
                    strokeWidth=".5"
                  />
                </svg>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shelf plank */}
      <BookShelfPlank />
    </div>
  );
}
