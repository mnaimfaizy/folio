import { useAppSelector } from "@/store/hooks";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * A component that prevents authenticated users from accessing guest pages like login/signup
 * If user is authenticated, it will redirect to the books page
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to books page
      navigate("/books");
    }
  }, [isAuthenticated, navigate]);

  return <>{children}</>;
}
