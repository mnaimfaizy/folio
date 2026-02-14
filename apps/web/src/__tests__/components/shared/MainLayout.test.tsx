import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '../../../components/shared/MainLayout';

vi.mock('../../../components/shared/HeaderComponent', () => ({
  HeaderComponent: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../../components/shared/FooterComponent', () => ({
  FooterComponent: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../../../components/shared/NavigationComponent', () => ({
  NavigationComponent: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock('../../../components/admin/AdminNavigationComponent', () => ({
  AdminNavigationComponent: () => (
    <div data-testid="admin-navigation">Admin Navigation</div>
  ),
}));

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  const renderWithRoute = (route: string) =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <MainLayout>
          <div data-testid="content">Content</div>
        </MainLayout>
      </MemoryRouter>,
    );

  it('renders header, footer, and children', () => {
    renderWithRoute('/');

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('does not render navigation when unauthenticated', () => {
    renderWithRoute('/');
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
  });

  it('renders navigation when authenticated on non-admin pages', () => {
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

    renderWithRoute('/books');
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-navigation')).not.toBeInTheDocument();
  });

  it('renders admin navigation on admin pages', () => {
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

    renderWithRoute('/admin/users');
    expect(screen.getByTestId('admin-navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
  });
});
