import { useState } from 'react';
import { toast } from 'sonner';
import { BookCheck, CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminService, { AdminLoan } from '@/services/adminService';

interface MarkReturnedDialogProps {
  loan: AdminLoan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function formatLoanStatus(status: AdminLoan['status']) {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'OVERDUE') return 'Overdue';
  return status;
}

function statusBadgeClass(status: AdminLoan['status']) {
  if (status === 'ACTIVE')
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0';
  if (status === 'OVERDUE')
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0';
  return '';
}

export function MarkReturnedDialog({
  loan,
  open,
  onOpenChange,
  onSuccess,
}: MarkReturnedDialogProps) {
  const today = new Date().toISOString().split('T')[0];
  const [returnDate, setReturnDate] = useState<string>(today);
  const [submitting, setSubmitting] = useState(false);

  // Reset date whenever dialog opens with a new loan
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setReturnDate(today);
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!loan) return;

    try {
      setSubmitting(true);
      await AdminService.markLoanReturned(loan.id, {
        returnDate: returnDate ? new Date(returnDate).toISOString() : undefined,
      });
      toast.success('Loan marked as returned. The borrower has been notified.');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to mark loan as returned', error);
      toast.error('Unable to mark loan as returned. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loan) return null;

  const borrowedDate = new Date(loan.borrowed_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dueDate = loan.due_date
    ? new Date(loan.due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookCheck className="h-5 w-5 text-emerald-600" />
            Mark as Returned
          </DialogTitle>
          <DialogDescription>
            Confirm the return of this loan. An email notification will be sent
            to the borrower.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Loan details summary */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground w-28 shrink-0">Book</span>
              <span className="font-medium text-right">
                {loan.book_title ?? `Book #${loan.book_id}`}
              </span>
            </div>
            {loan.book_author && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground w-28 shrink-0">
                  Author
                </span>
                <span className="text-right">{loan.book_author}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground w-28 shrink-0">
                Borrower
              </span>
              <div className="text-right">
                <div className="font-medium">
                  {loan.user_name ?? `User #${loan.user_id}`}
                </div>
                {loan.user_email && (
                  <div className="text-xs text-muted-foreground">
                    {loan.user_email}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground w-28 shrink-0">
                Borrowed
              </span>
              <span className="text-right">{borrowedDate}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground w-28 shrink-0">
                Due Date
              </span>
              <span className="text-right">{dueDate}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground w-28 shrink-0">
                Status
              </span>
              <Badge className={statusBadgeClass(loan.status)}>
                {formatLoanStatus(loan.status)}
              </Badge>
            </div>
          </div>

          {/* Return date picker */}
          <div className="space-y-2">
            <Label
              htmlFor="returnDate"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              Return Date
            </Label>
            <Input
              id="returnDate"
              type="date"
              value={returnDate}
              max={today}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Defaults to today. You can backdate if the book was received
              earlier.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !returnDate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <BookCheck className="h-4 w-4 mr-2" />
                Confirm Return
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
