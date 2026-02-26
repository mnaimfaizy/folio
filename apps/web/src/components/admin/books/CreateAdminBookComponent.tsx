import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { BookPlus, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminService, {
  ExternalBookResult,
  ExternalSearchType,
  ExternalSource,
} from '@/services/adminService';
import { useBookCoverUpload } from '@/lib/useBookCoverUpload';
import { useGenreSuggestions } from '@/lib/useGenreSuggestions';
import { GenreAutocompleteInput } from '@/components/shared/GenreAutocompleteInput';
import { BookCoverSection } from './BookCoverSection';
import { BookAuthorsSection } from './BookAuthorsSection';
import { useBookAuthors } from './useBookAuthors';
import { bookSchema, type BookFormValues } from './bookSchema';

export function CreateAdminBookComponent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [addToCollection, setAddToCollection] = useState(false);

  // External search state
  const [source, setSource] = useState<ExternalSource>('openlibrary');
  const [searchType, setSearchType] = useState<ExternalSearchType>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExternalBookResult[]>([]);

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

  const watchedTitle = form.watch('title');
  const { getValues, reset } = form;

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
  const { bookAuthors } = authorState;

  const sources = useMemo(
    () => [
      { value: 'openlibrary', label: 'Open Library (Free)' },
      { value: 'googlebooks', label: 'Google Books (Free quota)' },
      { value: 'loc', label: 'Library of Congress (Free)' },
      { value: 'wikidata', label: 'Wikidata (Free)' },
      { value: 'isbndb', label: 'ISBNdb (Paid)' },
      { value: 'worldcat', label: 'WorldCat (Paid)' },
    ],
    [],
  );

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning('Enter a search term.');
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await AdminService.searchExternalBooks(
        source,
        searchQuery.trim(),
        searchType,
      );
      setSearchResults(results);
      if (!results.length) toast.message('No results found for this source.');
    } catch (error) {
      console.error('External search failed:', error);
      toast.error('External search failed. Check API configuration.');
    } finally {
      setIsSearching(false);
    }
  };

  const applyResultToForm = (result: ExternalBookResult) => {
    reset({
      ...form.getValues(),
      title: result.title || '',
      author: result.authors?.length ? result.authors.join(', ') : '',
      isbn: result.isbn13 || result.isbn10 || result.isbn || '',
      isbn10: result.isbn10 || '',
      isbn13: result.isbn13 || '',
      publishYear: result.publishYear ?? undefined,
      pages: typeof result.pages === 'number' ? result.pages : undefined,
      genre: result.genre ? resolveGenre(result.genre) : '',
      description: result.description || '',
    });
    setUploadedCover(null);
  };

  const onSubmit = async (values: BookFormValues) => {
    if (!uploadedCover) {
      toast.warning(
        'Please upload a book cover image (jpg, jpeg, png, webp · max 500KB).',
      );
      return;
    }

    setSubmitting(true);
    try {
      const authors =
        bookAuthors.length > 0
          ? bookAuthors
          : values.author
            ? values.author
                .split(',')
                .map((name) => name.trim())
                .filter(Boolean)
                .map((name) => ({ name }))
            : undefined;

      const authorString =
        bookAuthors.length > 0
          ? bookAuthors
              .sort((a, b) => (a.is_primary ? -1 : 1) - (b.is_primary ? -1 : 1))
              .map((a) => a.name)
              .join(', ')
          : values.author || '';

      await AdminService.createBook({
        title: values.title,
        author: authorString,
        authors,
        genre: values.genre ? resolveGenre(values.genre) : undefined,
        isbn: values.isbn?.trim() || undefined,
        isbn10: values.isbn10?.trim() || undefined,
        isbn13: values.isbn13?.trim() || undefined,
        publishYear: values.publishYear ?? undefined,
        pages: values.pages ?? undefined,
        description: values.description || undefined,
        cover: uploadedCover.url,
        coverKey: uploadedCover.key,
        addToCollection,
        featured,
      });

      toast.success(`Book "${values.title}" was added to the catalog.`);
      setTimeout(() => navigate('/admin/books'), 1500);
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setUploadedCover(null);
    setAvailable(true);
    setAddToCollection(false);
    setFeatured(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate('/admin/books')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>
        <h1 className="text-3xl font-bold">Add New Book</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── External search panel ─────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Import from External Source
            </CardTitle>
            <CardDescription>
              Search external catalogs and prefill the book form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSearch}>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={source}
                  onValueChange={(v) => setSource(v as ExternalSource)}
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchType">Search Type</Label>
                <Select
                  value={searchType}
                  onValueChange={(v) => setSearchType(v as ExternalSearchType)}
                >
                  <SelectTrigger id="searchType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="isbn">ISBN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchQuery">Search</Label>
                <Input
                  id="searchQuery"
                  placeholder="Search term"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching…
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            API keys are configured server-side for admin imports.
          </CardFooter>
        </Card>

        {/* ── Book form ─────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookPlus className="h-5 w-5 mr-2" />
              Book Information
            </CardTitle>
            <CardDescription>
              Fill in the details below to add a new book to the library.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Cover upload */}
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

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Genre */}
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

                {/* Authors */}
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

                {/* Fallback plain-text author field when no structured authors added */}
                {bookAuthors.length === 0 && (
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Author <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Jane Austen, Charles Dickens"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* ISBN grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            placeholder="YYYY"
                            min="1000"
                            max={new Date().getFullYear()}
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === '' ? null : parseInt(v, 10));
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
                            placeholder="e.g. 320"
                            min="1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === '' ? null : parseInt(v, 10));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter book description"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Toggles */}
                <div className="space-y-3">
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="addToCollection"
                      checked={addToCollection}
                      onCheckedChange={setAddToCollection}
                    />
                    <Label htmlFor="addToCollection">
                      Add to my collection
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={featured}
                      onCheckedChange={setFeatured}
                    />
                    <Label htmlFor="featured">Feature on landing page</Label>
                  </div>
                </div>

                {/* External search results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-semibold">
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.source}-${result.isbn || index}`}
                          className="border rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium">{result.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.authors?.join(', ') || 'Unknown Author'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.isbn13
                                ? `ISBN-13 ${result.isbn13}`
                                : result.isbn10
                                  ? `ISBN-10 ${result.isbn10}`
                                  : result.isbn
                                    ? `ISBN ${result.isbn}`
                                    : 'No ISBN'}
                              {result.publishYear
                                ? ` · ${result.publishYear}`
                                : ''}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => applyResultToForm(result)}
                          >
                            Use Result
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save Book'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
