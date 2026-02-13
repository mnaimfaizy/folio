import { useMemo, useState, useEffect } from 'react';

import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { Author } from '@/services/authorService';
import { Check, Loader2 } from 'lucide-react';

type AuthorAutocompleteInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onAuthorSelect?: (author: Author | null) => void;
  authors: Author[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  loading?: boolean;
};

export function AuthorAutocompleteInput(props: AuthorAutocompleteInputProps) {
  const {
    value,
    onValueChange,
    onAuthorSelect,
    authors,
    placeholder = 'Start typing to search authors',
    disabled = false,
    name,
    loading = false,
  } = props;

  const [open, setOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    // Only show suggestions once the user has typed something.
    if (!query) return [];
    return authors
      .filter((author) => author.name.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 results for performance
  }, [authors, value]);

  // Check if the current value exactly matches an author
  useEffect(() => {
    if (!value) {
      setSelectedAuthor(null);
      onAuthorSelect?.(null);
      return;
    }

    const exactMatch = authors.find(
      (author) => author.name.toLowerCase() === value.toLowerCase(),
    );

    if (exactMatch && exactMatch.id !== selectedAuthor?.id) {
      setSelectedAuthor(exactMatch);
      onAuthorSelect?.(exactMatch);
    } else if (!exactMatch && selectedAuthor) {
      setSelectedAuthor(null);
      onAuthorSelect?.(null);
    }
  }, [value, authors, selectedAuthor, onAuthorSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="w-full relative">
          <Input
            name={name}
            placeholder={placeholder}
            autoComplete="off"
            disabled={disabled || loading}
            value={value}
            onFocus={() => {
              // Keep closed on focus/click; open only when there are matches while typing.
              setOpen(false);
            }}
            onChange={(event) => {
              const nextValue = event.target.value;
              onValueChange(nextValue);

              const query = nextValue.trim().toLowerCase();
              if (!query) {
                setOpen(false);
                return;
              }

              const hasMatch = authors.some((author) =>
                author.name.toLowerCase().includes(query),
              );
              setOpen(hasMatch);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
              }
            }}
            className={selectedAuthor ? 'pr-8' : ''}
          />
          {loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {selectedAuthor && !loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="p-0 w-[--radix-popover-trigger-width]"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-56">
            {filtered.map((author) => (
              <CommandItem
                key={author.id || author.name}
                value={author.name}
                onSelect={() => {
                  onValueChange(author.name);
                  setSelectedAuthor(author);
                  onAuthorSelect?.(author);
                  setOpen(false);
                }}
                className="justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{author.name}</span>
                  {author.book_count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {author.book_count}{' '}
                      {author.book_count === 1 ? 'book' : 'books'}
                    </span>
                  )}
                </div>
                {selectedAuthor?.id === author.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
