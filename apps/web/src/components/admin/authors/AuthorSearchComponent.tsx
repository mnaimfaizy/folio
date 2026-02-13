import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import authorService, { ExternalAuthorResult } from '@/services/authorService';
import { BookOpen, Globe, Loader2, Search, User } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface AuthorSearchComponentProps {
  onSelectAuthor: (author: Partial<ExternalAuthorResult>) => void;
  initialQuery?: string;
}

export function AuthorSearchComponent({
  onSelectAuthor,
  initialQuery = '',
}: AuthorSearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchSource, setSearchSource] = useState<
    'openlibrary' | 'wikidata' | 'googlebooks'
  >('openlibrary');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExternalAuthorResult[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  // Update search query when initialQuery prop changes
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);
  // Handle search form submission
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter an author name to search');
      return;
    }

    setError(null);
    setSearchResults([]);
    setIsSearching(true);
    setSelectedAuthorId(null);

    try {
      const results = await authorService.searchExternalAuthors(
        searchSource,
        searchQuery,
      );
      setSearchResults(results);

      if (results.length === 0) {
        setError(`No authors found for "${searchQuery}" in ${searchSource}`);
      }
    } catch (err: unknown) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting an author from results
  const handleSelectAuthor = async (author: ExternalAuthorResult) => {
    // Fetch detailed information if available
    if (
      author.key &&
      (searchSource === 'openlibrary' || searchSource === 'wikidata')
    ) {
      try {
        setSelectedAuthorId(author.externalId || author.key);
        const detailedAuthor = await authorService.getExternalAuthorDetails(
          searchSource,
          author.key,
        );
        onSelectAuthor(detailedAuthor);
      } catch (error) {
        console.error('Error fetching detailed author info:', error);
        // Fall back to basic info
        onSelectAuthor(author);
      } finally {
        setSelectedAuthorId(null);
      }
    } else {
      onSelectAuthor(author);
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'openlibrary':
        return 'Open Library';
      case 'wikidata':
        return 'Wikidata';
      case 'googlebooks':
        return 'Google Books';
      default:
        return source;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Search External Sources
          </CardTitle>
          <CardDescription>
            Search for author information from Open Library, Wikidata, or Google
            Books
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Enter author name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                  className="w-full"
                />
              </div>
              <Select
                value={searchSource}
                onValueChange={(value) =>
                  setSearchSource(value as typeof searchSource)
                }
                disabled={isSearching}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openlibrary">Open Library</SelectItem>
                  <SelectItem value="wikidata">Wikidata</SelectItem>
                  <SelectItem value="googlebooks">Google Books</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSearching} className="w-full">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Authors
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Search Results ({searchResults.length})
          </h3>
          {searchResults.map((author, index) => (
            <Card
              key={author.externalId || author.key || index}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {author.photoUrl && (
                      <img
                        src={author.photoUrl}
                        alt={author.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-lg">{author.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Source: {getSourceLabel(author.source)}
                        </p>
                      </div>

                      {author.biography && (
                        <p className="text-sm line-clamp-3">
                          {author.biography}
                        </p>
                      )}

                      {author.alternateNames &&
                        author.alternateNames.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-muted-foreground">
                              Also known as:
                            </span>{' '}
                            <span className="text-muted-foreground">
                              {author.alternateNames.slice(0, 5).join(', ')}
                              {author.alternateNames.length > 5 &&
                                ` (+${author.alternateNames.length - 5} more)`}
                            </span>
                          </div>
                        )}

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {author.birthDate && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Born: {author.birthDate}
                          </span>
                        )}
                        {author.deathDate && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Died: {author.deathDate}
                          </span>
                        )}
                        {author.workCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {author.workCount} works
                          </span>
                        )}
                      </div>

                      {author.topWorks && author.topWorks.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Notable works:</span>{' '}
                          {author.topWorks.slice(0, 3).join(', ')}
                        </div>
                      )}

                      {author.links && (
                        <div className="flex gap-2 text-xs">
                          {author.links.wikipedia && (
                            <a
                              href={author.links.wikipedia}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Wikipedia
                            </a>
                          )}
                          {author.links.website && (
                            <a
                              href={author.links.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSelectAuthor(author)}
                    disabled={
                      selectedAuthorId === (author.externalId || author.key)
                    }
                    size="sm"
                  >
                    {selectedAuthorId === (author.externalId || author.key) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Use This Data'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
