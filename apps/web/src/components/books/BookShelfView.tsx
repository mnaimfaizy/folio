import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookshelfFrame } from './BookshelfFrame';
import { ShelfPagination } from './ShelfPagination';
import { ShelfRow } from './ShelfRow';
import { useShelfLayout } from './useShelfLayout';
import type { BookShelfViewProps, ShelfBook } from './bookShelfTypes';

export type { BookShelfViewProps, ShelfBook };

/* ================================================================
   Main export – BookShelfView
   ================================================================ */

export function BookShelfView({ books }: BookShelfViewProps) {
  const { booksPerShelf, shelfCount, booksPerPage } = useShelfLayout();
  const [currentPage, setCurrentPage] = useState(1);
  const directionRef = useRef<'left' | 'right'>('right');
  const [animKey, setAnimKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(books.length / booksPerPage));
  const start = (currentPage - 1) * booksPerPage;
  const currentBooks = books.slice(start, start + booksPerPage);

  // Split into rows
  const shelves = useMemo(() => {
    const rows: ShelfBook[][] = [];
    for (let i = 0; i < shelfCount; i++) {
      rows.push(currentBooks.slice(i * booksPerShelf, (i + 1) * booksPerShelf));
    }
    while (rows.length < shelfCount) rows.push([]);
    return rows;
  }, [currentBooks, booksPerShelf, shelfCount]);

  // Page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      directionRef.current = page > currentPage ? 'left' : 'right';
      setCurrentPage(page);
      setAnimKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentPage, totalPages],
  );

  // Guard against out-of-bounds page after layout change
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(books.length / booksPerPage));
    if (currentPage > maxPage) setCurrentPage(1);
  }, [booksPerPage, books.length, currentPage]);

  const SHELF_H = 200;

  return (
    <div className="space-y-6">
      <BookshelfFrame>
        {shelves.map((row, idx) => (
          <ShelfRow
            key={idx}
            books={row}
            shelfHeight={SHELF_H}
            animKey={animKey}
            direction={directionRef.current}
          />
        ))}
      </BookshelfFrame>

      <ShelfPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
