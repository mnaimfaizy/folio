import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthorSearchComponent } from './AuthorSearchComponent';
import AdminService, {
  Author,
  UpdateAuthorRequest,
} from '@/services/adminService';
import { ExternalAuthorResult } from '@/services/authorService';
import { parseApiError } from '@/lib/errorUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authorSchema, type AuthorFormValues } from './authorSchema';

export function EditAuthor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);

  // Enrichment dialog state
  const [enrichDialogOpen, setEnrichDialogOpen] = useState(false);
  const [selectedExternalAuthor, setSelectedExternalAuthor] =
    useState<Partial<ExternalAuthorResult> | null>(null);
  const [fieldsToMerge, setFieldsToMerge] = useState({
    biography: false,
    birth_date: false,
    photo_url: false,
  });

  // Initialize the form with empty values initially
  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
      biography: '',
      birth_date: '',
      photo_url: '',
    },
  });

  // Fetch author data when component mounts
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await AdminService.getAuthorById(Number(id));
        setAuthor(data.author);

        // Set form values - use birth_date as-is to support historical dates
        form.reset({
          name: data.author.name,
          biography: data.author.biography || '',
          birth_date: data.author.birth_date || '',
          photo_url: data.author.photo_url || '',
        });

        setIsLoading(false);
      } catch (err: Error | unknown) {
        console.error('Error fetching author:', err);
        setError(parseApiError(err, 'Failed to load author data'));
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [id, form]);

  // Handle external author selection
  const handleSelectExternalAuthor = (
    externalAuthor: Partial<ExternalAuthorResult>,
  ) => {
    setSelectedExternalAuthor(externalAuthor);
    // Pre-select fields that have data and current form doesn't have (or is empty)
    setFieldsToMerge({
      biography: !!(externalAuthor.biography && !form.getValues('biography')),
      birth_date: !!(externalAuthor.birthDate && !form.getValues('birth_date')),
      photo_url: !!(externalAuthor.photoUrl && !form.getValues('photo_url')),
    });
  };

  // Apply selected fields to form
  const handleApplyEnrichment = () => {
    if (!selectedExternalAuthor) return;

    const updates: Partial<AuthorFormValues> = {};

    if (fieldsToMerge.biography && selectedExternalAuthor.biography) {
      updates.biography = selectedExternalAuthor.biography;
    }
    if (fieldsToMerge.birth_date && selectedExternalAuthor.birthDate) {
      updates.birth_date = selectedExternalAuthor.birthDate;
    }
    if (fieldsToMerge.photo_url && selectedExternalAuthor.photoUrl) {
      updates.photo_url = selectedExternalAuthor.photoUrl;
    }

    // Update form values
    Object.entries(updates).forEach(([key, value]) => {
      form.setValue(key as keyof AuthorFormValues, value);
    });

    // Close dialog and reset state
    setEnrichDialogOpen(false);
    setSelectedExternalAuthor(null);
    setFieldsToMerge({ biography: false, birth_date: false, photo_url: false });

    toast.success('Author data enriched from external source!');
  };

  const onSubmit = async (data: AuthorFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Format the data to match the API expectations
      const authorData: UpdateAuthorRequest = {
        name: data.name,
        biography: data.biography || undefined,
        birth_date: data.birth_date || undefined,
        photo_url: data.photo_url || undefined,
      };

      // Send data to API
      await AdminService.updateAuthor(Number(id), authorData);

      setIsSubmitting(false);
      toast.success('Author updated successfully!');

      // Navigate back to the author view
      navigate(`/admin/authors/view/${id}`);
    } catch (err: Error | unknown) {
      setIsSubmitting(false);
      const errorMessage = parseApiError(err, 'Failed to update author');
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading author data...</span>
      </div>
    );
  }

  if (error && !author) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Author</CardTitle>
              <CardDescription>Update author information</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEnrichDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Enrich from External Sources
            </Button>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200 mb-4">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., 1564, 6th cent. B.C., c. 1850"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/photo.jpg"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="biography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Author biography..."
                        className="h-32"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/authors/view/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Enrichment Dialog */}
      <Dialog open={enrichDialogOpen} onOpenChange={setEnrichDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Enrich Author Data from External Sources
            </DialogTitle>
            <DialogDescription>
              Search for this author in external databases and select which
              fields to update
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedExternalAuthor ? (
              <AuthorSearchComponent
                onSelectAuthor={handleSelectExternalAuthor}
                initialQuery={author?.name || ''}
              />
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Selected:</strong> {selectedExternalAuthor.name}{' '}
                    from {selectedExternalAuthor.source}
                  </AlertDescription>
                </Alert>

                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm">
                    Select fields to merge:
                  </h3>

                  {selectedExternalAuthor.biography && (
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="merge-biography"
                        checked={fieldsToMerge.biography}
                        onCheckedChange={(checked) =>
                          setFieldsToMerge({
                            ...fieldsToMerge,
                            biography: checked as boolean,
                          })
                        }
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="merge-biography"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Biography
                        </label>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                          {selectedExternalAuthor.biography}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedExternalAuthor.birthDate && (
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="merge-birthdate"
                        checked={fieldsToMerge.birth_date}
                        onCheckedChange={(checked) =>
                          setFieldsToMerge({
                            ...fieldsToMerge,
                            birth_date: checked as boolean,
                          })
                        }
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="merge-birthdate"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Birth Date
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedExternalAuthor.birthDate}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedExternalAuthor.photoUrl && (
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="merge-photo"
                        checked={fieldsToMerge.photo_url}
                        onCheckedChange={(checked) =>
                          setFieldsToMerge({
                            ...fieldsToMerge,
                            photo_url: checked as boolean,
                          })
                        }
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="merge-photo"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Photo URL
                        </label>
                        <p className="text-sm text-muted-foreground mt-1 break-all">
                          {selectedExternalAuthor.photoUrl}
                        </p>
                        {selectedExternalAuthor.photoUrl && (
                          <img
                            src={selectedExternalAuthor.photoUrl}
                            alt={selectedExternalAuthor.name}
                            className="mt-2 h-24 w-24 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {selectedExternalAuthor.alternateNames &&
                    selectedExternalAuthor.alternateNames.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">
                          Alternate Names (for reference):
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedExternalAuthor.alternateNames
                            .slice(0, 10)
                            .join(', ')}
                          {selectedExternalAuthor.alternateNames.length > 10 &&
                            ` (+${selectedExternalAuthor.alternateNames.length - 10} more)`}
                        </p>
                      </div>
                    )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedExternalAuthor(null);
                      setFieldsToMerge({
                        biography: false,
                        birth_date: false,
                        photo_url: false,
                      });
                    }}
                  >
                    Back to Search
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApplyEnrichment}
                    disabled={
                      !fieldsToMerge.biography &&
                      !fieldsToMerge.birth_date &&
                      !fieldsToMerge.photo_url
                    }
                  >
                    Apply Selected Fields
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
