import { UserRole } from "@/services/authService";
import { useAppSelector } from "@/store/hooks";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that guards routes requiring admin privileges
 * If user is not authenticated or not an admin, it will redirect
 */
export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
      navigate("/login");
    } else if (!isAdmin) {
      // Redirect to home if authenticated but not admin
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Show fallback or nothing while checking authentication and role
  if (!isAuthenticated || !isAdmin) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
