import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { AdminGuard } from '../../../../components/auth/guards/AdminGuard';

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

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login with returnUrl', async () => {
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
      <MemoryRouter initialEntries={['/admin/users']}>
        <AdminGuard>
          <div>Admin content</div>
        </AdminGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login?returnUrl=%2Fadmin%2Fusers',
        { replace: true },
      );
    });
  });

  it('shows access denied for authenticated non-admin users', async () => {
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
      <MemoryRouter initialEntries={['/admin/users']}>
        <AdminGuard>
          <div data-testid="admin">Admin content</div>
        </AdminGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    const goHome = screen.getByRole('button', { name: /go to home/i });
    fireEvent.click(goHome);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders children for admin users', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: 'Admin', email: 'a@a.com', role: 'ADMIN' },
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
      <MemoryRouter initialEntries={['/admin/users']}>
        <AdminGuard>
          <div data-testid="admin">Admin content</div>
        </AdminGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
