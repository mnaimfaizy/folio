import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AdminService, { CreateAuthorRequest } from '@/services/adminService';
import authorService, { ExternalAuthorResult } from '@/services/authorService';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, FileEdit, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';
import { AuthorSearchComponent } from './AuthorSearchComponent';

// Define validation schema using zod
const authorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  biography: z.string().optional(),
  birth_date: z.string().optional(),
  photo_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

// Define form values type from the schema
type AuthorFormValues = z.infer<typeof authorSchema>;

// Helper function to detect if a string is primarily Latin/English characters
const isEnglishName = (name: string): boolean => {
  // Check if more than 50% of characters are Latin alphabet
  const latinChars = name.match(/[a-zA-Z]/g)?.length || 0;
  const totalChars = name.replace(/\s/g, '').length;
  return totalChars > 0 && latinChars / totalChars > 0.5;
};

export function CreateAuthor() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [alternateNames, setAlternateNames] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<
    Array<{ id: number; name: string; similarity: number }>
  >([]);
  const [forceCreate, setForceCreate] = useState(false);

  const normalizeDuplicates = (similarAuthors: unknown) => {
    const list = Array.isArray(similarAuthors) ? similarAuthors : [];
    return list
      .filter(
        (item): item is { id: number; name: string; similarity: number } =>
          typeof (item as any)?.id === 'number' &&
          typeof (item as any)?.name === 'string' &&
          typeof (item as any)?.similarity === 'number',
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
        similarity: item.similarity,
      }));
  };

  // Initialize the form with default values
  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
      biography: '',
      birth_date: '',
      photo_url: '',
    },
  });

  // Handle selecting an author from external search
  const handleSelectExternalAuthor = (
    author: Partial<ExternalAuthorResult>,
  ) => {
    let primaryName = author.name || '';
    let allAlternateNames: string[] = [];

    // If primary name is not English and we have alternate names, find an English one
    if (
      !isEnglishName(primaryName) &&
      author.alternateNames &&
      author.alternateNames.length > 0
    ) {
      const englishName = author.alternateNames.find((name) =>
        isEnglishName(name),
      );

      if (englishName) {
        // Use English name as primary, move original to alternates
        allAlternateNames = [
          primaryName,
          ...author.alternateNames.filter((n) => n !== englishName),
        ];
        primaryName = englishName;
      } else {
        // No English name found, keep original arrangement
        allAlternateNames = author.alternateNames;
      }
    } else if (author.alternateNames && author.alternateNames.length > 0) {
      allAlternateNames = author.alternateNames;
    }

    // Populate form with external data
    form.setValue('name', primaryName);
    form.setValue('biography', author.biography || '');
    form.setValue('birth_date', author.birthDate || '');
    form.setValue('photo_url', author.photoUrl || '');

    // Store alternate names
    setAlternateNames(allAlternateNames);

    if (allAlternateNames.length > 0) {
      toast.success(
        `Author data populated with ${allAlternateNames.length} alternate name(s)! Review and submit to add.`,
      );
    } else {
      toast.success('Author data populated! Review and submit to add.');
    }

    // Switch to manual tab for review
    setActiveTab('manual');
  };

  // Check for duplicates when name changes
  const handleNameBlur = async () => {
    const name = form.getValues('name');
    if (name && name.trim().length > 2) {
      try {
        const response = await authorService.checkDuplicateAuthors(name);
        if (response.isDuplicate) {
          setDuplicates(normalizeDuplicates(response.similarAuthors));
          if (response.exactMatch) {
            toast.warning('An author with this exact name already exists!');
          } else if (
            response.similarAuthors &&
            response.similarAuthors.length > 0
          ) {
            toast.info(
              `Found ${response.similarAuthors.length} similar author(s). Check for duplicates before submitting.`,
            );
          }
        } else {
          setDuplicates([]);
        }
      } catch (err) {
        console.error('Error checking duplicates:', err);
      }
    }
  };

  const onSubmit = async (data: AuthorFormValues, forceCreation = false) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Format the data to match the API expectations
      const authorData: CreateAuthorRequest = {
        name: data.name,
        biography: data.biography || undefined,
        birth_date: data.birth_date || undefined,
        photo_url: data.photo_url || undefined,
        alternate_names: alternateNames.length > 0 ? alternateNames : undefined,
        force: forceCreation || forceCreate,
      };

      // Send data to API
      const result = await AdminService.createAuthor(authorData);

      setIsSubmitting(false);
      setSuccess(true);
      toast.success('Author created successfully!');

      // Reset form
      form.reset();
      setDuplicates([]);
      setAlternateNames([]);
      setForceCreate(false);

      // Navigate to the author view page
      setTimeout(() => {
        navigate(`/admin/authors/view/${result.id}`);
      }, 1500);
    } catch (err: Error | unknown) {
      setIsSubmitting(false);

      // Check if this is a 409 conflict (similar authors found)
      const response = (
        err as {
          response?: {
            status?: number;
            data?: { message?: string; similarAuthors?: any[] };
          };
        }
      )?.response;

      if (response?.status === 409 && response?.data?.similarAuthors) {
        // Similar authors found - show them and allow force create
        const similarAuthors = response.data.similarAuthors;
        setDuplicates(normalizeDuplicates(similarAuthors));
        setError(
          'Similar author(s) found in the database. Please review them below. If you still want to create this author, click "Create Anyway" below.',
        );
        toast.warning(
          'Similar authors found. Review duplicates before proceeding.',
        );
      } else {
        const errorMessage =
          response?.data?.message || 'Failed to create author';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Author</CardTitle>
          <CardDescription>
            Add a new author to the library system manually or from external
            sources
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Author created successfully! Redirecting to author details...
              </AlertDescription>
            </Alert>
          </CardContent>
        ) : (
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger
                  value="external"
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  External Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="mt-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => onSubmit(data))}
                    className="space-y-4"
                  >
                    {error && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertDescription className="text-red-800">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {duplicates.length > 0 && (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertDescription className="text-yellow-800">
                          <p className="font-semibold mb-2">
                            Possible duplicates found:
                          </p>
                          <ul className="list-disc list-inside">
                            {duplicates.map((dup) => (
                              <li key={dup.id}>
                                {dup.name} ({Math.round(dup.similarity * 100)}%
                                similar) -{' '}
                                <Button
                                  type="button"
                                  variant="link"
                                  className="p-0 h-auto text-yellow-900 underline"
                                  onClick={() =>
                                    navigate(`/admin/authors/view/${dup.id}`)
                                  }
                                >
                                  View
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {alternateNames.length > 0 && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-800">
                          <p className="font-semibold mb-1">
                            Alternate names ({alternateNames.length}):
                          </p>
                          <p className="text-sm">
                            {alternateNames.slice(0, 10).join(', ')}
                            {alternateNames.length > 10 &&
                              ` (+${alternateNames.length - 10} more)`}
                          </p>
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
                            <Input
                              placeholder="Author name"
                              {...field}
                              onBlur={() => {
                                field.onBlur();
                                handleNameBlur();
                              }}
                            />
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

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/authors')}
                      >
                        Cancel
                      </Button>
                      <div className="flex gap-2">
                        {duplicates.length > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={async () => {
                              const data = form.getValues();
                              await onSubmit(data, true);
                            }}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Anyway...
                              </>
                            ) : (
                              'Create Anyway'
                            )}
                          </Button>
                        )}
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Author'
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="external" className="mt-6">
                <AuthorSearchComponent
                  onSelectAuthor={handleSelectExternalAuthor}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
