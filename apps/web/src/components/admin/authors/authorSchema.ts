import * as z from 'zod';

/**
 * Zod validation schema for author create / edit forms.
 * Shared by CreateAuthor and EditAuthor to keep rules in sync.
 */
export const authorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  biography: z.string().optional(),
  birth_date: z.string().optional(),
  photo_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

export type AuthorFormValues = z.infer<typeof authorSchema>;
