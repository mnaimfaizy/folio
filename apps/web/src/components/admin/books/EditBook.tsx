import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { GenreAutocompleteInput } from '@/components/shared/GenreAutocompleteInput';
import { useBookCoverUpload } from '@/lib/useBookCoverUpload';
import { useGenreSuggestions } from '@/lib/useGenreSuggestions';
import AdminService from '@/services/adminService';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BookAuthorsSection } from './BookAuthorsSection';
import { BookCoverSection } from './BookCoverSection';
import { bookSchema, type BookFormValues } from './bookSchema';
import { useBookAuthors } from './useBookAuthors';

export function EditBookComponent() {
  const params = useParams<{ id?: string; bookId?: string }>();
  const id = params.bookId ?? params.id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [featured, setFeatured] = useState(false);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      isbn: '',
      isbn10: '',
      isbn13: '',
      genre: '',
      publishYear: undefined,
      pages: undefined,
      author: '',
      description: '',
      cover: '',
      authors: [],
    },
  });

  const { reset, getValues } = form;
  const watchedTitle = form.watch('title');
  const lastRequestedBookIdRef = useRef<number | null>(null);

  const {
    uploadedCover,
    setUploadedCover,
    isCoverUploading,
    isCoverRemoving,
    coverInputRef,
    canUploadCover,
    openCoverFilePicker,
    onFileInputChange,
    onDrop,
    handleRemoveCover,
  } = useBookCoverUpload({
    getTitle: useCallback(
      () => getValues('title') || '',
      [getValues, watchedTitle],
    ),
    disabled: submitting,
  });

  const { genreSuggestions, resolveGenre } = useGenreSuggestions();

  const authorState = useBookAuthors();
  const { bookAuthors, fetchAllAuthors } = authorState;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      setLoading(false);
      return;
    }

    if (lastRequestedBookIdRef.current === numericId) {
      fetchAllAuthors();
      return;
    }
    lastRequestedBookIdRef.current = numericId;

    const fetchBookDetails = async (bookId: number) => {
      try {
        setLoading(true);
        const bookDetails = await AdminService.getBookById(bookId);

        reset({
          title: bookDetails?.title || '',
          isbn: bookDetails?.isbn || '',
          isbn10: bookDetails?.isbn10 || '',
          isbn13: bookDetails?.isbn13 || '',
          genre: bookDetails?.genre || '',
          publishYear: bookDetails?.publishYear || null,
          pages: bookDetails?.pages || null,
          author: bookDetails?.author || '',
          description: bookDetails?.description || '',
          cover: bookDetails?.cover || '',
        });

        if (bookDetails?.cover) {
          setUploadedCover({
            url: bookDetails.cover,
            key: bookDetails.coverKey || '',
          });
        } else {
          setUploadedCover(null);
        }

        setFeatured((bookDetails as any)?.featured);

        if (bookDetails?.authors?.length) {
          authorState.setBookAuthors(bookDetails.authors as any);
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast.error('Failed to load book details.');
        navigate('/admin/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails(numericId);
    fetchAllAuthors();
  }, [id, navigate, reset, setUploadedCover, fetchAllAuthors, authorState]);

  const onSubmit = async (values: BookFormValues) => {
    if (!id) {
      toast.error('Book ID is missing.');
      return;
    }

    try {
      setSubmitting(true);

      const bookData = { ...values };

      if (bookAuthors.length > 0) {
        bookData.authors = bookAuthors;
        bookData.author = bookAuthors
          .sort((a, b) => (a.is_primary ? -1 : 1) - (b.is_primary ? -1 : 1))
          .map((a) => a.name)
          .join(', ');
      }

      await AdminService.updateBook(parseInt(id), {
        ...bookData,
        isbn: bookData.isbn?.trim() || undefined,
        isbn10: bookData.isbn10?.trim() || undefined,
        isbn13: bookData.isbn13?.trim() || undefined,
        genre: bookData.genre?.trim()
          ? resolveGenre(bookData.genre)
          : undefined,
        publishYear: bookData.publishYear ?? undefined,
        pages: bookData.pages ?? undefined,
        cover: uploadedCover?.url || '',
        coverKey: uploadedCover?.key || '',
        featured,
      });

      toast.success('Book updated successfully!');
      navigate(`/admin/books/view/${id}`);
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
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
          {/* ── Cover ─────────────────────────── */}
          <div className="md:col-span-1">
            <BookCoverSection
              uploadedCover={uploadedCover}
              isCoverUploading={isCoverUploading}
              isCoverRemoving={isCoverRemoving}
              canUploadCover={canUploadCover}
              coverInputRef={coverInputRef}
              watchedTitle={watchedTitle}
              submitting={submitting}
              openCoverFilePicker={openCoverFilePicker}
              onFileInputChange={onFileInputChange}
              onDrop={onDrop}
              handleRemoveCover={handleRemoveCover}
            />
          </div>

          {/* ── Form fields ───────────────────── */}
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

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <GenreAutocompleteInput
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          suggestions={genreSuggestions}
                          disabled={submitting}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <BookAuthorsSection
                  bookAuthors={authorState.bookAuthors}
                  searchAuthors={authorState.searchAuthors}
                  authorSearch={authorState.authorSearch}
                  showAddAuthorDialog={authorState.showAddAuthorDialog}
                  setShowAddAuthorDialog={authorState.setShowAddAuthorDialog}
                  newAuthorName={authorState.newAuthorName}
                  setNewAuthorName={authorState.setNewAuthorName}
                  addingAuthor={authorState.addingAuthor}
                  searchForAuthors={authorState.searchForAuthors}
                  handleAddExistingAuthor={authorState.handleAddExistingAuthor}
                  handleCreateNewAuthor={authorState.handleCreateNewAuthor}
                  handleRemoveAuthor={authorState.handleRemoveAuthor}
                  handleSetPrimaryAuthor={authorState.handleSetPrimaryAuthor}
                  moveAuthor={authorState.moveAuthor}
                />

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
                    name="isbn10"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN-10</FormLabel>
                        <FormControl>
                          <Input placeholder="ISBN-10 (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isbn13"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN-13</FormLabel>
                        <FormControl>
                          <Input placeholder="ISBN-13 (optional)" {...field} />
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
                            value={field.value || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === '' ? null : parseInt(v));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pages</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Pages (optional)"
                            min={1}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === '' ? null : parseInt(v));
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                    disabled={submitting}
                  />
                  <Label htmlFor="featured">Feature on landing page</Label>
                </div>

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
