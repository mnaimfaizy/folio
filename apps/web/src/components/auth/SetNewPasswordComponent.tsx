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
import AuthService from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  setNewPasswordSchema,
  type SetNewPasswordFormValues,
} from './authSchemas';

export function SetNewPasswordComponent() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Function to validate the token
  const validateToken = async (tokenToValidate: string) => {
    try {
      // In a real app, you might have an API endpoint to validate the token
      // For now, we'll validate that it exists and isn't empty
      if (!tokenToValidate || tokenToValidate.trim() === '') {
        throw new Error('Invalid token');
      }
      setTokenValid(true);
      return true;
    } catch (err) {
      console.error('Token validation error:', err);
      setError(
        'Invalid or expired reset token. Please request a new password reset.',
      );
      setTokenValid(false);
      return false;
    }
  };

  // Extract and validate token on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');

    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setError('No reset token provided. Please request a new password reset.');
      setTokenValid(false);
    }
  }, []);

  const onSubmit = async (data: SetNewPasswordFormValues) => {
    setError('');

    if (!token) {
      setError(
        'No reset token available. Please request a new password reset.',
      );
      return;
    }

    try {
      await AuthService.resetPassword(token, data.password);
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr?.response?.data?.message ||
          'Failed to reset password. Please try again or request a new reset link.',
      );
    }
  };

  if (tokenValid === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Card className="w-[400px] p-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2">Validating your reset token...</p>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl">Password Reset Failed</CardTitle>
            <CardDescription>
              We couldn't validate your reset token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              className="w-full"
              onClick={() => navigate('/reset-password')}
            >
              Request New Reset Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Please enter and confirm your new password
          </CardDescription>
        </CardHeader>
        {isSuccess ? (
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Password successfully reset! Redirecting to login...
              </AlertDescription>
            </Alert>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <CardContent>
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    {...register('password')}
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    {...register('confirmPassword')}
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
