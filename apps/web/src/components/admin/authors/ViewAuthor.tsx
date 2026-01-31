import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminService, { Author, Book } from "@/services/adminService";
import { format } from "date-fns";
import {
  Book as BookIcon,
  Calendar,
  Clock,
  Edit,
  Loader2,
  Trash,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function ViewAuthor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        if (!id) return;

        setLoading(true);
        const data = await AdminService.getAuthorById(Number(id));
        setAuthor(data.author);
        setBooks(data.books);
        setLoading(false);
      } catch (err: Error | unknown) {
        console.error("Error fetching author:", err);
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to load author data"
        );
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/authors/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this author? This action cannot be undone and will remove the author from all associated books."
      )
    ) {
      try {
        await AdminService.deleteAuthor(Number(id));
        toast.success("Author deleted successfully");
        navigate("/admin/authors");
      } catch (err: Error | unknown) {
        console.error("Error deleting author:", err);
        toast.error(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to delete author"
        );
      }
    }
  };

  const handleViewBook = (bookId: number) => {
    navigate(`/admin/books/view/${bookId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading author data...</span>
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

  if (!author) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Author not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{author.name}</CardTitle>
              <CardDescription>Author details and information</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Author photo */}
            <div className="flex flex-col items-center space-y-4">
              {author.photo_url ? (
                <img
                  src={author.photo_url}
                  alt={author.name}
                  className="w-48 h-48 object-cover rounded-full shadow-md"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Author details */}
            <div className="col-span-2 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Author Information
                </h3>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Birth Date:
                    </span>
                    <span>
                      {author.birth_date
                        ? format(new Date(author.birth_date), "MMMM d, yyyy")
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BookIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Books:
                    </span>
                    <span>{books.length}</span>
                  </div>
                </div>
              </div>

              {author.biography && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Biography
                  </h3>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-700">{author.biography}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Timestamps
                </h3>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Created:
                    </span>
                    <span>
                      {format(new Date(author.createdAt), "PPP 'at' p")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Updated:
                    </span>
                    <span>
                      {format(new Date(author.updatedAt), "PPP 'at' p")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Books by this author */}
          {books.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Books by this author</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        {book.cover ? (
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                            <BookIcon className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {book.title}
                      </TableCell>
                      <TableCell>{book.isbn || "N/A"}</TableCell>
                      <TableCell>{book.publishYear || "Unknown"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewBook(book.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/admin/authors")}>
            Back to Authors List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
