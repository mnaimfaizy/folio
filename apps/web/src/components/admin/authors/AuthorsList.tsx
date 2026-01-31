import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminService, { Author } from "@/services/adminService";
import { format, isValid } from "date-fns";
import {
  Book,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Trash,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AuthorsList() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getAllAuthors();
        setAuthors(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching authors:", error);
        setError("Failed to load authors. Please try again.");
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const handleEdit = (authorId: number) => {
    navigate(`/admin/authors/edit/${authorId}`);
  };

  const handleView = (authorId: number) => {
    navigate(`/admin/authors/view/${authorId}`);
  };

  const handleDelete = async (authorId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this author? This action cannot be undone and will also remove the author from all associated books."
      )
    ) {
      try {
        await AdminService.deleteAuthor(authorId);
        setAuthors(authors.filter((author) => author.id !== authorId));
        toast.success("Author deleted successfully");
      } catch (error) {
        console.error("Error deleting author:", error);
        toast.error("Failed to delete author. Please try again.");
      }
    }
  };

  const handleAddAuthor = () => {
    navigate("/admin/authors/create");
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading authors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Authors Management</CardTitle>
          <CardDescription>
            Manage authors and their information
          </CardDescription>
        </div>
        <Button onClick={handleAddAuthor}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </CardHeader>
      <CardContent>
        {authors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No authors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Book Count</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authors.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell>{author.id}</TableCell>
                    <TableCell>
                      {author.photo_url ? (
                        <img
                          src={author.photo_url}
                          alt={author.name}
                          className="w-10 h-10 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Book className="h-4 w-4 mr-1 text-gray-500" />
                        {author.book_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(author.birth_date)}</TableCell>
                    <TableCell>{formatDate(author.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleView(author.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(author.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Author
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(author.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Author
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
