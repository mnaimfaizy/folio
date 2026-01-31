import { UserRole } from "@/services/authService";
import { useAppSelector } from "@/store/hooks";
import { BookOpen, Bookmark, Search, Settings, Users } from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
  current: boolean;
}

export function NavigationComponent() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isAdminPage = location.pathname.startsWith("/admin");

  const [navigation, setNavigation] = useState<NavigationItem[]>([
    {
      name: "All Books",
      href: "/my-books",
      icon: <BookOpen className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Search Books",
      href: "/my-books/search",
      icon: <Search className="h-5 w-5" />,
      current: false,
    },
    {
      name: "My Collection",
      href: "/my-books/collection",
      icon: <Bookmark className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Authors",
      href: "/authors",
      icon: <Users className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Settings",
      href: "/profile",
      icon: <Settings className="h-5 w-5" />,
      current: false,
    },
  ]);

  // Set current navigation item based on the current path
  useEffect(() => {
    const currentPath = location.pathname;

    setNavigation((prevNavigation) =>
      prevNavigation.map((item) => ({
        ...item,
        current:
          currentPath === item.href ||
          (item.href !== "/" && currentPath.startsWith(item.href)),
      }))
    );
  }, [location.pathname, location.search]);

  // Add an admin dashboard link for admin users
  useEffect(() => {
    if (isAdmin && !navigation.some((item) => item.href === "/admin")) {
      setNavigation((prev) => [
        ...prev,
        {
          name: "Admin Dashboard",
          href: "/admin",
          icon: <Settings className="h-5 w-5 text-red-600" />,
          current: false,
        },
      ]);
    }
  }, [isAdmin, navigation]);

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
                          ? "text-white bg-blue-600"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }
                      ${
                        item.href === "/admin"
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : ""
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
