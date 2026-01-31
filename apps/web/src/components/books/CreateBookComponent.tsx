import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BookPlus, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookService from "@/services/bookService";
import { toast } from "sonner";

export function CreateBookComponent() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [available, setAvailable] = useState(true);
  const [addToCollection, setAddToCollection] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Available genres
  const genres = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Science Fiction",
    "Fantasy",
    "Biography",
    "History",
    "Self-Help",
    "Business",
    "Children's Books",
    "Young Adult",
    "Horror",
    "Poetry",
    "Classic",
    "Dystopian",
    "Adventure",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bookData = {
        title,
        author,
        genre,
        publishedDate: publishedYear
          ? new Date(parseInt(publishedYear), 0, 1).toISOString()
          : undefined,
        isbn,
        description,
        coverImage: coverUrl,
        // other fields as needed by your API
      };

      await BookService.createBook(bookData, addToCollection);
      setIsSuccess(true);

      toast.success(
        `Book "${title}" was successfully added ${
          addToCollection ? "and added to your collection" : ""
        }!`
      );

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
        navigate("/books");
      }, 2000);
    } catch (error) {
      console.error("Error creating book:", error);
      toast.error("Failed to create book. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setPublishedYear("");
    setIsbn("");
    setDescription("");
    setCoverUrl("");
    setAvailable(true);
    setAddToCollection(true);
    setIsSuccess(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate("/books")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>
        <h1 className="text-3xl font-bold">Add New Book</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookPlus className="h-5 w-5 mr-2" />
            Book Information
          </CardTitle>
          <CardDescription>
            Fill in the details below to add a new book to the library.
          </CardDescription>
        </CardHeader>

        {isSuccess && (
          <Alert className="mx-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Book successfully added to the library!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter book title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">
                  Author <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="author"
                  placeholder="Enter author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label htmlFor="genre">
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Select value={genre} onValueChange={setGenre} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Published Year */}
              <div className="space-y-2">
                <Label htmlFor="publishedYear">Published Year</Label>
                <Input
                  id="publishedYear"
                  type="number"
                  placeholder="YYYY"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                />
              </div>

              {/* ISBN */}
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  placeholder="Enter ISBN number"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>

              {/* Cover URL */}
              <div className="space-y-2">
                <Label htmlFor="coverUrl">Cover Image URL</Label>
                <Input
                  id="coverUrl"
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter book description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>

              {/* Availability Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={available}
                  onCheckedChange={setAvailable}
                />
                <Label htmlFor="available">
                  Book is available for borrowing
                </Label>
              </div>

              {/* Add to Collection Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="addToCollection"
                  checked={addToCollection}
                  onCheckedChange={setAddToCollection}
                />
                <Label htmlFor="addToCollection">
                  Add to my personal collection
                </Label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={resetForm}>
              Clear Form
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Book"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
