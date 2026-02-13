import { useMemo, useState } from 'react';

import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';

type GenreAutocompleteInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
};

export function GenreAutocompleteInput(props: GenreAutocompleteInputProps) {
  const {
    value,
    onValueChange,
    suggestions,
    placeholder = 'Start typing to search genres',
    disabled = false,
    name,
  } = props;

  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    // Only show suggestions once the user has typed something.
    if (!query) return [];
    return suggestions.filter((g) => g.toLowerCase().includes(query));
  }, [suggestions, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="w-full">
          <Input
            name={name}
            placeholder={placeholder}
            autoComplete="off"
            disabled={disabled}
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

              const hasMatch = suggestions.some((g) =>
                g.toLowerCase().includes(query),
              );
              setOpen(hasMatch);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
              }
            }}
          />
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
            {filtered.map((g) => (
              <CommandItem
                key={g}
                value={g}
                onSelect={() => {
                  onValueChange(g);
                  setOpen(false);
                }}
                className="justify-start"
              >
                <span className="w-full text-left">{g}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
