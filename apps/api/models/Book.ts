import { Author } from "./Author";

export interface Book {
  id?: number;
  title: string;
  isbn?: string;
  publishYear?: number;
  author?: string; // Kept for backward compatibility
  cover?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  authors?: Author[]; // New field for author relationship
}
