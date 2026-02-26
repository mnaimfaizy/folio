/**
 * Returns true when more than 50% of the non-whitespace characters in `name`
 * are Latin/ASCII letters.  Useful for deciding whether to search external
 * English-only providers.
 */
export function isEnglishName(name: string): boolean {
  const latinChars = name.match(/[a-zA-Z]/g)?.length ?? 0;
  const total = name.replace(/\s/g, '').length;
  return total > 0 && latinChars / total > 0.5;
}

/**
 * Truncate a string to `maxLength` characters, appending `ellipsis` when
 * trimmed.
 */
export function truncate(
  value: string,
  maxLength: number,
  ellipsis = '…',
): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + ellipsis;
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
