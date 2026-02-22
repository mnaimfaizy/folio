import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
} from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPageComponent } from './components/landing/LandingPageComponent';
import { LoginComponent } from './components/auth/LoginComponent';
import { SignUpComponent } from './components/auth/SignUpComponent';
import { ResetPasswordComponent } from './components/auth/ResetPasswordComponent';
import { ChangePasswordComponent } from './components/auth/ChangePasswordComponent';
import { EmailVerificationComponent } from './components/auth/EmailVerificationComponent';
import { SetNewPasswordComponent } from './components/auth/SetNewPasswordComponent';
import { PublicBooksComponent } from './components/books/PublicBooksComponent';
import { PublicAuthorsComponent } from './components/authors/PublicAuthorsComponent';
import { PublicAuthorDetailsComponent } from './components/authors/PublicAuthorDetailsComponent';
import { BooksComponent } from './components/books/BooksComponent';
import { CreateBookComponent } from './components/books/CreateBookComponent';
import { EditBookComponent } from './components/books/EditBookComponent';
import { BookDetailsComponent } from './components/books/BookDetailsComponent';
import { AuthorsComponent } from './components/books/AuthorsComponent';
import { AuthorsListComponent } from './components/books/AuthorsListComponent';
import { BookSearchComponent } from './components/books/search/BookSearchComponent';
import { ProfileComponent } from './components/profile/ProfileComponent';
import { MainLayout } from './components/shared/MainLayout';
import { AuthGuard } from './components/auth/guards/AuthGuard';
import { registerNavigate } from './lib/navigation';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
// New page imports
import { AboutPage } from './components/about/AboutPage';
import { ContactPage } from './components/contact/ContactPage';
// User Collection Page import
import { UserCollectionPage } from './components/books/UserCollectionPage';
import { RequestBookPage } from './components/books/RequestBookPage';
import { MyLoansPage } from './components/books/MyLoansPage';
// Admin components
import { AdminDashboard } from '@/components/admin/AdminDashboard';
// Admin User components
import { UsersList } from '@/components/admin/users/UsersList';
import { CreateUser } from '@/components/admin/users/CreateUser';
import { EditUser } from '@/components/admin/users/EditUser';
import { ViewUser } from '@/components/admin/users/ViewUser';
import { ChangeUserPassword } from '@/components/admin/users/ChangeUserPassword';
// Admin Book components
import { BooksList } from '@/components/admin/books/BooksList';
import { ViewBook } from '@/components/admin/books/ViewBook';
import { CreateAdminBookComponent } from '@/components/admin/books/CreateAdminBookComponent';
// Admin Author components
import { AuthorsList } from '@/components/admin/authors/AuthorsList';
import { ViewAuthor } from '@/components/admin/authors/ViewAuthor';
import { CreateAuthor } from '@/components/admin/authors/CreateAuthor';
import { EditAuthor } from '@/components/admin/authors/EditAuthor';
// Admin Review components
import { ReviewsList } from '@/components/admin/reviews/ReviewsList';
import { AdminGuard } from '@/components/auth/guards/AdminGuard';
// Admin Settings components
import { SettingsPage } from '@/components/admin/settings/SettingsPage';
import { SettingsProvider } from '@/context/SettingsContext';
import { BookRequestsPage } from '@/components/admin/requests/BookRequestsPage';
import { LoansPage } from '@/components/admin/loans/LoansPage';

// Wrapper component to register the navigation function
function NavigationRegistrar() {
  const navigate = useNavigate();

  useEffect(() => {
    registerNavigate(navigate);
  }, [navigate]);

  return null;
}

