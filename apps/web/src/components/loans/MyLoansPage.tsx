import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import BookService, { LoanRecord } from '@/services/bookService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';

function formatLoanStatus(status: LoanRecord['status']) {
  if (status === 'PENDING') return 'Pending Approval';
  if (status === 'ACTIVE') return 'Active';
  if (status === 'OVERDUE') return 'Overdue';
  if (status === 'RETURNED') return 'Returned';
  if (status === 'REJECTED') return 'Rejected';
  return 'Lost';
}

function statusClassName(status: LoanRecord['status']) {
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

export function MyLoansPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingLoanId, setProcessingLoanId] = useState<number | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await BookService.getMyLoans();
      setLoans(data);
    } catch (error) {
      console.error('Failed to load loans', error);
      toast.error('Failed to load your loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (loanId: number) => {
    try {
      setProcessingLoanId(loanId);
      const success = await BookService.returnLoan(loanId);
      if (!success) {
        toast.error('Unable to return this loan');
        return;
      }

      toast.success('Book returned successfully');
      await fetchLoans();
    } finally {
      setProcessingLoanId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/my-books">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Books
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">My Loans</h1>
        </div>

        <Button variant="outline" onClick={fetchLoans} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrowed Books</CardTitle>
          <CardDescription>
            View pending requests, active loans, and completion outcomes. Return
            active or overdue books directly.
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
              You have no loan records yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
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
                      {loan.status === 'ACTIVE' || loan.status === 'OVERDUE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReturn(loan.id)}
                          disabled={processingLoanId === loan.id}
                        >
                          {processingLoanId === loan.id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Returning
                            </>
                          ) : (
                            'Return Book'
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
