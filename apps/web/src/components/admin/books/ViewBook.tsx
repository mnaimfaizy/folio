import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminService, { Book } from "@/services/adminService";
import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  Edit,
  Hash,
  Loader2,
  Trash,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function ViewBook() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        if (!bookId) return;

        setLoading(true);
        const bookData = await AdminService.getBookById(Number(bookId));
        setBook(bookData);
        setLoading(false);
      } catch (err: Error | unknown) {
        console.error("Error fetching book:", err);
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to load book data"
        );
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleEdit = () => {
    navigate(`/admin/books/edit/${bookId}`);
  };

  const handleDelete = async () => {
    if (!bookId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone."
      )
    ) {
      try {
        await AdminService.deleteBook(Number(bookId));
        toast.success("Book deleted successfully");
        navigate("/admin/books");
      } catch (err: Error | unknown) {
        console.error("Error deleting book:", err);
        toast.error(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to delete book"
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading book data...</span>
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

  if (!book) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Book not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{book.title}</CardTitle>
              <CardDescription>Book details and information</CardDescription>
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
            {/* Cover image */}
            <div className="flex flex-col items-center space-y-4">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-48 h-auto object-cover rounded shadow-md"
                />
              ) : (
                <div className="w-48 h-64 bg-gray-200 rounded-md flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Book details */}
            <div className="col-span-2 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Book Information
                </h3>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      ISBN:
                    </span>
                    <span>{book.isbn || "Not available"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Published:
                    </span>
                    <span>{book.publishYear || "Unknown"}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Author(s):
                    </span>
                    <span>
                      {book.authors?.length
                        ? book.authors.map((author) => author.name).join(", ")
                        : book.author || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {book.description || "No description available"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Timestamps
                </h3>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Created:
                    </span>
                    <span>
                      {format(new Date(book.createdAt), "PPP 'at' p")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Updated:
                    </span>
                    <span>
                      {format(new Date(book.updatedAt), "PPP 'at' p")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/admin/books")}>
            Back to Books List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
