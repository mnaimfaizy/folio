import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import BookService, { BookRequestRecord } from '@/services/bookService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface RequestFormState {
  title: string;
  author: string;
  isbn: string;
  note: string;
}

const initialForm: RequestFormState = {
  title: '',
  author: '',
  isbn: '',
  note: '',
};

function formatStatus(status: BookRequestRecord['status']) {
  if (status === 'OPEN') return 'Open';
  if (status === 'FULFILLED_AUTO') return 'Available (Auto)';
  return 'Available (Manual)';
}

export function RequestBookPage() {
  const [form, setForm] = useState<RequestFormState>(initialForm);
  const [requests, setRequests] = useState<BookRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await BookService.getMyBookRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load my book requests', error);
      toast.error('Failed to load your book requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const hasIsbn = form.isbn.trim().length > 0;
    const hasTitleAndAuthor =
      form.title.trim().length > 0 && form.author.trim().length > 0;

    if (!hasIsbn && !hasTitleAndAuthor) {
      toast.error('Provide ISBN, or both title and author');
      return;
    }

    try {
      setSubmitting(true);
      const created = await BookService.createBookRequest({
        title: form.title.trim() || undefined,
        author: form.author.trim() || undefined,
        isbn: form.isbn.trim() || undefined,
        note: form.note.trim() || undefined,
      });

      if (!created) {
        toast.error('Unable to submit book request');
        return;
      }

      toast.success('Book request submitted');
      setForm(initialForm);
      await fetchRequests();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request a Book</CardTitle>
          <CardDescription>
            Provide either an ISBN, or both title and author so we can group
            matching requests accurately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="request_title">Book Title</Label>
                <Input
                  id="request_title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="The Pragmatic Programmer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request_author">Author</Label>
                <Input
                  id="request_author"
                  value={form.author}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, author: event.target.value }))
                  }
                  placeholder="Andrew Hunt"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_isbn">ISBN (recommended if known)</Label>
              <Input
                id="request_isbn"
                value={form.isbn}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isbn: event.target.value }))
                }
                placeholder="9780135957059"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_note">Additional Note</Label>
              <Textarea
                id="request_note"
                value={form.note}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="Any edition preferences, language, etc."
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Requested Books</CardTitle>
          <CardDescription>
            Track whether your request is still open or already available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">
                        {request.requested_title ||
                          request.matched_book_title ||
                          'Untitled Request'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.requested_author || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{request.requested_isbn || '-'}</TableCell>
                    <TableCell>{formatStatus(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
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
