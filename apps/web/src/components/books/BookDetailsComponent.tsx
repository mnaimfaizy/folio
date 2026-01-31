import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import bookService from "@/services/bookService";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BookOpen,
  BarChart4,
  ChevronLeft,
  Users,
  Bookmark,
  BookMarked,
  Pencil,
  AlertTriangle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewListComponent } from "./ReviewListComponent";
import { ReviewFormComponent } from "./ReviewFormComponent";
import { StarRating } from "@/components/ui/star-rating";

// Define enhanced interface for book details from API
interface BookDetails {
  id: number;
  title: string;
  isbn: string;
  description: string;
  published_date: string;
  page_count: number;
  cover_image_url: string;
  rating: number;
  genre: string;
  authors: Array<{
    id: number;
    name: string;
    biography?: string;
    photo_url?: string;
    is_primary: boolean;
  }>;
}

// Interface for similar books
interface SimilarBook {
  id: number;
  title: string;
  cover_image_url?: string;
}

export function BookDetailsComponent() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([]);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  // Check if the book is in the user's collection
  const [isInCollection, setIsInCollection] = useState<boolean>(false);
  const [collectionLoading, setCollectionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails(bookId);
      checkIfInCollection(bookId);
    }
  }, [bookId]);

  const fetchBookDetails = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await bookService.getBookById(Number(id));
      if (!data) {
        setError("Book not found");
        setLoading(false);
        return;
      }

      // Convert from Book format to BookDetails format
      const bookDetails: BookDetails = {
        id: data.id!,
        title: data.title,
        isbn: data.isbn || "",
        description: data.description || "",
        published_date: data.publishedDate || "",
        page_count: data.publishYear || 0,
        cover_image_url: data.cover || data.coverImage || "",
        rating: 0, // Default if not provided
        genre: data.genre || "",
        authors: data.authors
          ? data.authors.map((author) => ({
              // Ensure id is always a number (not undefined)
              id: author.id || 0,
              name: author.name,
              biography: author.biography,
              photo_url: author.photo_url,
              is_primary: author.is_primary || false,
            }))
          : [],
      };

      setBook(bookDetails);

      // Fetch similar books recommendation based on genre
      if (bookDetails.genre) {
        try {
          // Simulate fetching similar books based on genre
          // Replace this with actual API call once implemented
          const allBooks = await bookService.getAllBooks();
          const genre = bookDetails.genre.split(",")[0].trim(); // Use first genre

          const similarBooksData = allBooks
            .filter((b) => b.genre?.includes(genre) && b.id !== Number(id))
            .slice(0, 4)
            .map((b) => ({
              id: b.id!,
              title: b.title,
              cover_image_url: b.cover || b.coverImage || "",
            }));

          setSimilarBooks(similarBooksData);
        } catch (recError) {
          console.warn("Error fetching similar books:", recError);
          // Non-critical error, don't show to user
        }
      }
    } catch (error) {
      console.error("Error fetching book details:", error);
      setError("Failed to load book details. Please try again later.");
      toast.error("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  const checkIfInCollection = async (bookId: string) => {
    setCollectionLoading(true);
    try {
      const isInCollection = await bookService.isBookInUserCollection(
        Number(bookId)
      );
      setIsInCollection(isInCollection);
    } catch (error) {
      console.error("Error checking collection status:", error);
      // Don't show error to user as this is a secondary feature
    } finally {
      setCollectionLoading(false);
    }
  };

  const toggleCollection = async () => {
    if (!book) return;

    setCollectionLoading(true);
    try {
      if (isInCollection) {
        await bookService.removeFromUserCollection(book.id);
        toast.success("Book removed from your collection");
      } else {
        await bookService.addToUserCollection(book.id);
        toast.success("Book added to your collection");
      }
      setIsInCollection(!isInCollection);
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
    } finally {
      setCollectionLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Trigger a refresh of the reviews list
    setReviewRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-4 text-lg">Loading book details...</span>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8 bg-red-50 dark:bg-gray-800 border border-red-100 dark:border-gray-700 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {error || "The book you're looking for couldn't be found."}
          </p>
          <Button asChild>
            <Link to="/my-books">Return to Books Catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Link to="/my-books/collection" className="ml-4">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            View My Collection
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Cover and Main Info - Left Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="aspect-[2/3] max-h-[500px] rounded-xl overflow-hidden shadow-xl mb-6">
              <img
                src={
                  book.cover_image_url ||
                  "https://via.placeholder.com/400x600?text=No+Cover"
                }
                alt={`${book.title} cover`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <Button
                className="w-full flex items-center gap-2"
                onClick={toggleCollection}
                disabled={collectionLoading}
              >
                {collectionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isInCollection ? (
                  <BookMarked className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
                {isInCollection ? "In My Collection" : "Add to My Collection"}
              </Button>

              {/* Admin/Edit functions if needed */}
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                asChild
              >
                <Link to={`/books/edit/${book.id}`}>
                  <Pencil className="h-4 w-4" />
                  Edit Book
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Book Details - Center Column */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            {/* Title and Rating */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold">{book.title}</h1>

              {book.rating > 0 && (
                <div className="flex items-center mt-2">
                  <StarRating rating={book.rating} />
                </div>
              )}

              {/* Genre badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {book.genre &&
                  book.genre.split(",").map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre.trim()}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Authors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Authors
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {book.authors.map((author) => (
                  <div
                    key={author.id}
                    className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={
                          author.photo_url ||
                          `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                            author.name
                          )}`
                        }
                        alt={author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="font-medium">{author.name}</p>
                      {author.is_primary && (
                        <Badge variant="outline" className="text-xs">
                          Primary Author
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      asChild
                    >
                      <Link to={`/authors/${encodeURIComponent(author.name)}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Book details tabs */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="mb-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="prose dark:prose-invert"
              >
                <div className="space-y-4">
                  {book.description ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: book.description }}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No description available for this book.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ISBN
                      </p>
                      <p className="font-medium">{book.isbn || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Published
                      </p>
                      <p className="font-medium">
                        {book.published_date
                          ? format(
                              new Date(book.published_date),
                              "MMMM d, yyyy"
                            )
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BarChart4 className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pages
                      </p>
                      <p className="font-medium">
                        {book.page_count || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-8">
                  {/* Review Form */}
                  <div className="mb-8">
                    <ReviewFormComponent
                      bookId={book.id}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  </div>

                  {/* Reviews List */}
                  <ReviewListComponent
                    bookId={book.id}
                    key={`reviews-${reviewRefreshTrigger}`}
                    onReviewDeleted={handleReviewSubmitted}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Recommendations - Similar Books */}
          {similarBooks.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Similar Books</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarBooks.map((simBook) => (
                  <Link
                    key={simBook.id}
                    to={`/books/${simBook.id}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={
                            simBook.cover_image_url ||
                            "https://via.placeholder.com/200x300?text=No+Cover"
                          }
                          alt={`${simBook.title} cover`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm line-clamp-2">
                          {simBook.title}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
