import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Menu, User, X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

export function HeaderComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    // Optional: navigate to home or login page after logout
    navigate("/");
  };

  return (
    <header className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-bold">Library Management</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link to="/books" className="hover:text-blue-400 transition-colors">
              Books
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-books"
                className="hover:text-blue-400 transition-colors"
              >
                My Books
              </Link>
            )}
            <Link to="/about" className="hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link
              to="/contact"
              className="hover:text-blue-400 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">
                  {user?.name || "User"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Account Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/profile" className="flex w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/my-books" className="flex w-full">
                        My Books
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/settings" className="flex w-full">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700 mt-3">
            <div className="md:hidden py-4 space-y-4">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
                <Link
                  to="/books"
                  className="hover:text-blue-400 transition-colors"
                >
                  Books
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/my-books"
                    className="hover:text-blue-400 transition-colors"
                  >
                    My Books
                  </Link>
                )}
                <Link
                  to="/about"
                  className="hover:text-blue-400 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-blue-400 transition-colors"
                >
                  Contact
                </Link>
              </nav>
              <div className="pt-4 border-t border-slate-700">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-2 py-2">
                      <User className="h-4 w-4" />
                      <span>{user?.name || "User"}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="block py-2 hover:text-blue-400 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-books"
                      className="block py-2 hover:text-blue-400 transition-colors"
                    >
                      My Books
                    </Link>
                    <Link
                      to="/settings"
                      className="block py-2 hover:text-blue-400 transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block py-2 hover:text-blue-400 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
