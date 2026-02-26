import { format, isValid } from 'date-fns';

/**
 * Format a standard ISO date string to a human-readable date.
 * Returns 'Unknown' for null/undefined and 'Invalid date' for unparseable values.
 */
export function formatDate(
  dateString: string | null | undefined,
  dateFormat = 'MMM d, yyyy',
): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return isValid(date) ? format(date, dateFormat) : 'Invalid date';
}

/**
 * Format an author birth date that may be:
 *  - A historical text like "6th cent. B.C." → returned as-is
 *  - A 4-digit year string like "1950"       → returned as-is
 *  - A full ISO date string                  → formatted as 'MMM d, yyyy'
 *  - null / undefined                        → 'Unknown'
 */
export function formatBirthDate(birthDate: string | null | undefined): string {
  if (!birthDate) return 'Unknown';

  // Historical text dates — return as-is
  if (
    birthDate.includes('cent.') ||
    birthDate.includes('B.C.') ||
    birthDate.includes('A.D.')
  ) {
    return birthDate;
  }

  // Year-only string
  if (/^\d{4}$/.test(birthDate.trim())) {
    return birthDate;
  }

  const date = new Date(birthDate);
  if (isValid(date)) {
    return format(date, 'MMMM d, yyyy');
  }

  // Unrecognised format — return verbatim
  return birthDate;
}

/**
 * Extract a birth year string from a birth date for compact display.
 * Returns empty string when the date cannot be resolved.
 */
export function formatBirthYear(birthDate: string | null | undefined): string {
  if (!birthDate) return '';

  // Historical or special text
  if (
    birthDate.includes('cent.') ||
    birthDate.includes('B.C.') ||
    birthDate.includes('A.D.')
  ) {
    return birthDate;
  }

  if (/^\d{4}$/.test(birthDate.trim())) {
    return birthDate;
  }

  try {
    const year = new Date(birthDate).getFullYear();
    return isNaN(year) ? birthDate : year.toString();
  } catch {
    return birthDate;
  }
}
