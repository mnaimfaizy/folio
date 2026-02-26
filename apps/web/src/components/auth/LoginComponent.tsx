import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, BookOpen, ArrowRight, Mail, Lock } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GuestGuard } from './guards/GuestGuard';
import { loginSchema, type LoginFormValues } from './authSchemas';

export function LoginComponent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginFormValues) => {
    const result = await login(data);

    if (result.success) {
      // Check for return URL in query params
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl));
      } else {
        navigate('/books');
      }
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen flex">
        {/* Left side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-soft"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-soft delay-500"></div>
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Folio<span className="text-blue-400">Library</span>
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome back to your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                reading journey
              </span>
            </h1>

            <p className="text-slate-300 text-lg max-w-md">
              Access your personalized library, continue where you left off, and
              discover new books tailored to your interests.
            </p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-slate-400 text-sm">Books Available</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-bold text-white">2.5K+</p>
                <p className="text-slate-400 text-sm">Active Readers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-white">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2.5 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Folio<span className="text-blue-600">Library</span>
              </span>
            </div>

            <Card className="border-0 shadow-soft bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Sign in to your account
                </h2>
                <p className="text-gray-500">
                  Enter your credentials to access your library
                </p>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-5">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-red-600 text-xs">!</span>
                      </div>
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium"
                    >
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        placeholder="you@example.com"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        {...register('email')}
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-gray-700 font-medium"
                      >
                        Password
                      </Label>
                      <Link
                        to="/reset-password"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        {...register('password')}
                        aria-invalid={errors.password ? 'true' : 'false'}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col pt-2">
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0 text-base font-medium group"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Don't have an account?{' '}
                      <Link
                        to="/signup"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Create one now
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
