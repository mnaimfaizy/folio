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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AdminService, { UserDetail } from '@/services/adminService';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  adminSetPasswordSchema,
  type AdminSetPasswordFormValues,
} from '@/components/auth/authSchemas';

export function ChangeUserPassword() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<UserDetail | null>(null);

  const form = useForm<AdminSetPasswordFormValues>({
    resolver: zodResolver(adminSetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;

        const userData = await AdminService.getUserById(Number(id));
        setUser(userData);
        setFetchingUser(false);
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(apiErr?.response?.data?.message || 'Failed to load user data');
        setFetchingUser(false);
      }
    };

    fetchUser();
  }, [id]);

  const onSubmit = async (data: AdminSetPasswordFormValues) => {
    try {
      if (!id) return;

      setLoading(true);
      setError(null);

      await AdminService.changeUserPassword(Number(id), data.newPassword);

      setSuccess(true);
      setLoading(false);
      form.reset();

      // Redirect back to users list after successful update
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err: unknown) {
      setLoading(false);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr?.response?.data?.message ||
          'Failed to change password. Please try again.',
      );
    }
  };

  if (fetchingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading user data...</span>
      </div>
    );
  }

  if (!user && !fetchingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-xl">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Change Password for {user?.name}</CardTitle>
          <CardDescription>Set a new password for this user</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-green-50 mb-4 border-green-300">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Password changed successfully!
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert className="bg-red-50 mb-4 border-red-300">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        aria-invalid={
                          form.formState.errors.newPassword ? 'true' : 'false'
                        }
                      />
                    </FormControl>
                    {form.formState.errors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.newPassword.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        aria-invalid={
                          form.formState.errors.confirmPassword
                            ? 'true'
                            : 'false'
                        }
                      />
                    </FormControl>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                  role="button"
                  name="cancel"
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
