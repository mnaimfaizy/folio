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
import AdminService, { Book } from '@/services/adminService';
import {
  BookOpen,
  BookPlus,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const hasFetchedRef = useRef(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void fetchBooks();
  }, []);

  const handleEdit = (bookId: number) => {
    navigate(`/admin/books/edit/${bookId}`);
  };

  const handleView = (bookId: number) => {
    navigate(`/admin/books/view/${bookId}`);
  };

  const handleDelete = async (bookId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this book? This action cannot be undone.',
      )
    ) {
      try {
        await AdminService.deleteBook(bookId);
        setBooks(books.filter((book) => book.id !== bookId));
        toast.success('Book deleted successfully');
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book. Please try again.');
      }
    }
  };

  const handleAddBook = () => {
    navigate('/admin/books/create');
  };

  const columns: DataTableColumn<Book>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-gray-500 dark:text-gray-400',
    },
    {
      id: 'cover',
      header: 'Cover',
      sortable: false,
      searchable: false,
      cell: (book) => (
        <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      cell: (book) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {book.title}
        </span>
      ),
    },
    {
      id: 'author',
      header: 'Author(s)',
      accessorKey: 'author',
      cell: (book) => (
        <span className="text-gray-600 dark:text-gray-300">
          {book.authors?.length
            ? book.authors.map((author) => author.name).join(', ')
            : book.author || 'Unknown'}
        </span>
      ),
    },
    {
      id: 'isbn',
      header: 'ISBN',
      accessorKey: 'isbn',
      cell: (book) => (
        <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">
          {book.isbn || 'N/A'}
        </span>
      ),
    },
    {
      id: 'publishYear',
      header: 'Year',
      accessorKey: 'publishYear',
      cell: (book) => (
        <span className="text-gray-500 dark:text-gray-400">
          {book.publishYear || 'Unknown'}
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
      cell: (book) => (
        <DropdownMenu>
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
            <DropdownMenuItem onClick={() => handleView(book.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(book.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Book
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(book.id)}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Book
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
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Books Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage book catalog and inventory
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddBook}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-0" />
        <CardContent>
          <DataTable
            data={books}
            columns={columns}
            loading={loading}
            searchPlaceholder="Search books by title, author, or ISBN..."
            emptyMessage="No books found"
            emptyIcon={
              <BookPlus className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
            }
            getRowId={(book) => book.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
