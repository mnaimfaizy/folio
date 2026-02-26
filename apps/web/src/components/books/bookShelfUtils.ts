import { FALLBACK_COLORS, GENRE_COLORS } from './bookShelfConstants';

/* ================================================================
   Utility helpers for book shelf rendering
   ================================================================ */

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBookColor(genre?: string, title = '') {
  if (genre && GENRE_COLORS[genre]) return GENRE_COLORS[genre];
  return FALLBACK_COLORS[hashString(title) % FALLBACK_COLORS.length];
}

export function getBookDimensions(title: string) {
  const h = hashString(title);
  const width = 48 + (h % 22);
  const heightPercent = 72 + (h % 24);
  const depth = 7 + (h % 5); // 7–11px
  return { width, heightPercent, depth };
}

export function getBookTilt(title: string): number {
  const h = hashString(title + 'tilt');
  // Only some books lean slightly: −1.5° to 1.5°
  if (h % 4 === 0) return ((h % 30) - 15) / 10;
  return 0;
}

/** Shift a hex colour's brightness by `amount` (positive = lighter). */
export function shiftColor(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
