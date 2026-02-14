import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { NavigationComponent } from '../../../components/shared/NavigationComponent';

describe('NavigationComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when user is not authenticated', () => {
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
      <MemoryRouter initialEntries={['/my-books']}>
        <NavigationComponent />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders navigation for authenticated non-admin users', () => {
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
      <MemoryRouter initialEntries={['/my-books']}>
        <NavigationComponent />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /all books/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /search books/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /my collection/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /authors/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('does not render regular navigation on admin pages for admin users', () => {
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
        <NavigationComponent />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
