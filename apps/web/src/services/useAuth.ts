// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-ui\src\services\useAuth.ts
import { useState, useEffect } from "react";
import AuthService from "./authService";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    AuthService.isAuthenticated()
  );
  const [user, setUser] = useState(AuthService.getCurrentUser());

  // Update authentication status when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
      setUser(AuthService.getCurrentUser());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    isAuthenticated,
    user,
    login: AuthService.login,
    logout: AuthService.logout,
    signup: AuthService.signup,
  };
}

export default useAuth;
