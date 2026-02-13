import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { SignUpComponent } from '../../../components/auth/SignUpComponent';

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

vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('SignUpComponent', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
      login: vi.fn(),
      signup: mockSignup,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    } as any);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/signup']}>
        <SignUpComponent />
      </MemoryRouter>,
    );
  };

  it('renders the signup form', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: /create your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('shows validation errors for empty submission', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/name must be at least 2 characters/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it('submits signup and redirects to login on success', async () => {
    mockSignup.mockResolvedValue({ success: true });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Account created successfully!',
      );
    });
    expect(screen.getByTestId('success-message')).toHaveTextContent(
      /please check your email to verify/i,
    );

    // The component redirects after a 2s timeout
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      },
      { timeout: 3000 },
    );
  });

  it('shows toast error on failure', async () => {
    mockSignup.mockResolvedValue({ success: false, error: 'Nope' });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Nope');
    });
  });
});
