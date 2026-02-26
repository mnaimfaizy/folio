import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HEADBAND_COLORS } from './bookShelfConstants';
import type { ShelfBook } from './bookShelfTypes';
import {
  getBookColor,
  getBookDimensions,
  getBookTilt,
  hashString,
  shiftColor,
} from './bookShelfUtils';

/* ================================================================
   Individual book on the shelf — 3D spine with hover popup card
   ================================================================ */

export function BookOnShelf({
  book,
  shelfHeight,
}: {
  book: ShelfBook;
  shelfHeight: number;
}) {
  const color = getBookColor(book.genre, book.title);
  const { width, heightPercent, depth } = getBookDimensions(book.title);
  const bookHeight = Math.floor(shelfHeight * (heightPercent / 100));
  const topOffset = shelfHeight - bookHeight;
  const tilt = getBookTilt(book.title);

  const coverUrl =
    book.coverImage ||
    book.cover ||
    `https://placehold.co/200x300/e2e8f0/64748b?text=${encodeURIComponent(book.title.slice(0, 10))}`;

  const darker = shiftColor(color.bg, -25);
  const lighter = shiftColor(color.bg, 22);
  const h = hashString(book.title);
  const headband = HEADBAND_COLORS[h % HEADBAND_COLORS.length];
  const textureId = `${color.texture}Texture`;

  // Spine design variation based on hash
  const spineVariant = h % 3; // 0 = classic, 1 = banded, 2 = emblem

  return (
    <div
      className="group/book relative shrink-0"
      style={{
        width: width + depth,
        height: shelfHeight,
        paddingTop: topOffset,
      }}
    >
      {/* ── Book shadow on shelf surface ───────── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          width: width + 8,
          height: 6,
          background:
            'radial-gradient(ellipse at 50% 0%,rgba(0,0,0,.55) 0%,transparent 75%)',
          filter: 'blur(2px)',
        }}
      />

      {/* ── The 3D book ───────────────────────── */}
      <div
        className="relative transition-all duration-300 ease-out
                   group-hover/book:-translate-y-6 group-hover/book:scale-[1.08]
                   z-10 group-hover/book:z-30 cursor-pointer"
        style={{
          width: width + depth,
          height: bookHeight,
          transform: tilt ? `rotate(${tilt}deg)` : undefined,
          transformOrigin: 'bottom center',
        }}
      >
        {/* ── Front face (spine) ────────────────── */}
        <div
          className="absolute top-0 left-0 bottom-0 rounded-l-[2px] overflow-hidden"
          style={{
            width,
            background: `linear-gradient(180deg,${lighter} 0%,${color.bg} 35%,${color.bg} 65%,${darker} 100%)`,
            boxShadow: `
              inset -4px 0 8px rgba(0,0,0,.35),
              inset 3px 0 6px rgba(255,255,255,.06),
              inset 0 2px 4px rgba(255,255,255,.08),
              inset 0 -2px 4px rgba(0,0,0,.2)
            `,
          }}
        >
          {/* Material texture overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <rect
              width="100%"
              height="100%"
              fill={`url(#${textureId})`}
              opacity=".8"
            />
          </svg>

          {/* ── Headband (top fabric strip) ──── */}
          <div
            className="mx-auto mt-[3px]"
            style={{
              width: '80%',
              height: 3,
              background: `repeating-linear-gradient(90deg,${headband[0]} 0px,${headband[0]} 2px,${headband[1]} 2px,${headband[1]} 4px)`,
              borderRadius: 0.5,
              boxShadow: '0 1px 1px rgba(0,0,0,.3)',
            }}
          />

          {/* ── Top decorative rule ─────────── */}
          {spineVariant !== 2 && (
            <div
              className="mx-auto mt-1"
              style={{
                width: '50%',
                height: 1,
                backgroundColor: color.accent,
                opacity: 0.5,
                borderRadius: 1,
              }}
            />
          )}

          {/* ── Spine bands (for banded variant) */}
          {spineVariant === 1 && (
            <>
              {[18, 30, 70, 82].map((pct) => (
                <div
                  key={pct}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${pct}%`,
                    height: 2,
                    background: `linear-gradient(90deg,transparent 5%,rgba(0,0,0,.2) 20%,rgba(0,0,0,.15) 50%,rgba(0,0,0,.2) 80%,transparent 95%)`,
                  }}
                />
              ))}
            </>
          )}

          {/* ── Title (vertical) ───────────── */}
          <div
            className="absolute inset-x-0 flex items-center justify-center overflow-hidden"
            style={{
              top: spineVariant === 1 ? '22%' : '12%',
              bottom: '24%',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            <span
              className="text-[10px] font-bold leading-tight text-center tracking-wide"
              style={{
                color: color.text,
                textShadow: `0 1px 0 rgba(0,0,0,.5), 0 -1px 0 rgba(255,255,255,.08)`,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                padding: '0 2px',
                letterSpacing: '0.03em',
              }}
            >
              {book.title}
            </span>
          </div>

          {/* ── Emblem (for emblem variant) ─── */}
          {spineVariant === 2 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
              style={{
                bottom: '20%',
                width: Math.min(width - 8, 28),
                height: Math.min(width - 8, 28),
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full"
                style={{ opacity: 0.3 }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke={color.accent}
                  strokeWidth="1"
                />
                <path
                  d="M12 5L14 10H19L15 13L16.5 18L12 15L7.5 18L9 13L5 10H10Z"
                  fill={color.accent}
                />
              </svg>
            </div>
          )}

          {/* ── Author (vertical) ──────────── */}
          <div
            className="absolute inset-x-0 bottom-[5%] flex items-center justify-center overflow-hidden"
            style={{
              height: '14%',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            <span
              className="text-[7px] leading-tight text-center opacity-55 tracking-wider"
              style={{
                color: color.text,
                textShadow: '0 1px 1px rgba(0,0,0,.4)',
                padding: '0 1px',
              }}
            >
              {book.author?.split(' ').pop() || ''}
            </span>
          </div>

          {/* ── Bottom rule ────────────────── */}
          <div
            className="absolute bottom-[3px] left-1/2 -translate-x-1/2"
            style={{
              width: '40%',
              height: 1,
              backgroundColor: color.accent,
              opacity: 0.3,
              borderRadius: 1,
            }}
          />

          {/* ── Tailband (bottom fabric strip) */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: '80%',
              height: 2.5,
              background: `repeating-linear-gradient(90deg,${headband[1]} 0px,${headband[1]} 2px,${headband[0]} 2px,${headband[0]} 4px)`,
              borderRadius: '0 0 0.5px 0.5px',
            }}
          />

          {/* ── Spine hinge crease (left edge) */}
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{
              width: 3,
              background: 'linear-gradient(90deg,rgba(0,0,0,.25),transparent)',
            }}
          />
        </div>

        {/* ── Side edge (page block) ───────────── */}
        <div
          className="absolute top-0 bottom-0 rounded-r-[1px]"
          style={{
            left: width,
            width: depth,
            background: `linear-gradient(90deg,
              #F5F0E1 0%,
              #ECE4D4 15%,
              #F0EBD8 30%,
              #E8E0CE 50%,
              #EEEAD8 70%,
              #E5DCC8 85%,
              #DDD4C0 100%)`,
            boxShadow: `
              inset 0 2px 3px rgba(0,0,0,.08),
              inset 0 -2px 3px rgba(0,0,0,.06),
              2px 0 4px rgba(0,0,0,.3)
            `,
          }}
        >
          {/* Page line details */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            {Array.from({ length: Math.floor(depth / 1.5) }, (_, i) => (
              <line
                key={i}
                x1={1 + i * 1.5}
                y1="3"
                x2={1 + i * 1.5}
                y2="97%"
                stroke="rgba(0,0,0,.04)"
                strokeWidth=".3"
              />
            ))}
          </svg>
        </div>

        {/* ── Top edge (page tops viewed from above) */}
        <div
          className="absolute left-0 right-0 rounded-t-[1px]"
          style={{
            top: -3,
            height: 4,
            background: `linear-gradient(180deg,
              #F5F0E1,
              #ECE4D4 40%,
              #E0D8C8)`,
            boxShadow: '0 -1px 3px rgba(0,0,0,.12)',
            borderRight: `${depth}px solid #E5DCC8`,
          }}
        />
      </div>

      {/* ── Hover popup card ───────────────────── */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2
                   opacity-0 scale-95
                   group-hover/book:opacity-100 group-hover/book:scale-100
                   pointer-events-none group-hover/book:pointer-events-auto
                   transition-all duration-300 z-50"
        style={{ width: 220 }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover */}
          <div className="relative h-32 bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {book.genre && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 text-[10px] backdrop-blur-sm border-0">
                  {book.genre}
                </Badge>
              </div>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                4.5
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
              {book.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {book.author}
              {book.publishYear && ` · ${book.publishYear}`}
            </p>
            {book.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {book.description}
              </p>
            )}
            <Button size="sm" className="w-full mt-2 h-7 text-xs" asChild>
              <Link to={`/books/${book.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Link>
            </Button>
          </div>
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-900 rotate-45 -mt-1.5 border-r border-b border-gray-200 dark:border-gray-700" />
      </div>
    </div>
  );
}
