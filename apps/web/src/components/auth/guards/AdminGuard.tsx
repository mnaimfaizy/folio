import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/services/authService';
import { Loader2, ShieldAlert } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * A component that guards routes requiring admin privileges
 * Features:
 * - Redirects to login if user is not authenticated
 * - Shows access denied message if authenticated but not admin
 * - Shows loading state while checking authentication
 * - Supports custom fallback content
 */
export function AdminGuard({
  children,
  fallback,
  redirectTo = '/login',
  showAccessDenied = true,
}: AdminGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

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
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - return null while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this area. Admin privileges
              are required.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}

// Export a typed version for route configuration
export default AdminGuard;
