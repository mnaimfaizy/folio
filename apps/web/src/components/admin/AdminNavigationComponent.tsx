import { UserRole } from "@/services/authService";
import { useAppSelector } from "@/store/hooks";
import {
  BarChart3,
  BookCopy,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
  current: boolean;
}

export function AdminNavigationComponent() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [navigation, setNavigation] = useState<NavigationItem[]>([
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <UserCog className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Books",
      href: "/admin/books",
      icon: <BookCopy className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Authors",
      href: "/admin/authors",
      icon: <Users className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Reviews",
      href: "/admin/reviews",
      icon: <MessageSquare className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      current: false,
    },
  ]);

  // Set current navigation item based on the current path
  useEffect(() => {
    const currentPath = location.pathname;

    setNavigation(
      navigation.map((item) => ({
        ...item,
        current:
          currentPath === item.href ||
          (item.href !== "/" && currentPath.startsWith(item.href)),
      }))
    );
  }, []);

  // Show admin navigation only if user is authenticated and has admin role
  // Also only show on admin pages
  if (!isAuthenticated || !isAdmin || !location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav role="navigation" className="bg-gray-100 shadow dark:bg-gray-900">
      <div className="container px-6 py-2 mx-auto">
        {/* Admin Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-red-600" />
            <span className="ml-2 text-lg font-semibold text-red-600">
              Admin Panel
            </span>
          </div>
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
                          ? "text-white bg-red-600"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
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
