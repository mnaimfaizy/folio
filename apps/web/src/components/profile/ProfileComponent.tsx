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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import AuthService from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lock,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { AuthGuard } from '../auth/guards/AuthGuard';

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
});

// Password change schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Account deletion schema
const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required to confirm account deletion'),
  confirmation: z
    .literal('DELETE MY ACCOUNT')
    .refine((val) => val === 'DELETE MY ACCOUNT', {
      message: 'Please type DELETE MY ACCOUNT to confirm',
    }),
});

// Infer TypeScript types from schemas
type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export function ProfileComponent() {
  const { user, updateUser, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Clear error when component unmounts or tab changes
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  // Reset form values when user changes
  useEffect(() => {
    if (user) {
      profileForm.setValue('name', user.name);
    }
  }, [user, profileForm]);

  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Delete account form
  const deleteForm = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
      confirmation: undefined,
    },
  });

  // Handle profile update
  const handleProfileUpdate = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.updateProfile(data.name);
      updateUser(response.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (data: PasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.changePassword(data.currentPassword, data.newPassword);
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to change password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (data: DeleteAccountFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.deleteAccount(data.password);
      await logout();
      navigate('/');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to delete account';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <UserCog className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Your Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger
              value="profile"
              className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">Danger Zone</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                <CardContent className="space-y-4 pt-6">
                  {profileSuccess && (
                    <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                        Your profile has been updated successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && activeTab === 'profile' && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-600 dark:text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid w-full items-center gap-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Credit Balance
                          </p>
                          <p className="text-2xl font-semibold mt-1">
                            {settings.credit_currency}{' '}
                            {Number(user?.credit_balance ?? 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {settings.online_payment_enabled ? (
                        <Alert className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <AlertDescription className="text-blue-700 dark:text-blue-300">
                            Online top-up is available. Use enabled methods:{' '}
                            {[
                              settings.stripe_enabled ? 'Stripe' : null,
                              settings.paypal_enabled ? 'PayPal' : null,
                            ]
                              .filter(Boolean)
                              .join(' and ') || 'configured provider'}
                            .
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="mt-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                          <AlertDescription className="text-amber-700 dark:text-amber-300">
                            Online top-up is currently unavailable. To borrow
                            books, contact the library/admin desk for manual
                            credit top-up, then refresh this page to see your
                            updated balance.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...profileForm.register('name')}
                        aria-invalid={
                          profileForm.formState.errors.name ? 'true' : 'false'
                        }
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">
                        Email address cannot be changed as it's used for login.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                  >
                    {isLoading && activeTab === 'profile' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
                <CardContent className="space-y-4 pt-6">
                  {passwordSuccess && (
                    <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                        Your password has been changed successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && activeTab === 'security' && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-600 dark:text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register('currentPassword')}
                        aria-invalid={
                          passwordForm.formState.errors.currentPassword
                            ? 'true'
                            : 'false'
                        }
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register('newPassword')}
                        aria-invalid={
                          passwordForm.formState.errors.newPassword
                            ? 'true'
                            : 'false'
                        }
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register('confirmPassword')}
                        aria-invalid={
                          passwordForm.formState.errors.confirmPassword
                            ? 'true'
                            : 'false'
                        }
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                  >
                    {isLoading && activeTab === 'security' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden border-l-4 border-l-red-500">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-b border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-red-700 dark:text-red-400">
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400/80">
                      Actions here can't be undone. Please proceed with caution.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}>
                <CardContent className="space-y-4 pt-6">
                  <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-600 dark:text-red-400">
                      Deleting your account will permanently remove all your
                      data and cannot be undone.
                    </AlertDescription>
                  </Alert>

                  {error && activeTab === 'danger' && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-600 dark:text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="delete-password">Your Password</Label>
                      <Input
                        id="delete-password"
                        type="password"
                        {...deleteForm.register('password')}
                        aria-invalid={
                          deleteForm.formState.errors.password
                            ? 'true'
                            : 'false'
                        }
                      />
                      {deleteForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {deleteForm.formState.errors.password.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Please enter your password to confirm.
                      </p>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="confirmation">
                        Type "DELETE MY ACCOUNT" to confirm
                      </Label>
                      <Input
                        id="confirmation"
                        placeholder="DELETE MY ACCOUNT"
                        {...deleteForm.register('confirmation')}
                        aria-invalid={
                          deleteForm.formState.errors.confirmation
                            ? 'true'
                            : 'false'
                        }
                      />
                      {deleteForm.formState.errors.confirmation && (
                        <p className="text-sm text-red-500 mt-1">
                          {deleteForm.formState.errors.confirmation.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-red-50/50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/30">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    {isLoading && activeTab === 'danger' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
