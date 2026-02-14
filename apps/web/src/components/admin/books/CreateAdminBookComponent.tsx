import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BookPlus, ArrowLeft, Search, X } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import AdminService, {
  ExternalBookResult,
  ExternalSearchType,
  ExternalSource,
} from '@/services/adminService';
import { useBookCoverUpload } from '@/lib/useBookCoverUpload';
import { useGenreSuggestions } from '@/lib/useGenreSuggestions';
import { GenreAutocompleteInput } from '@/components/shared/GenreAutocompleteInput';

export function CreateAdminBookComponent() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [pages, setPages] = useState('');
  const [isbn, setIsbn] = useState('');
  const [isbn10, setIsbn10] = useState('');
  const [isbn13, setIsbn13] = useState('');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);
  const [addToCollection, setAddToCollection] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [source, setSource] = useState<ExternalSource>('openlibrary');
  const [searchType, setSearchType] = useState<ExternalSearchType>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExternalBookResult[]>([]);

  const navigate = useNavigate();

  const {
    uploadedCover,
    setUploadedCover,
    isCoverUploading,
    isCoverRemoving,
    coverInputRef,
    canUploadCover,
    slugifyTitle,
    openCoverFilePicker,
    onFileInputChange,
    onDrop,
    handleRemoveCover,
  } = useBookCoverUpload({
    getTitle: useCallback(() => title, [title]),
    disabled: isSubmitting,
  });

  const { genreSuggestions, resolveGenre } = useGenreSuggestions();

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
      if (!results.length) {
        toast.message('No results found for this source.');
      }
    } catch (error) {
      console.error('External search failed:', error);
      toast.error('External search failed. Check API configuration.');
    } finally {
      setIsSearching(false);
    }
  };

  const applyResultToForm = (result: ExternalBookResult) => {
    setTitle(result.title || '');
    setAuthor(result.authors?.length ? result.authors.join(', ') : '');
    setIsbn(result.isbn13 || result.isbn10 || result.isbn || '');
    setIsbn10(result.isbn10 || '');
    setIsbn13(result.isbn13 || '');
    setPublishedYear(result.publishYear ? String(result.publishYear) : '');
    setPages(typeof result.pages === 'number' ? String(result.pages) : '');
    setGenre(result.genre ? resolveGenre(result.genre) : '');
    setDescription(result.description || '');
    // Cover image must be uploaded via UploadThing (do not accept external URLs here)
    setUploadedCover(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!uploadedCover) {
        toast.warning(
          'Please upload a book cover image (jpg, jpeg, png, webp · max 500KB).',
        );
        return;
      }

      const publishYearValue = publishedYear
        ? parseInt(publishedYear, 10)
        : undefined;
      const pagesValue = pages ? parseInt(pages, 10) : undefined;
      const resolvedGenre = genre ? resolveGenre(genre) : '';
      const authors = author
        ? author
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
            .map((name) => ({ name }))
        : undefined;

      await AdminService.createBook({
        title,
        author,
        authors,
        genre: resolvedGenre || undefined,
        isbn: isbn || undefined,
        isbn10: isbn10 || undefined,
        isbn13: isbn13 || undefined,
        publishYear: publishYearValue,
        pages: pagesValue,
        description: description || undefined,
        cover: uploadedCover.url,
        coverKey: uploadedCover.key,
        addToCollection,
        featured,
      });

      setIsSuccess(true);
      toast.success(`Book "${title}" was added to the catalog.`);

      setTimeout(() => {
        resetForm();
        navigate('/admin/books');
      }, 1500);
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
    setPublishedYear('');
    setPages('');
    setIsbn('');
    setIsbn10('');
    setIsbn13('');
    setDescription('');
    setUploadedCover(null);
    setAvailable(true);
    setAddToCollection(false);
    setFeatured(false);
    setIsSuccess(false);
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
                  onValueChange={(value) => setSource(value as ExternalSource)}
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
                  onValueChange={(value) =>
                    setSearchType(value as ExternalSearchType)
                  }
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
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            API keys are configured server-side for admin imports.
          </CardFooter>
        </Card>

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
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter book title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">
                    Author <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="author"
                    placeholder="Enter author name"
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <GenreAutocompleteInput
                    value={genre}
                    onValueChange={setGenre}
                    suggestions={genreSuggestions}
                    disabled={isSubmitting}
                    name="genre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishedYear">Published Year</Label>
                  <Input
                    id="publishedYear"
                    type="number"
                    placeholder="YYYY"
                    min="1000"
                    max={new Date().getFullYear()}
                    value={publishedYear}
                    onChange={(event) => setPublishedYear(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    placeholder="e.g. 320"
                    min="1"
                    value={pages}
                    onChange={(event) => setPages(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    placeholder="Enter ISBN number"
                    value={isbn}
                    onChange={(event) => setIsbn(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn10">ISBN-10</Label>
                  <Input
                    id="isbn10"
                    placeholder="Enter ISBN-10"
                    value={isbn10}
                    onChange={(event) => setIsbn10(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn13">ISBN-13</Label>
                  <Input
                    id="isbn13"
                    placeholder="Enter ISBN-13"
                    value={isbn13}
                    onChange={(event) => setIsbn13(event.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>
                    Cover Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    <div className="rounded-lg border bg-background p-4 space-y-3">
                      <div>
                        <div className="text-sm font-medium">Upload Cover</div>
                        <div className="text-sm text-muted-foreground">
                          {uploadedCover?.url
                            ? 'Drag & drop a new image to replace, or browse to upload.'
                            : 'Drag & drop a cover image here, or click to browse.'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          JPG/PNG/WebP · max 500KB
                        </div>
                      </div>

                      <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={onFileInputChange}
                        />

                        <div
                          className={
                            'flex flex-col items-center justify-center text-center gap-3 rounded-lg p-8 min-h-56 ' +
                            (canUploadCover
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed')
                          }
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            onDrop(event);
                          }}
                          onClick={() => {
                            openCoverFilePicker();
                          }}
                        >
                          <div className="text-sm text-muted-foreground">
                            {isCoverUploading
                              ? 'Uploading cover...'
                              : title.trim()
                                ? 'Drop image here or click to upload'
                                : 'Enter a title to enable cover upload'}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!canUploadCover}
                            onClick={(event) => {
                              event.stopPropagation();
                              openCoverFilePicker();
                            }}
                          >
                            Choose Image
                          </Button>
                          {title.trim() ? (
                            <div className="text-xs text-muted-foreground wrap-break-word max-w-full">
                              Saved as: {slugifyTitle(title)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background p-4 space-y-3">
                      <div>
                        <div className="text-sm font-medium">Cover Preview</div>
                        <div className="text-xs text-muted-foreground">
                          {uploadedCover?.url
                            ? 'Click remove to upload a different image.'
                            : 'No cover uploaded yet.'}
                        </div>
                      </div>

                      <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-center">
                        {uploadedCover?.url ? (
                          <div className="relative">
                            <img
                              src={uploadedCover.url}
                              alt="Uploaded cover"
                              className="w-36 h-52 md:w-40 md:h-60 object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 rounded-full"
                              disabled={
                                isSubmitting ||
                                isCoverUploading ||
                                isCoverRemoving
                              }
                              onClick={() => void handleRemoveCover()}
                              aria-label="Remove uploaded cover"
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground py-10">
                            Upload an image to preview it here.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter book description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                  />
                </div>

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
                  <Label htmlFor="addToCollection">Add to my collection</Label>
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
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Book'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
