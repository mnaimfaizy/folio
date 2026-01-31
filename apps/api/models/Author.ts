export interface Author {
  id?: number;
  name: string;
  biography?: string;
  birth_date?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthorWithBooks extends Author {
  books_count: number;
}

export interface AuthorBook {
  author_id: number;
  book_id: number;
  is_primary: boolean;
  created_at?: string;
}

export default Author;
