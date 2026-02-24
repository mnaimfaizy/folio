import { useEffect, useState } from 'react';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

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

  const chartData = analytics
    .slice(0, 8)
    .map((item: BookRequestAnalyticsItem) => ({
      label: item.label,
      requests: item.total_requests,
    }))
    .reverse(); // highest bar at the top in vertical layout

  const CHART_COLORS = [
    'hsl(221, 83%, 53%)',
    'hsl(221, 83%, 47%)',
    'hsl(221, 83%, 41%)',
    'hsl(221, 83%, 35%)',
    'hsl(221, 83%, 29%)',
    'hsl(221, 83%, 23%)',
    'hsl(221, 83%, 17%)',
    'hsl(221, 83%, 11%)',
  ];

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
        <CardContent>
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
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Horizontal bar chart */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Demand by Title
                </p>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(chartData.length * 52, 200)}
                >
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      label={{
                        value: 'Requests',
                        position: 'insideBottom',
                        offset: -2,
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={180}
                      tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: string) =>
                        value.length > 26 ? value.slice(0, 24) + '…' : value
                      }
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                      formatter={(value: number | undefined) => [
                        value ?? 0,
                        'Requests',
                      ]}
                    />
                    <Bar
                      dataKey="requests"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={36}
                    >
                      {chartData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                      <LabelList
                        dataKey="requests"
                        position="right"
                        style={{
                          fontSize: 12,
                          fill: 'hsl(var(--muted-foreground))',
                          fontWeight: 600,
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut chart */}
              <div className="w-full lg:w-72 shrink-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Share of Requests
                </p>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(chartData.length * 52, 200)}
                >
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="requests"
                      nameKey="label"
                      cx="50%"
                      cy="45%"
                      innerRadius="48%"
                      outerRadius="70%"
                      paddingAngle={3}
                    >
                      {chartData.map((_entry, index) => (
                        <Cell
                          key={`pie-cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke="hsl(var(--card))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                      formatter={(
                        value: number | undefined,
                        name: string | undefined,
                      ) => [value ?? 0, name ?? '']}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      formatter={(value: string) =>
                        value.length > 22 ? value.slice(0, 20) + '…' : value
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
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
