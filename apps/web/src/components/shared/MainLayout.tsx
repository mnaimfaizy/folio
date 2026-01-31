import { useAppSelector } from "@/store/hooks";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AdminNavigationComponent } from "../admin/AdminNavigationComponent";
import { FooterComponent } from "./FooterComponent";
import { HeaderComponent } from "./HeaderComponent";
import { NavigationComponent } from "./NavigationComponent";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderComponent />

      {/* Show admin navigation on admin pages */}
      {isAdminPage && <AdminNavigationComponent />}

      {/* Show regular navigation on non-admin pages */}
      {!isAdminPage && isAuthenticated && <NavigationComponent />}

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-screen-xl">
          {children}
        </div>
      </main>
      <FooterComponent />
    </div>
  );
}
