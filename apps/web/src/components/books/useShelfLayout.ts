import { useEffect, useState } from 'react';

/* ================================================================
   Responsive layout hook — calculates books-per-shelf and
   shelf-count depending on the viewport width.
   ================================================================ */

interface ShelfLayout {
  booksPerShelf: number;
  shelfCount: number;
  booksPerPage: number;
}

export function useShelfLayout(): ShelfLayout {
  const [layout, setLayout] = useState({ booksPerShelf: 5, shelfCount: 2 });

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1280) setLayout({ booksPerShelf: 7, shelfCount: 2 });
      else if (w >= 1024) setLayout({ booksPerShelf: 6, shelfCount: 2 });
      else if (w >= 768) setLayout({ booksPerShelf: 4, shelfCount: 2 });
      else if (w >= 640) setLayout({ booksPerShelf: 3, shelfCount: 2 });
      else setLayout({ booksPerShelf: 2, shelfCount: 3 });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return { ...layout, booksPerPage: layout.booksPerShelf * layout.shelfCount };
}
