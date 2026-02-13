import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { GuestGuard } from '../../../../components/auth/guards/GuestGuard';

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

describe('GuestGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children for guests (not authenticated)', () => {
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
      <MemoryRouter initialEntries={['/login']}>
        <GuestGuard>
          <div data-testid="guest">Guest content</div>
        </GuestGuard>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('guest')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects authenticated users to default route', async () => {
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
      <MemoryRouter initialEntries={['/login']}>
        <GuestGuard>
          <div>Guest content</div>
        </GuestGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/books', { replace: true });
    });
  });

  it('redirects authenticated users to returnUrl when present', async () => {
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
      <MemoryRouter initialEntries={['/login?returnUrl=%2Fmy-books']}>
        <GuestGuard>
          <div>Guest content</div>
        </GuestGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/my-books', { replace: true });
    });
  });
});
