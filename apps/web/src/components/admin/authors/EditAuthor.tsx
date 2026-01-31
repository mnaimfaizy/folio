import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminService, {
  Author,
  UpdateAuthorRequest,
} from "@/services/adminService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

// Define validation schema using zod
const authorSchema = z.object({
  name: z.string().min(1, "Author name is required"),
  biography: z.string().optional(),
  birth_date: z.string().optional(),
  photo_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

// Define form values type from the schema
type AuthorFormValues = z.infer<typeof authorSchema>;

export function EditAuthor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);

  // Initialize the form with empty values initially
  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: "",
      biography: "",
      birth_date: "",
      photo_url: "",
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

        // Format the date for the input field (YYYY-MM-DD)
        const formattedDate = data.author.birth_date
          ? new Date(data.author.birth_date).toISOString().split("T")[0]
          : "";

        // Set form values
        form.reset({
          name: data.author.name,
          biography: data.author.biography || "",
          birth_date: formattedDate,
          photo_url: data.author.photo_url || "",
        });

        setIsLoading(false);
      } catch (err: Error | unknown) {
        console.error("Error fetching author:", err);
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to load author data"
        );
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [id, form]);

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
      toast.success("Author updated successfully!");

      // Navigate back to the author view
      navigate(`/admin/authors/view/${id}`);
    } catch (err: Error | unknown) {
      setIsSubmitting(false);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update author";
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
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Author</CardTitle>
          <CardDescription>Update author information</CardDescription>
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
                      <Input type="date" {...field} />
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
                        value={field.value || ""}
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
                        value={field.value || ""}
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
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
