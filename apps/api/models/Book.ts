import { Author } from './Author';

export interface Book {
  id?: number;
  title: string;
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publishYear?: number;
  pages?: number;
  genre?: string;
  author?: string; // Kept for backward compatibility
  cover?: string;
  coverKey?: string;
  description?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authors?: Author[]; // New field for author relationship
}
