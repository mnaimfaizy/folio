import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
  Navigate,
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
import { BookDetailsComponent } from './components/books/BookDetailsComponent';
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
import { UserCollectionPage } from './components/collection/UserCollectionPage';
import { RequestBookPage } from './components/books/RequestBookPage';
import { MyLoansPage } from './components/loans/MyLoansPage';

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
import { EditBookComponent } from '@/components/admin/books/EditBook';
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
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
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
function AppRoutes() {
  const { settings } = useSettings();
  const isSingleUserProfile = settings.usage_profile === 'single_user';
  const isLibraryProfile = settings.usage_profile === 'library';

  return (
    <MainLayout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPageComponent />} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/signup" element={<SignUpComponent />} />
        <Route path="/reset-password" element={<ResetPasswordComponent />} />
        <Route path="/set-new-password" element={<SetNewPasswordComponent />} />
        <Route path="/verify-email" element={<EmailVerificationComponent />} />

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
        <Route path="/authors/:id" element={<PublicAuthorDetailsComponent />} />

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
          path="/my-collection"
          element={
            <AuthGuard>
              {!isLibraryProfile ? (
                <Navigate to="/" replace />
              ) : (
                <UserCollectionPage />
              )}
            </AuthGuard>
          }
        />
        <Route
          path="/my-loans"
          element={
            <AuthGuard>
              {!isLibraryProfile ? (
                <Navigate to="/" replace />
              ) : (
                <MyLoansPage />
              )}
            </AuthGuard>
          }
        />
        <Route
          path="/request-book"
          element={
            <AuthGuard>
              {!isLibraryProfile ? (
                <Navigate to="/" replace />
              ) : (
                <RequestBookPage />
              )}
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
              {isSingleUserProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <UsersList />
              )}
            </AdminGuard>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <AdminGuard>
              {isSingleUserProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <CreateUser />
              )}
            </AdminGuard>
          }
        />
        <Route
          path="/admin/users/edit/:id"
          element={
            <AdminGuard>
              {isSingleUserProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <EditUser />
              )}
            </AdminGuard>
          }
        />
        <Route
          path="/admin/users/view/:id"
          element={
            <AdminGuard>
              {isSingleUserProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <ViewUser />
              )}
            </AdminGuard>
          }
        />
        <Route
          path="/admin/users/password/:id"
          element={
            <AdminGuard>
              {isSingleUserProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <ChangeUserPassword />
              )}
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
              {isSingleUserProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <ReviewsList />
              )}
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
              {!isLibraryProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <BookRequestsPage />
              )}
            </AdminGuard>
          }
        />

        <Route
          path="/admin/loans"
          element={
            <AdminGuard>
              {!isLibraryProfile ? (
                <Navigate to="/admin" replace />
              ) : (
                <LoansPage />
              )}
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
  );
}

function AppContent() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NavigationRegistrar />
        <AppRoutes />
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
