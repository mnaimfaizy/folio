import { Badge } from '@/components/ui/badge';
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
import AdminService, { Author } from '@/services/adminService';
import { format, isValid } from 'date-fns';
import {
  BookOpen,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function AuthorsList() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllAuthors();
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Failed to load authors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (authorId: number) => {
    navigate(`/admin/authors/edit/${authorId}`);
  };

  const handleView = (authorId: number) => {
    navigate(`/admin/authors/view/${authorId}`);
  };

  const handleDelete = async (authorId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this author? This action cannot be undone. Note: Authors with existing books cannot be deleted.',
      )
    ) {
      try {
        await AdminService.deleteAuthor(authorId);
        setAuthors(authors.filter((author) => author.id !== authorId));
        toast.success('Author deleted successfully');
      } catch (error: Error | unknown) {
        console.error('Error deleting author:', error);
        const errorData = (
          error as {
            response?: {
              data?: { message?: string; error?: string; bookCount?: number };
            };
          }
        )?.response?.data;
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          'Failed to delete author. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const handleAddAuthor = () => {
    navigate('/admin/authors/create');
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
  };

  const formatBirthDate = (birthDate: string | null | undefined): string => {
    if (!birthDate) return 'Unknown';
    const date = new Date(birthDate);
    // If it's a valid date and looks like a year only, just return the year
    if (isValid(date) && /^\d{4}$/.test(birthDate.trim())) {
      return birthDate;
    }
    // If it's a valid date, format it nicely
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy');
    }
    // For historical dates like "6th cent. B.C.", return as-is
    return birthDate;
  };

  const columns: DataTableColumn<Author>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-gray-500 dark:text-gray-400',
    },
    {
      id: 'photo',
      header: 'Photo',
      sortable: false,
      searchable: false,
      cell: (author) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm">
          {author.photo_url ? (
            <img
              src={author.photo_url}
              alt={author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-medium text-sm">
              {author.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: (author) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {author.name}
        </span>
      ),
    },
    {
      id: 'book_count',
      header: 'Books',
      accessorKey: 'book_count',
      cell: (author) => (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0"
        >
          <BookOpen className="h-3 w-3 mr-1" />
          {author.book_count || 0}
        </Badge>
      ),
    },
    {
      id: 'birth_date',
      header: 'Birth Date',
      accessorKey: 'birth_date',
      cell: (author) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {formatBirthDate(author.birth_date)}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Added',
      accessorKey: 'createdAt',
      cell: (author) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDate(author.createdAt)}
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
      cell: (author) => (
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
            <DropdownMenuItem onClick={() => handleView(author.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(author.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Author
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(author.id)}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Author
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Authors Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage author profiles and their works
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddAuthor}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-0" />
        <CardContent>
          <DataTable
            data={authors}
            columns={columns}
            loading={loading}
            searchPlaceholder="Search authors by name..."
            emptyMessage="No authors found"
            emptyIcon={
              <UserPlus className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
            }
            getRowId={(author) => author.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
