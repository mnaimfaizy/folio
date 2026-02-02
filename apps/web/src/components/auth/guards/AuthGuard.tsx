import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * A component that guards routes requiring authentication
 * Features:
 * - Redirects to login if user is not authenticated
 * - Shows loading state while checking authentication
 * - Preserves the intended destination for post-login redirect
 * - Supports custom fallback content
 */
export function AuthGuard({
  children,
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Wait for auth to be initialized before checking
    if (!isInitialized) {
      return;
    }

    setHasCheckedAuth(true);

    if (!isAuthenticated) {
      // Store the intended destination for post-login redirect
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?returnUrl=${returnUrl}`, { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate, location, redirectTo]);

  // Show loading state while initializing auth
  if (!isInitialized || isLoading || !hasCheckedAuth) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - return null while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Export a typed version for route configuration
export default AuthGuard;
