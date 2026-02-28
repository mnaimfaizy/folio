import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import AdminService, { AdminLoan } from '@/services/adminService';
import {
  BookCheck,
  Loader2,
  PlusCircle,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import { CreateLoanDialog } from './CreateLoanDialog';
import { MarkReturnedDialog } from './MarkReturnedDialog';

function formatLoanStatus(status: AdminLoan['status']) {
  if (status === 'PENDING') return 'Pending Approval';
  if (status === 'ACTIVE') return 'Active';
  if (status === 'OVERDUE') return 'Overdue';
  if (status === 'RETURNED') return 'Returned';
  if (status === 'REJECTED') return 'Rejected';
  return 'Lost';
}

function statusClassName(status: AdminLoan['status']) {
  if (status === 'PENDING') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0';
  }
  if (status === 'ACTIVE') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0';
  }
  if (status === 'OVERDUE') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0';
  }
  if (status === 'RETURNED') {
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0';
  }
  if (status === 'REJECTED') {
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-0';
  }
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0';
}

export function LoansPage() {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [createLoanOpen, setCreateLoanOpen] = useState(false);
  const [deleteLoanTarget, setDeleteLoanTarget] = useState<AdminLoan | null>(
    null,
  );
  const [markReturnedTarget, setMarkReturnedTarget] =
    useState<AdminLoan | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'LOST' | 'REJECTED'
  >('ALL');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllLoans(
        statusFilter === 'ALL' ? undefined : statusFilter,
      );
      setLoans(data);
    } catch (error) {
      console.error('Failed to load admin loans', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const handleMarkLost = async (loan: AdminLoan) => {
    const penaltyInput = window.prompt(
      'Penalty amount (optional, e.g. 15.50)',
      '',
    );
    const penaltyAmount =
      penaltyInput && penaltyInput.trim() ? Number(penaltyInput) : undefined;

    if (penaltyInput && penaltyInput.trim() && Number.isNaN(penaltyAmount)) {
      toast.error('Penalty must be a valid number');
      return;
    }

    const note = window.prompt('Admin note (optional)', '') || undefined;

    try {
      setProcessingId(loan.id);
      await AdminService.markLoanAsLost(loan.id, {
        penaltyAmount,
        note,
      });
      toast.success('Loan marked as lost');
      await fetchLoans();
    } catch (error) {
      console.error('Failed to mark loan as lost', error);
      toast.error('Unable to mark loan as lost');
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessReminders = async () => {
    try {
      setProcessingId(-1);
      const result = await AdminService.processLoanReminders();
      toast.success(
        `Loan reminders processed: ${result.sentCount} sent across ${result.checkedCount} checked loans`,
      );
    } catch (error) {
      console.error('Failed to process reminders', error);
      toast.error('Failed to process reminders');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (loanId: number) => {
    try {
      setProcessingId(loanId);
      await AdminService.approveLoanRequest(loanId);
      toast.success('Loan request approved');
      await fetchLoans();
    } catch (error) {
      console.error('Failed to approve loan request', error);
      toast.error('Unable to approve loan request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (loanId: number) => {
    const reason =
      window.prompt('Reason for rejection (optional)', '') || undefined;

    try {
      setProcessingId(loanId);
      await AdminService.rejectLoanRequest(loanId, { reason });
      toast.success('Loan request rejected');
      await fetchLoans();
    } catch (error) {
      console.error('Failed to reject loan request', error);
      toast.error('Unable to reject loan request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteLoan = async (loan: AdminLoan) => {
    try {
      setProcessingId(loan.id);
      await AdminService.deleteLoan(loan.id);
      toast.success('Loan deleted successfully');
      await fetchLoans();
    } catch (error) {
      console.error('Failed to delete loan', error);
      toast.error('Unable to delete loan');
    } finally {
      setProcessingId(null);
      setDeleteLoanTarget(null);
    }
  };

  const columns: DataTableColumn<AdminLoan>[] = [
    {
      id: 'user_name',
      header: 'Borrower',
      accessorKey: 'user_name',
      searchable: true,
      sortable: true,
      cell: (loan) => (
        <div>
          <div className="font-medium">
            {loan.user_name || `User #${loan.user_id}`}
          </div>
          <div className="text-xs text-muted-foreground">
            {loan.user_email || '—'}
          </div>
        </div>
      ),
    },
    {
      id: 'book_title',
      header: 'Book',
      accessorKey: 'book_title',
      searchable: true,
      sortable: true,
      cell: (loan) => (
        <div>
          <div className="font-medium">
            {loan.book_title || `Book #${loan.book_id}`}
          </div>
          <div className="text-xs text-muted-foreground">
            {loan.book_author || '—'}
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (loan) => (
        <Badge className={statusClassName(loan.status)}>
          {formatLoanStatus(loan.status)}
        </Badge>
      ),
    },
    {
      id: 'borrowed_at',
      header: 'Borrowed',
      accessorKey: 'borrowed_at',
      sortable: true,
      cell: (loan) => new Date(loan.borrowed_at).toLocaleDateString(),
    },
    {
      id: 'due_date',
      header: 'Due',
      accessorKey: 'due_date',
      sortable: true,
      cell: (loan) =>
        loan.status === 'PENDING' || loan.status === 'REJECTED'
          ? '—'
          : new Date(loan.due_date).toLocaleDateString(),
    },
    {
      id: 'returned_at',
      header: 'Returned',
      accessorKey: 'returned_at',
      sortable: true,
      cell: (loan) =>
        loan.returned_at
          ? new Date(loan.returned_at).toLocaleDateString()
          : '—',
    },
    {
      id: 'actions',
      header: 'Actions',
      searchable: false,
      sortable: false,
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (loan) => (
        <div className="flex justify-end gap-1.5 flex-wrap">
          {loan.status === 'PENDING' ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(loan.id)}
                disabled={processingId === loan.id}
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(loan.id)}
                disabled={processingId === loan.id}
              >
                {processingId === loan.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Approve'
                )}
              </Button>
            </>
          ) : loan.status === 'ACTIVE' || loan.status === 'OVERDUE' ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950"
                onClick={() => setMarkReturnedTarget(loan)}
                disabled={processingId === loan.id}
              >
                <BookCheck className="h-3.5 w-3.5 mr-1" />
                Mark Returned
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkLost(loan)}
                disabled={processingId === loan.id}
              >
                {processingId === loan.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Mark Lost'
                )}
              </Button>
            </>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteLoanTarget(loan)}
            disabled={processingId === loan.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Operations</CardTitle>
            <CardDescription>
              Filter loans, mark active/overdue items as returned or lost, and
              manually trigger reminder processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <CreateLoanDialog
              open={createLoanOpen}
              onOpenChange={setCreateLoanOpen}
              onSuccess={fetchLoans}
            />
            <div className="w-full sm:w-56">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as typeof statusFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={fetchLoans} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              Refresh Loans
            </Button>
            <Button
              onClick={handleProcessReminders}
              disabled={processingId === -1}
            >
              {processingId === -1 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing
                </>
              ) : (
                'Process Reminders Now'
              )}
            </Button>
            <Button onClick={() => setCreateLoanOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create new loan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Loans</CardTitle>
            <CardDescription>
              Comprehensive loan tracking across all users. Use the search box
              to filter by borrower name, email, or book title.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={loans}
              columns={columns}
              loading={loading}
              searchPlaceholder="Search by borrower or book…"
              emptyMessage="No loans found for the selected filter."
              pageSize={15}
              pageSizeOptions={[10, 15, 25, 50]}
              getRowId={(loan) => loan.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mark as Returned dialog */}
      <MarkReturnedDialog
        loan={markReturnedTarget}
        open={!!markReturnedTarget}
        onOpenChange={(open) => !open && setMarkReturnedTarget(null)}
        onSuccess={fetchLoans}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteLoanTarget}
        onOpenChange={(open) => !open && setDeleteLoanTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this loan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the loan for{' '}
              <strong>
                {deleteLoanTarget?.book_title ??
                  `Book #${deleteLoanTarget?.book_id}`}
              </strong>{' '}
              assigned to{' '}
              <strong>
                {deleteLoanTarget?.user_name ??
                  `User #${deleteLoanTarget?.user_id}`}
              </strong>
              .
              {(deleteLoanTarget?.status === 'ACTIVE' ||
                deleteLoanTarget?.status === 'OVERDUE') && (
                <> The book's available copies will be restored.</>
              )}{' '}
              The user will be notified by email. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                deleteLoanTarget && handleDeleteLoan(deleteLoanTarget)
              }
            >
              Delete Loan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
