import * as z from 'zod';
import type { Author } from '@/services/bookService';

/**
 * Zod validation schema for book create / edit forms.
 * Shared by CreateAdminBookComponent and EditBookComponent.
 */
export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().optional(),
  isbn10: z.string().optional(),
  isbn13: z.string().optional(),
  genre: z.string().optional(),
  publishYear: z.coerce
    .number()
    .int('Publication year must be a whole number')
    .min(0, 'Publication year cannot be negative')
    .max(
      new Date().getFullYear() + 5,
      'Publication year cannot be in the far future',
    )
    .optional()
    .nullable(),
  pages: z.coerce
    .number()
    .int('Pages must be a whole number')
    .min(1, 'Pages must be at least 1')
    .optional()
    .nullable(),
  /** Kept for backward compatibility with single-author legacy data. */
  author: z.string().optional(),
  description: z.string().optional(),
  cover: z.string().optional(),
  available: z.boolean().optional(),
  addToCollection: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export type BookFormValues = z.infer<typeof bookSchema> & {
  authors?: Author[];
};
