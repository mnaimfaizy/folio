import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '../../../../components/auth/guards/AuthGuard';

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

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: 'User', email: 'u@u.com', role: 'USER' },
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthGuard>
          <div data-testid="protected">Protected</div>
        </AuthGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to login with returnUrl when not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={['/protected?x=1']}>
        <AuthGuard>
          <div>Protected</div>
        </AuthGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login?returnUrl=%2Fprotected%3Fx%3D1',
        { replace: true },
      );
    });
  });

  it('renders fallback while auth is initializing', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AuthGuard fallback={<div data-testid="fallback">Loading</div>}>
          <div>Protected</div>
        </AuthGuard>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
