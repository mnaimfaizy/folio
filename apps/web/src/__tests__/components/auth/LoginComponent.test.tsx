import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { LoginComponent } from '../../../components/auth/LoginComponent';

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Keep GuestGuard out of scope for this test
vi.mock('../../../components/auth/guards/GuestGuard', () => ({
  GuestGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LoginComponent', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
      login: mockLogin,
      signup: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: mockClearError,
      checkAuth: vi.fn(),
    } as any);
  });

  const renderComponent = (initialEntries: string[] = ['/login']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <LoginComponent />
      </MemoryRouter>,
    );
  };

  it('renders the login form', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: /sign in to your account/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^sign in$/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /forgot password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /create one now/i }),
    ).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits credentials via auth context and navigates on success', async () => {
    mockLogin.mockResolvedValue({ success: true });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/books');
    });
  });

  it('navigates to returnUrl on success when provided', async () => {
    mockLogin.mockResolvedValue({ success: true });
    renderComponent(['/login?returnUrl=%2Fmy-books%2Fcollection']);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/books');
    });
  });

  it('shows loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: true,
      error: null,
      login: mockLogin,
      signup: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: mockClearError,
      checkAuth: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText(/signing in\.{3}/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('shows auth error message', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: 'Invalid email or password',
      login: mockLogin,
      signup: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: mockClearError,
      checkAuth: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });
});
