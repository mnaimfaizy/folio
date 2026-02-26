/* ================================================================
   Shared types for the BookShelf feature
   ================================================================ */

export interface ShelfBook {
  id?: number;
  title: string;
  author?: string;
  genre?: string;
  publishYear?: number;
  description?: string;
  coverImage?: string;
  cover?: string;
}

export interface BookShelfViewProps {
  books: ShelfBook[];
}
