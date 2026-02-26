import { Button } from '@/components/ui/button';
import { Bookmark, BookMarked, BookOpen, Loader2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BookDetails } from './useBookDetails';

/* ================================================================
   Loan + collection action buttons shown in the left sidebar
   ================================================================ */

interface BookLoanActionsProps {
  book: BookDetails;
  isAuthenticated: boolean;
  isLibraryProfile: boolean;
  loansEnabled: boolean;
  isAdmin: boolean;
  isInCollection: boolean;
  collectionLoading: boolean;
  borrowLoading: boolean;
  onBorrow: () => void;
  onToggleCollection: () => void;
}

export function BookLoanActions({
  book,
  isAuthenticated: _isAuthenticated,
  isLibraryProfile,
  loansEnabled,
  isAdmin,
  isInCollection,
  collectionLoading,
  borrowLoading,
  onBorrow,
  onToggleCollection,
}: BookLoanActionsProps) {
  return (
    <div className="mt-4 space-y-3">
      {/* ── Borrow button ──────────────────────── */}
      {isLibraryProfile &&
        loansEnabled &&
        (book.available_copies > 0 ? (
          <Button
            className="w-full gap-2 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/25"
            onClick={onBorrow}
            disabled={borrowLoading}
          >
            {borrowLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            Request Loan
          </Button>
        ) : (
          <Button
            className="w-full gap-2 rounded-xl h-11"
            variant="secondary"
            disabled
          >
            <BookOpen className="h-4 w-4" />
            Not Available
          </Button>
        ))}

      {/* ── Collection toggle ──────────────────── */}
      {isLibraryProfile && (
        <Button
          variant={isInCollection ? 'secondary' : 'outline'}
          className={`w-full gap-2 rounded-xl h-11 transition-all ${
            isInCollection
              ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
              : ''
          }`}
          onClick={onToggleCollection}
          disabled={collectionLoading}
        >
          {collectionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isInCollection ? (
            <BookMarked className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {isInCollection ? 'In My Collection' : 'Add to Collection'}
        </Button>
      )}

      {/* ── Admin edit link ────────────────────── */}
      {isAdmin && (
        <Button
          variant="outline"
          className="w-full gap-2 rounded-xl h-11 border-dashed"
          asChild
        >
          <Link to={`/admin/books/edit/${book.id}`}>
            <Pencil className="h-4 w-4" />
            Edit Book
          </Link>
        </Button>
      )}
    </div>
  );
}
