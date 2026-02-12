import { useCallback, useEffect, useState } from 'react';
import AdminService from '@/services/adminService';

const normalizeGenreValue = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

export function useGenreSuggestions() {
  const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadGenres = async () => {
      try {
        const genres = await AdminService.getUniqueGenres();
        if (!cancelled) setGenreSuggestions(genres);
      } catch (error) {
        console.error('Failed to load genre suggestions:', error);
      }
    };

    loadGenres();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveGenre = useCallback(
    (value: string) => {
      const normalized = normalizeGenreValue(value);
      if (!normalized) return '';
      const match = genreSuggestions.find(
        (g) =>
          normalizeGenreValue(g).toLowerCase() === normalized.toLowerCase(),
      );
      return match || normalized;
    },
    [genreSuggestions],
  );

  return { genreSuggestions, resolveGenre };
}
