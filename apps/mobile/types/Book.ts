export interface Author {
  id: number;
  name: string;
  is_primary?: boolean;
}

export interface Book {
  id: number;
  title: string;
  author?: string; // Legacy field for backward compatibility
  authors?: Author[];
  isbn?: string;
  publishYear?: number;
  genre?: string;
  description?: string;
  cover?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookSearchParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface BookSearchResponse {
  books: Book[];
  total?: number;
  page?: number;
  limit?: number;
}
