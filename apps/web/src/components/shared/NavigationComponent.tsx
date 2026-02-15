import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/services/authService';
import { BookOpen, Bookmark, Search, Settings, Users } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
  current: boolean;
}

export function NavigationComponent() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isAdminPage = location.pathname.startsWith('/admin');

  // Compute navigation items based on current path and user role
  const navigation = useMemo<NavigationItem[]>(() => {
    const currentPath = location.pathname;

    const baseItems: NavigationItem[] = [
      {
        name: 'All Books',
        href: '/my-books',
        icon: <BookOpen className="h-5 w-5" />,
        current:
          currentPath === '/my-books' ||
          (currentPath.startsWith('/my-books') &&
            !currentPath.startsWith('/my-books/')),
      },
      {
        name: 'Search Books',
        href: '/my-books/search',
        icon: <Search className="h-5 w-5" />,
        current: currentPath.startsWith('/my-books/search'),
      },
      {
        name: 'My Collection',
        href: '/my-books/collection',
        icon: <Bookmark className="h-5 w-5" />,
        current: currentPath.startsWith('/my-books/collection'),
      },
      {
        name: 'Authors',
        href: '/my-authors',
        icon: <Users className="h-5 w-5" />,
        current: currentPath.startsWith('/my-authors'),
      },
      {
        name: 'Settings',
        href: '/profile',
        icon: <Settings className="h-5 w-5" />,
        current: currentPath.startsWith('/profile'),
      },
    ];

    // Add admin dashboard link for admin users
    if (isAdmin) {
      baseItems.push({
        name: 'Admin Dashboard',
        href: '/admin',
        icon: <Settings className="h-5 w-5 text-red-600" />,
        current: currentPath.startsWith('/admin'),
      });
    }

    return baseItems;
  }, [location.pathname, isAdmin]);

  // Don't render the regular navigation on admin pages
  // Also don't render if user is not authenticated
  if (!isAuthenticated || (isAdmin && isAdminPage)) {
    return null;
  }

  return (
    <nav
      role="navigation"
      className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-40"
    >
      <div className="container px-4 lg:px-8 mx-auto">
        {/* Desktop Navigation - No logo, just the navigation items */}
        <div className="flex items-center justify-center py-2">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex flex-row items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              {navigation.map((item) => {
                const isAdminLink = item.href === '/admin';
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-2 whitespace-nowrap
                      ${
                        item.current
                          ? isAdminLink
                            ? 'text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md'
                            : 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md'
                          : isAdminLink
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'
                      }
                    `}
                  >
                    <span
                      className={
                        item.current
                          ? 'text-white/90'
                          : isAdminLink
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-gray-400 dark:text-gray-500'
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