// Main app content wrapped with AuthProvider and SettingsProvider
function AppContent() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NavigationRegistrar />
        <MainLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPageComponent />} />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/signup" element={<SignUpComponent />} />
            <Route
              path="/reset-password"
              element={<ResetPasswordComponent />}
            />
            <Route
              path="/set-new-password"
              element={<SetNewPasswordComponent />}
            />
            <Route
              path="/verify-email"
              element={<EmailVerificationComponent />}
            />

            {/* New About and Contact routes */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Public books route */}
            <Route path="/books" element={<PublicBooksComponent />} />
            {/* Public route for book details */}
            <Route path="/books/:bookId" element={<BookDetailsComponent />} />

            {/* Public authors route */}
            <Route path="/authors" element={<PublicAuthorsComponent />} />
            {/* Public route for author details */}
            <Route
              path="/authors/:id"
              element={<PublicAuthorDetailsComponent />}
            />

            {/* Protected routes */}
            <Route
              path="/change-password"
              element={
                <AuthGuard>
                  <ChangePasswordComponent />
                </AuthGuard>
              }
            />
            <Route
              path="/my-books"
              element={
                <AuthGuard>
                  <BooksComponent />
                </AuthGuard>
              }
            />
            <Route
              path="/my-books/search"
              element={
                <AuthGuard>
                  <BookSearchComponent />
                </AuthGuard>
              }
            />
            <Route
              path="/my-books/collection"
              element={
                <AuthGuard>
                  <UserCollectionPage />
                </AuthGuard>
              }
            />
            <Route
              path="/my-books/loans"
              element={
                <AuthGuard>
                  <MyLoansPage />
                </AuthGuard>
              }
            />
            <Route
              path="/request-book"
              element={
                <AuthGuard>
                  <RequestBookPage />
                </AuthGuard>
              }
            />
            <Route
              path="/books/create"
              element={
                <AuthGuard>
                  <CreateBookComponent />
                </AuthGuard>
              }
            />
            <Route
              path="/books/edit/:bookId"
              element={
                <AuthGuard>
                  <EditBookComponent />
                </AuthGuard>
              }
            />
            {/* Authors routes */}
            <Route
              path="/my-authors"
              element={
                <AuthGuard>
                  <AuthorsListComponent />
                </AuthGuard>
              }
            />
            <Route
              path="/my-authors/:authorName"
              element={
                <AuthGuard>
                  <AuthorsComponent />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfileComponent />
                </AuthGuard>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />

            {/* Admin User routes */}
            <Route
              path="/admin/users"
              element={
                <AdminGuard>
                  <UsersList />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/users/create"
              element={
                <AdminGuard>
                  <CreateUser />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/users/edit/:id"
              element={
                <AdminGuard>
                  <EditUser />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/users/view/:id"
              element={
                <AdminGuard>
                  <ViewUser />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/users/password/:id"
              element={
                <AdminGuard>
                  <ChangeUserPassword />
                </AdminGuard>
              }
            />

            {/* Admin Book routes */}
            <Route
              path="/admin/books"
              element={
                <AdminGuard>
                  <BooksList />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/books/create"
              element={
                <AdminGuard>
                  <CreateAdminBookComponent />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/books/edit/:bookId"
              element={
                <AdminGuard>
                  <EditBookComponent />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/books/view/:bookId"
              element={
                <AdminGuard>
                  <ViewBook />
                </AdminGuard>
              }
            />

            {/* Admin Author routes */}
            <Route
              path="/admin/authors"
              element={
                <AdminGuard>
                  <AuthorsList />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/authors/create"
              element={
                <AdminGuard>
                  <CreateAuthor />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/authors/edit/:id"
              element={
                <AdminGuard>
                  <EditAuthor />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/authors/view/:id"
              element={
                <AdminGuard>
                  <ViewAuthor />
                </AdminGuard>
              }
            />

            {/* Admin Review routes */}
            <Route
              path="/admin/reviews"
              element={
                <AdminGuard>
                  <ReviewsList />
                </AdminGuard>
              }
            />

            {/* Admin Settings route */}
            <Route
              path="/admin/settings"
              element={
                <AdminGuard>
                  <SettingsPage />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/requests"
              element={
                <AdminGuard>
                  <BookRequestsPage />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/loans"
              element={
                <AdminGuard>
                  <LoansPage />
                </AdminGuard>
              }
            />

            {/* Fallback for unmatched routes */}
            <Route
              path="*"
              element={
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                  <p className="mb-4">
                    Sorry, the page you are looking for doesn't exist.
                  </p>
                  <Link
                    to="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
                  >
                    Return to Home
                  </Link>
                </div>
              }
            />
          </Routes>
          <Toaster />
        </MainLayout>
      </SettingsProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
