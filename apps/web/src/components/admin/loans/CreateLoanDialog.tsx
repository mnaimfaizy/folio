import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AdminService, { type User, type Book } from '@/services/adminService';

interface CreateLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateLoanDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLoanDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [bookPopoverOpen, setBookPopoverOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [fetchedUsers, fetchedBooks] = await Promise.all([
          AdminService.getAllUsers(),
          AdminService.getAllBooks(),
        ]);
        setUsers(fetchedUsers);
        setBooks(fetchedBooks);
      } catch {
        toast.error('Failed to load users or books');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setUserId('');
      setBookId('');
      setDueDate('');
      setUserPopoverOpen(false);
      setBookPopoverOpen(false);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error('Please select a user');
      return;
    }
    if (!bookId) {
      toast.error('Please select a book');
      return;
    }
    if (!dueDate) {
      toast.error('Please set a due date');
      return;
    }

    const dueDateObj = new Date(dueDate);
    if (dueDateObj <= new Date()) {
      toast.error('Due date must be in the future');
      return;
    }

    try {
      setSubmitting(true);
      await AdminService.createLoan({
        userId: Number(userId),
        bookId: Number(bookId),
        dueDate: dueDateObj.toISOString(),
      });
      toast.success('Loan created successfully');
      handleOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr?.response?.data?.message ?? 'Failed to create loan');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const selectedUser = users.find((u) => String(u.id) === userId);
  const selectedBook = books.find((b) => String(b.id) === bookId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Create Loan</DialogTitle>
          <DialogDescription>
            Create an active loan directly for a user. The book's available
            copies will be decremented immediately.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            {/* User combobox */}
            <div className="grid gap-2">
              <Label>User</Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userPopoverOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedUser
                        ? `${selectedUser.name} — ${selectedUser.email}`
                        : 'Search user…'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-(--radix-popover-trigger-width) p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search by name or email…" />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.name} ${u.email}`}
                            onSelect={() => {
                              setUserId(String(u.id));
                              setUserPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                userId === String(u.id)
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            <span className="truncate">
                              {u.name}
                              <span className="text-muted-foreground ml-1 text-xs">
                                {u.email}
                              </span>
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Book combobox */}
            <div className="grid gap-2">
              <Label>Book</Label>
              <Popover open={bookPopoverOpen} onOpenChange={setBookPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={bookPopoverOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedBook ? selectedBook.title : 'Search book…'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-(--radix-popover-trigger-width) p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search by title or author…" />
                    <CommandList>
                      <CommandEmpty>No books found.</CommandEmpty>
                      <CommandGroup>
                        {books.map((b) => (
                          <CommandItem
                            key={b.id}
                            value={`${b.title} ${b.author ?? ''}`}
                            onSelect={() => {
                              setBookId(String(b.id));
                              setBookPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                bookId === String(b.id)
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            <span className="flex-1 truncate">
                              {b.title}
                              {b.available_copies !== undefined && (
                                <span
                                  className={cn(
                                    'ml-2 text-xs',
                                    b.available_copies === 0
                                      ? 'text-destructive'
                                      : 'text-muted-foreground',
                                  )}
                                >
                                  ({b.available_copies} available)
                                </span>
                              )}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Due date */}
            <div className="grid gap-2">
              <Label htmlFor="loan-due-date">Due Date</Label>
              <div className="relative">
                <input
                  id="loan-due-date"
                  type="date"
                  min={minDateStr}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 pr-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <CalendarIcon className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loadingData}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              'Create Loan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
