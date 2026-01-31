import { useAppSelector } from "@/store/hooks";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that guards routes requiring authentication
 * If user is not authenticated, it will redirect to login page
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Show fallback or nothing while checking authentication
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
