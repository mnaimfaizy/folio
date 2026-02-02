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
        href: '/authors',
        icon: <Users className="h-5 w-5" />,
        current: currentPath.startsWith('/authors'),
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
    <nav role="navigation" className="bg-white shadow dark:bg-gray-800">
      <div className="container px-6 py-2 mx-auto">
        {/* Desktop Navigation - No logo, just the navigation items */}
        <div className="flex items-center justify-center">
          <div className="overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex flex-row items-center space-x-1">
              {navigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md flex items-center space-x-1 whitespace-nowrap
                      ${
                        item.current
                          ? 'text-white bg-blue-600'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      ${
                        item.href === '/admin'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : ''
                      }
                    `}
                  >
                    {item.icon}
                    <span className="ml-1">{item.name}</span>
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
