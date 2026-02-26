import authorService from '@/services/authorService';
import { Author } from '@/services/bookService';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

/* ================================================================
   Hook for book author state management (add, remove, reorder,
   set-primary, create-new)
   ================================================================ */

export interface UseBookAuthorsOptions {
  initialAuthors?: Author[];
}

export function useBookAuthors(initialAuthors: Author[] = []) {
  const [bookAuthors, setBookAuthors] = useState<Author[]>(initialAuthors);
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [searchAuthors, setSearchAuthors] = useState<Author[]>([]);
  const [authorSearch, setAuthorSearch] = useState<string>('');
  const [showAddAuthorDialog, setShowAddAuthorDialog] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [addingAuthor, setAddingAuthor] = useState(false);

  const hasRequestedAuthorsRef = useRef(false);
  const authorsRetryCountRef = useRef(0);

  const fetchAllAuthors = useCallback(async () => {
    if (hasRequestedAuthorsRef.current) return;
    hasRequestedAuthorsRef.current = true;

    try {
      const authors: Author[] = await authorService.getAuthors();
      setAllAuthors(authors);
      authorsRetryCountRef.current = 0;
    } catch (error: any) {
      const status = error?.response?.status;
      console.error('Error fetching authors:', error);

      if (status === 429 && authorsRetryCountRef.current < 2) {
        authorsRetryCountRef.current += 1;
        const retryMs = 1000 * authorsRetryCountRef.current;
        window.setTimeout(() => {
          hasRequestedAuthorsRef.current = false;
          void fetchAllAuthors();
        }, retryMs);
      }
    }
  }, []);

  const searchForAuthors = (query: string) => {
    setAuthorSearch(query);

    if (!query || query.length < 2) {
      setSearchAuthors([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matchingAuthors = allAuthors.filter(
      (author) =>
        author.name.toLowerCase().includes(lowerQuery) &&
        !bookAuthors.some((bookAuthor) => bookAuthor.id === author.id),
    );

    setSearchAuthors(matchingAuthors as Author[]);
  };

  const handleAddExistingAuthor = (author: Author) => {
    if (bookAuthors.some((a) => a.id === author.id)) return;

    const isPrimary =
      bookAuthors.length === 0 || !bookAuthors.some((a) => a.is_primary);
    setBookAuthors((prev) => [...prev, { ...author, is_primary: isPrimary }]);
    setAuthorSearch('');
    setSearchAuthors([]);
  };

  const handleCreateNewAuthor = async () => {
    if (!newAuthorName.trim()) return;

    try {
      setAddingAuthor(true);

      const existingAuthor = allAuthors.find(
        (a) => a.name.toLowerCase() === newAuthorName.trim().toLowerCase(),
      );

      if (existingAuthor) {
        handleAddExistingAuthor(existingAuthor as Author);
      } else {
        const newAuthor = await authorService.createAuthor({
          name: newAuthorName,
        });

        setAllAuthors((prev) => [
          ...prev,
          { id: newAuthor.id!, name: newAuthor.name },
        ]);

        const isPrimary =
          bookAuthors.length === 0 || !bookAuthors.some((a) => a.is_primary);
        handleAddExistingAuthor({ ...newAuthor, is_primary: isPrimary });
      }

      setNewAuthorName('');
      setShowAddAuthorDialog(false);
    } catch (error) {
      console.error('Error creating new author:', error);
      toast.error('Failed to create new author');
    } finally {
      setAddingAuthor(false);
    }
  };

  const handleRemoveAuthor = (authorId: number) => {
    setBookAuthors((prev) => {
      const updated = prev.filter((a) => a.id !== authorId);
      if (updated.length > 0 && !updated.some((a) => a.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryAuthor = (authorId: number) => {
    setBookAuthors((prev) =>
      prev.map((a) => ({ ...a, is_primary: a.id === authorId })),
    );
  };

  const moveAuthor = (index: number, direction: 'up' | 'down') => {
    setBookAuthors((prev) => {
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev;
      }

      const next = [...prev];
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  };

  return {
    // state
    bookAuthors,
    setBookAuthors,
    allAuthors,
    searchAuthors,
    authorSearch,
    showAddAuthorDialog,
    setShowAddAuthorDialog,
    newAuthorName,
    setNewAuthorName,
    addingAuthor,
    // actions
    fetchAllAuthors,
    searchForAuthors,
    handleAddExistingAuthor,
    handleCreateNewAuthor,
    handleRemoveAuthor,
    handleSetPrimaryAuthor,
    moveAuthor,
  };
}
