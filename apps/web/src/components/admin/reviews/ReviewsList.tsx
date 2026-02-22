import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StarRating } from '@/components/ui/star-rating';
import AdminService, { Review } from '@/services/adminService';
import { format, isValid } from 'date-fns';
import {
  BookOpen,
  Eye,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  Star,
  Trash,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this review? This action cannot be undone.',
      )
    ) {
      try {
        await AdminService.deleteReview(reviewId);
        setReviews(reviews.filter((review) => review.id !== reviewId));
        toast.success('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review. Please try again.');
      }
    }
  };

  const handleViewBook = (bookId: number) => {
    navigate(`/admin/books/view/${bookId}`);
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
  };

  const columns: DataTableColumn<Review>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-gray-500 dark:text-gray-400',
    },
    {
      id: 'book',
      header: 'Book',
      accessorKey: 'book_title',
      cell: (review) => (
        <button
          onClick={() => handleViewBook(review.bookId)}
          className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
        >
          <BookOpen className="h-4 w-4" />
          <span className="truncate max-w-[150px]">
            {review.book_title || `Book #${review.bookId}`}
          </span>
        </button>
      ),
    },
    {
      id: 'user',
      header: 'User',
      accessorKey: 'user_name',
      cell: (review) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-gray-700 dark:text-gray-300">
            {review.user_name || review.username || 'Anonymous'}
          </span>
        </div>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      accessorKey: 'rating',
      cell: (review) => (
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} maxRating={5} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({review.rating}/5)
          </span>
        </div>
      ),
    },
    {
      id: 'comment',
      header: 'Comment',
      accessorKey: 'comment',
      cell: (review) => (
        <span
          className="text-gray-600 dark:text-gray-400 text-sm"
          title={review.comment}
        >
          {truncateText(review.comment, 40)}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (review) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDate(review.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      sortable: false,
      searchable: false,
      cell: (review) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleViewBook(review.bookId)}>
              <Eye className="mr-2 h-4 w-4" />
              View Book
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(review.id)}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Reviews Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Moderate and manage user reviews
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {reviews.length} Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-0" />
        <CardContent>
          <DataTable
            data={reviews}
            columns={columns}
            loading={loading}
            searchPlaceholder="Search reviews by book, user, or comment..."
            emptyMessage="No reviews found"
            emptyIcon={
              <MessageSquarePlus className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
            }
            getRowId={(review) => review.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
