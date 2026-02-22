import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AdminService, {
  AdminBookRequest,
  BookRequestAnalyticsItem,
} from '@/services/adminService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

function formatStatus(status: AdminBookRequest['status']) {
  if (status === 'OPEN') return 'Open';
  if (status === 'FULFILLED_AUTO') return 'Available (Auto)';
  return 'Available (Manual)';
}

export function BookRequestsPage() {
  const [requests, setRequests] = useState<AdminBookRequest[]>([]);
  const [analytics, setAnalytics] = useState<BookRequestAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestRows, analyticsRows] = await Promise.all([
        AdminService.getBookRequests(),
        AdminService.getBookRequestAnalytics(),
      ]);
      setRequests(requestRows);
      setAnalytics(analyticsRows);
    } catch (error) {
      console.error('Failed to fetch admin requests data', error);
      toast.error('Failed to load requested books data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topCount = useMemo(
    () =>
      analytics.reduce((max, item) => Math.max(max, item.total_requests), 0),
    [analytics],
  );

  const handleManualFulfill = async (request: AdminBookRequest) => {
    try {
      setBusyRequestId(request.id);
      await AdminService.markBookRequestFulfilled(request.id, {
        bookId: request.matched_book_id || undefined,
        note: 'Marked manually by admin',
      });
      toast.success('Request marked as fulfilled');
      await fetchData();
    } catch (error) {
      console.error('Failed to manually fulfill request', error);
      toast.error('Failed to update request');
    } finally {
      setBusyRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Requested Books Analytics</CardTitle>
          <CardDescription>
            Aggregated demand by normalized title/author or ISBN for better
            acquisition decisions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading analytics...
            </div>
          ) : analytics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No request analytics yet.
            </p>
          ) : (
            analytics.slice(0, 8).map((item) => {
              const widthPct =
                topCount > 0 ? (item.total_requests / topCount) * 100 : 0;
              return (
                <div key={item.request_key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate pr-3">
                      {item.label}
                    </span>
                    <span className="text-muted-foreground">
                      {item.total_requests}
                    </span>
                  </div>
                  <div className="h-2 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.max(widthPct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requested Books</CardTitle>
          <CardDescription>
            See requested books by users and manually mark requests as fulfilled
            when needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">
                        {request.requested_title ||
                          request.requested_isbn ||
                          'Untitled Request'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.requested_author ||
                          request.requested_isbn ||
                          '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{request.requested_by_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.requested_by_email}
                      </div>
                    </TableCell>
                    <TableCell>{formatStatus(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === 'OPEN' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManualFulfill(request)}
                          disabled={busyRequestId === request.id}
                        >
                          {busyRequestId === request.id ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Updating
                            </>
                          ) : (
                            'Mark Fulfilled'
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Completed
                        </span>
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
