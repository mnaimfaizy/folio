import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import authorService, { AuthorWithBooks } from "@/services/authorService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Book as BookIcon, Bookmark, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function AuthorsComponent() {
  const { authorName } = useParams<{ authorName: string }>();
  const navigate = useNavigate();

  const [author, setAuthor] = useState<AuthorWithBooks | null>(null);
  interface OpenLibraryBook {
    title: string;
    cover_image_url?: string;
    published_date?: string;
  }

  const [openLibraryBooks, setOpenLibraryBooks] = useState<OpenLibraryBook[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authorName) {
      fetchAuthorData(authorName);
    }
  }, [authorName]);

  const fetchAuthorData = async (authorIdOrName: string) => {
    setLoading(true);
    setError(null);

    try {
      let authorData: AuthorWithBooks | null = null;

      // Check if authorName is a number (ID) or a string (name)
      const isId = !isNaN(Number(authorIdOrName));

      if (isId) {
        authorData = await authorService.getAuthorById(Number(authorIdOrName));
      } else {
        authorData = await authorService.getAuthorByName(
          decodeURIComponent(authorIdOrName)
        );
      }

      setAuthor(authorData);

      // Also fetch additional info from OpenLibrary
      try {
        const openLibraryInfo = await authorService.getAuthorInfo(
          authorData.name
        );
        if (openLibraryInfo && openLibraryInfo.works) {
          setOpenLibraryBooks(openLibraryInfo.works);
        }
      } catch (openLibError) {
        console.warn(
          "Could not fetch additional books from OpenLibrary:",
          openLibError
        );
      }
    } catch (error) {
      console.error("Error fetching author details:", error);
      setError("Failed to load author details. Please try again later.");
      toast.error("Failed to load author details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading author information...</div>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Author Not Found</h2>
          <p className="mb-6">
            {error || "The author you're looking for could not be found."}
          </p>
          <Button asChild>
            <Link to="/authors">Back to Authors</Link>
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
      </div>

      {/* Author Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="relative rounded-full overflow-hidden w-48 h-48 border-4 border-white shadow-lg">
              <img
                src={
                  author.photo_url ||
                  `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                    author.name
                  )}`
                }
                alt={`${author.name} photo`}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {author.name}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
              <BookIcon className="h-5 w-5" />
              <span>
                {author.book_count || author.books?.length || 0} works
              </span>
            </div>
            <div className="prose max-w-none dark:prose-invert">
              <p>
                {author.biography || "No biography available for this author."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Author Books */}
      <div>
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="library">In Our Library</TabsTrigger>
            <TabsTrigger value="openlibrary">More Books</TabsTrigger>
            <TabsTrigger value="about">About Author</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <h2 className="text-2xl font-bold mb-6">Books in Our Library</h2>

            {!author.books || author.books.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="mb-4">
                  No books by this author are currently in our library.
                </p>
                <Button asChild>
                  <Link to="/books/create">Add a Book</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {author.books.map((book) => (
                  <Card key={book.id} className="overflow-hidden flex flex-col">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={
                          book.cover_image_url ||
                          "https://via.placeholder.com/200x300?text=No+Cover"
                        }
                        alt={`${book.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {book.title}
                      </CardTitle>
                      <CardDescription>
                        {book.published_date
                          ? new Date(book.published_date).getFullYear()
                          : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 pb-2">
                      {book.isbn && (
                        <Badge variant="outline">ISBN: {book.isbn}</Badge>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link to={`/books/${book.id}`}>
                          <Info className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="openlibrary">
            <h2 className="text-2xl font-bold mb-6">
              More Books by {author.name}
            </h2>

            {openLibraryBooks.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p>
                  No additional books found for this author from Open Library.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {openLibraryBooks.slice(0, 8).map((book, index) => (
                  <Card key={index} className="overflow-hidden flex flex-col">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={
                          book.cover_image_url ||
                          "https://via.placeholder.com/200x300?text=No+Cover"
                        }
                        alt={`${book.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {book.title}
                      </CardTitle>
                      <CardDescription>
                        {book.published_date
                          ? new Date(book.published_date).getFullYear()
                          : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 mt-auto">
                      <Button variant="secondary" size="sm" className="flex-1">
                        <Bookmark className="h-4 w-4 mr-1" />
                        Add to Library
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <div className="prose max-w-none dark:prose-invert">
              <h2 className="text-2xl font-bold mb-6">About {author.name}</h2>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <p className="mb-4">
                  {author.biography ||
                    "No biography available for this author."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {author.birth_date && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Born:</span>
                      <span>{author.birth_date}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Known Works:</span>
                    <span>
                      {author.book_count || author.books?.length || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
