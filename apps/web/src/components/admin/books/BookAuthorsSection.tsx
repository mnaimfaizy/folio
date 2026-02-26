import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Author } from '@/services/bookService';
import { Check, Loader2, MoveDown, MoveUp, Plus, X } from 'lucide-react';

/* ================================================================
   Authors section for the book edit/create form
   ================================================================ */

interface BookAuthorsSectionProps {
  bookAuthors: Author[];
  searchAuthors: Author[];
  authorSearch: string;
  showAddAuthorDialog: boolean;
  setShowAddAuthorDialog: (open: boolean) => void;
  newAuthorName: string;
  setNewAuthorName: (name: string) => void;
  addingAuthor: boolean;
  searchForAuthors: (query: string) => void;
  handleAddExistingAuthor: (author: Author) => void;
  handleCreateNewAuthor: () => void;
  handleRemoveAuthor: (id: number) => void;
  handleSetPrimaryAuthor: (id: number) => void;
  moveAuthor: (index: number, direction: 'up' | 'down') => void;
}

export function BookAuthorsSection({
  bookAuthors,
  searchAuthors,
  authorSearch,
  showAddAuthorDialog,
  setShowAddAuthorDialog,
  newAuthorName,
  setNewAuthorName,
  addingAuthor,
  searchForAuthors,
  handleAddExistingAuthor,
  handleCreateNewAuthor,
  handleRemoveAuthor,
  handleSetPrimaryAuthor,
  moveAuthor,
}: BookAuthorsSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Authors</label>
        <div className="flex gap-2">
          {/* ── Add existing author ─────────────── */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" type="button" className="h-8">
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
                          onSelect={() => handleAddExistingAuthor(author)}
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

          {/* ── Create new author ───────────────── */}
          <Dialog
            open={showAddAuthorDialog}
            onOpenChange={setShowAddAuthorDialog}
          >
            <DialogTrigger asChild>
              <Button variant="default" size="sm" type="button" className="h-8">
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

              <div className="py-4 space-y-2">
                <label className="text-sm font-medium">Author Name</label>
                <Input
                  placeholder="Author name"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Enter the full name of the author
                </p>
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

      {/* ── Authors list ──────────────────────── */}
      <div className="space-y-2 mt-4">
        {bookAuthors.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500 border border-dashed rounded-md">
            No authors added. Please add at least one author.
          </div>
        ) : (
          bookAuthors.map((author, index) => (
            <div
              key={author.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                author.is_primary
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                      author.name,
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
                    onClick={() => handleSetPrimaryAuthor(author.id!)}
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
                  onClick={() => moveAuthor(index, 'up')}
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
                  onClick={() => moveAuthor(index, 'down')}
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
  );
}
