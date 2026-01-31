import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import BookService, { Author } from "@/services/bookService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  Loader2,
  MoveDown,
  MoveUp,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";
import authorService from "../../services/authorService";

// Form validation schema
const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isbn: z.string().optional(),
  publishYear: z.coerce
    .number()
    .int("Publication year must be a whole number")
    .min(0, "Publication year cannot be negative")
    .max(
      new Date().getFullYear() + 5,
      "Publication year cannot be in the far future"
    )
    .optional()
    .nullable(),
  author: z.string().optional(), // Keep for backward compatibility
  description: z.string().optional(),
  cover: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookSchema> & {
  authors?: Author[];
};

export function EditBookComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookAuthors, setBookAuthors] = useState<Author[]>([]);
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [searchAuthors, setSearchAuthors] = useState<Author[]>([]);
  const [authorSearch, setAuthorSearch] = useState<string>("");
  const [showAddAuthorDialog, setShowAddAuthorDialog] =
    useState<boolean>(false);
  const [newAuthorName, setNewAuthorName] = useState<string>("");
  const [addingAuthor, setAddingAuthor] = useState<boolean>(false);

  // Setup form with zod validation
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      isbn: "",
      publishYear: undefined,
      author: "", // Still keeping for backward compatibility
      description: "",
      cover: "",
      authors: [],
    },
  });

  useEffect(() => {
    if (id) {
      const fetchBookDetails = async (bookId: number) => {
        try {
          setLoading(true);
          const bookDetails = await BookService.getBookById(bookId);

          // Set form values from book details
          form.reset({
            title: bookDetails?.title || "",
            isbn: bookDetails?.isbn || "",
            publishYear: bookDetails?.publishYear || null,
            author: bookDetails?.author || "", // Keep for backward compatibility
            description: bookDetails?.description || "",
            cover: bookDetails?.cover || "",
          });

          // Set book authors if they exist in the new schema
          if (bookDetails?.authors && bookDetails.authors.length > 0) {
            setBookAuthors(bookDetails.authors);
          }
        } catch (error) {
          console.error("Error fetching book details:", error);
          toast.error("Failed to load book details.");
          navigate("/books");
        } finally {
          setLoading(false);
        }
      };

      fetchBookDetails(parseInt(id));
      fetchAllAuthors();
    } else {
      setLoading(false);
    }
  }, [id, form, navigate]);

  const fetchAllAuthors = async () => {
    try {
      const authors: Author[] = await authorService.getAuthors();
      setAllAuthors(authors);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const searchForAuthors = async (query: string) => {
    setAuthorSearch(query);

    if (!query || query.length < 2) {
      setSearchAuthors([]);
      return;
    }

    // Filter authors locally instead of making API requests
    const lowerQuery = query.toLowerCase();
    const matchingAuthors = allAuthors.filter(
      (author) =>
        author.name.toLowerCase().includes(lowerQuery) &&
        !bookAuthors.some((bookAuthor) => bookAuthor.id === author.id)
    );

    setSearchAuthors(matchingAuthors as Author[]);
  };

  const handleAddExistingAuthor = (author: Author) => {
    // Don't add if already exists
    if (bookAuthors.some((a) => a.id === author.id)) {
      return;
    }

    // Add as non-primary by default if there's already a primary author
    const isPrimary =
      bookAuthors.length === 0 || !bookAuthors.some((a) => a.is_primary);
    const authorWithPrimary = { ...author, is_primary: isPrimary };

    setBookAuthors([...bookAuthors, authorWithPrimary]);
    setAuthorSearch("");
    setSearchAuthors([]);
  };

  const handleCreateNewAuthor = async () => {
    if (!newAuthorName.trim()) {
      return;
    }

    try {
      setAddingAuthor(true);

      // Check if author already exists
      const existingAuthor = allAuthors.find(
        (author) =>
          author.name.toLowerCase() === newAuthorName.trim().toLowerCase()
      );

      if (existingAuthor) {
        // If exists, just add to the book
        handleAddExistingAuthor(existingAuthor as Author);
      } else {
        // Create new author
        const newAuthor = await authorService.createAuthor({
          name: newAuthorName,
        });

        // Add to all authors list
        setAllAuthors([
          ...allAuthors,
          { id: newAuthor.id!, name: newAuthor.name },
        ]);

        // Add to book authors with primary status
        const isPrimary =
          bookAuthors.length === 0 || !bookAuthors.some((a) => a.is_primary);
        handleAddExistingAuthor({ ...newAuthor, is_primary: isPrimary });
      }

      // Reset form
      setNewAuthorName("");
      setShowAddAuthorDialog(false);
    } catch (error) {
      console.error("Error creating new author:", error);
      toast.error("Failed to create new author");
    } finally {
      setAddingAuthor(false);
    }
  };

  const handleRemoveAuthor = (authorId: number) => {
    const updatedAuthors = bookAuthors.filter(
      (author) => author.id !== authorId
    );

    // If we removed the primary author, make the first remaining author primary
    if (
      updatedAuthors.length > 0 &&
      !updatedAuthors.some((a) => a.is_primary)
    ) {
      updatedAuthors[0].is_primary = true;
    }

    setBookAuthors(updatedAuthors);
  };

  const handleSetPrimaryAuthor = (authorId: number) => {
    const updatedAuthors = bookAuthors.map((author) => ({
      ...author,
      is_primary: author.id === authorId,
    }));

    setBookAuthors(updatedAuthors);
  };

  const moveAuthor = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === bookAuthors.length - 1)
    ) {
      return;
    }

    const newAuthors = [...bookAuthors];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    // Swap positions
    [newAuthors[index], newAuthors[newIndex]] = [
      newAuthors[newIndex],
      newAuthors[index],
    ];

    setBookAuthors(newAuthors);
  };

  const onSubmit = async (values: BookFormValues) => {
    if (!id) {
      toast.error("Book ID is missing.");
      return;
    }

    try {
      setSubmitting(true);

      // Create a copy of the form values to submit
      const bookData = { ...values };

      // Add our authors if any
      if (bookAuthors.length > 0) {
        bookData.authors = bookAuthors;

        // Also set the author string for backward compatibility
        bookData.author = bookAuthors
          .sort((a, b) => (a.is_primary ? -1 : 1) - (b.is_primary ? -1 : 1))
          .map((a) => a.name)
          .join(", ");
      }

      await BookService.updateBook(parseInt(id), {
        ...bookData,
        publishYear: bookData.publishYear ?? undefined,
      });

      toast.success("Book updated successfully!");
      navigate(`/books/${id}`);
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading book details...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Book</h1>
      </div>

      <Form {...form}>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Book Cover</h2>

              <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-4">
                {form.watch("cover") ? (
                  <img
                    src={form.watch("cover")}
                    alt="Book Cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/300x450?text=No+Cover";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Cover Image
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="cover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/cover.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the URL for the book's cover image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Authors Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Authors</label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="h-8"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Existing
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-72">
                          <Command>
                            <CommandInput
                              placeholder="Search authors..."
                              value={authorSearch}
                              onValueChange={searchForAuthors}
                            />
                            <CommandList>
                              <CommandEmpty>
                                No authors found.
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    setShowAddAuthorDialog(true);
                                    setNewAuthorName(authorSearch);
                                  }}
                                  className="p-0 h-auto text-blue-500 underline block mt-1"
                                >
                                  Create "{authorSearch}"
                                </Button>
                              </CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-40">
                                  {searchAuthors.map((author) => (
                                    <CommandItem
                                      key={author.id}
                                      value={author.name}
                                      onSelect={() =>
                                        handleAddExistingAuthor(author)
                                      }
                                    >
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarFallback>
                                          {author.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{author.name}</span>
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <Dialog
                        open={showAddAuthorDialog}
                        onOpenChange={setShowAddAuthorDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            type="button"
                            className="h-8"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Create New
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Author</DialogTitle>
                            <DialogDescription>
                              Add a new author to the library database.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Author Name
                              </label>
                              <Input
                                placeholder="Author name"
                                value={newAuthorName}
                                onChange={(e) =>
                                  setNewAuthorName(e.target.value)
                                }
                              />
                              <p className="text-xs text-gray-500">
                                Enter the full name of the author
                              </p>
                            </div>
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              type="button"
                              onClick={handleCreateNewAuthor}
                              disabled={addingAuthor || !newAuthorName.trim()}
                            >
                              {addingAuthor && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Create Author
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Authors list */}
                  <div className="space-y-2 mt-4">
                    {bookAuthors.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500 border border-dashed rounded-md">
                        No authors added. Please add at least one author.
                      </div>
                    ) : (
                      bookAuthors.map((author, index) => (
                        <div
                          key={author.id}
                          className={`flex items-center justify-between p-2 rounded-md 
                            ${
                              author.is_primary
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : "bg-gray-50 dark:bg-gray-800"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                                  author.name
                                )}`}
                                alt={author.name}
                              />
                              <AvatarFallback>
                                {author.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{author.name}</span>
                            {author.is_primary && (
                              <Badge variant="secondary" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {!author.is_primary && (
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleSetPrimaryAuthor(author.id!)
                                }
                                title="Make primary author"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="h-7 w-7"
                              onClick={() => moveAuthor(index, "up")}
                              disabled={index === 0}
                              title="Move up"
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="h-7 w-7"
                              onClick={() => moveAuthor(index, "down")}
                              disabled={index === bookAuthors.length - 1}
                              title="Move down"
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveAuthor(author.id!)}
                              title="Remove author"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN</FormLabel>
                        <FormControl>
                          <Input placeholder="ISBN (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publishYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Publication year (optional)"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseInt(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Book description (optional)"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="mr-2"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
