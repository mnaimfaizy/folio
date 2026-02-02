import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

interface GuestGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * A component that prevents authenticated users from accessing guest pages like login/signup
 * Features:
 * - Redirects authenticated users away from guest-only pages
 * - Supports return URL for post-login redirect
 * - Shows loading state while checking authentication
 */
export function GuestGuard({
  children,
  fallback,
  redirectTo = '/books',
}: GuestGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (isAuthenticated) {
      // Check for return URL in query params
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        // Decode and navigate to the return URL
        navigate(decodeURIComponent(returnUrl), { replace: true });
      } else {
        // Default redirect
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isAuthenticated, isInitialized, navigate, searchParams, redirectTo]);

  // Show loading state while initializing auth
  if (!isInitialized || isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, return null while redirecting
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default GuestGuard;
