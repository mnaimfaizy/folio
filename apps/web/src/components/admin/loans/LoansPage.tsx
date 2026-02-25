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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminService, { AdminLoan } from '@/services/adminService';
import { Loader2, RefreshCcw } from 'lucide-react';

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

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Operations</CardTitle>
          <CardDescription>
            Filter loans, mark active/overdue items as lost, and manually
            trigger reminder processing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
          <CardDescription>
            Comprehensive loan tracking across all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading loans...
            </div>
          ) : loans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No loans found for the selected filter.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="font-medium">
                        {loan.user_name || `User #${loan.user_id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {loan.user_email || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {loan.book_title || `Book #${loan.book_id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {loan.book_author || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClassName(loan.status)}>
                        {formatLoanStatus(loan.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(loan.borrowed_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {loan.status === 'PENDING' || loan.status === 'REJECTED'
                        ? '-'
                        : new Date(loan.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {loan.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
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
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Approving
                              </>
                            ) : (
                              'Approve'
                            )}
                          </Button>
                        </div>
                      ) : loan.status === 'ACTIVE' ||
                        loan.status === 'OVERDUE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkLost(loan)}
                          disabled={processingId === loan.id}
                        >
                          {processingId === loan.id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Updating
                            </>
                          ) : (
                            'Mark Lost'
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
