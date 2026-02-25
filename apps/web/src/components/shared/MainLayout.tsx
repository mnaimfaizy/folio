import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminNavigationComponent } from '../admin/AdminNavigationComponent';
import { FooterComponent } from './FooterComponent';
import { HeaderComponent } from './HeaderComponent';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderComponent />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Show admin navigation on admin pages */}
      {isAdminPage && <AdminNavigationComponent />}

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">{children}</main>
      <FooterComponent />
    </div>
  );
}
