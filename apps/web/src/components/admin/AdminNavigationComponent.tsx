import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/services/authService';
import {
  BarChart3,
  BookCopy,
  BookOpen,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserCog,
  Users,
} from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
  current: boolean;
}

export function AdminNavigationComponent() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [navigation, setNavigation] = useState<NavigationItem[]>([
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      current: false,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <UserCog className="h-5 w-5" />,
      current: false,
    },
    {
      name: 'Books',
      href: '/admin/books',
      icon: <BookCopy className="h-5 w-5" />,
      current: false,
    },
    {
      name: 'Authors',
      href: '/admin/authors',
      icon: <Users className="h-5 w-5" />,
      current: false,
    },
    {
      name: 'Reviews',
      href: '/admin/reviews',
      icon: <MessageSquare className="h-5 w-5" />,
      current: false,
    },
    {
      name: 'Requests',
      href: '/admin/requests',
      icon: <BarChart3 className="h-5 w-5" />,
      current: false,
    },
    {
      name: 'Loans',
      href: '/admin/loans',
      icon: <Clock className="h-5 w-5" />,
      current: false,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      current: false,
    },
  ]);

  // Set current navigation item based on the current path
  useEffect(() => {
    const currentPath = location.pathname;

    setNavigation((prevNavigation) =>
      prevNavigation.map((item) => {
        // For dashboard, only match exact path
        if (item.href === '/admin') {
          return {
            ...item,
            current: currentPath === '/admin' || currentPath === '/admin/',
          };
        }
        // For other items, match if path starts with the href
        return {
          ...item,
          current: currentPath.startsWith(item.href),
        };
      }),
    );
  }, [location.pathname]);

  // Show admin navigation only if user is authenticated and has admin role
  // Also only show on admin pages
  if (!isAuthenticated || !isAdmin || !location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      role="navigation"
      className="sticky top-16 z-40 border-b border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 shadow-sm dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:border-red-900/30"
    >
      <div className="container px-6 py-3 mx-auto">
        {/* Admin Navigation */}
        <div className="flex items-center justify-between gap-4">
          {/* Admin Panel Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-md shadow-red-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>

          {/* Navigation Links */}
          <div className="overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex flex-row items-center gap-1 bg-white/60 dark:bg-gray-800/60 rounded-xl px-2 py-1.5 backdrop-blur-sm border border-red-100 dark:border-red-900/30">
              {navigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-2 whitespace-nowrap
                      ${
                        item.current
                          ? 'text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md shadow-red-500/25'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400'
                      }
                    `}
                  >
                    {item.icon}
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
