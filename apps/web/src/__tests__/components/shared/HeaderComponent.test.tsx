import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { HeaderComponent } from '../../../components/shared/HeaderComponent';

// Make dropdown-menu deterministic for tests
vi.mock('../../../components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, asChild }: any) =>
    asChild ? (
      <div>{children}</div>
    ) : (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div />,
}));

describe('HeaderComponent', () => {
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

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <HeaderComponent />
      </MemoryRouter>,
    );

  it('renders brand and navigation links for guests', () => {
    renderComponent();

    expect(
      screen.getByRole('link', { name: /folio\s*library/i }),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole('link', { name: 'Home' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'Books' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'About' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'Contact' }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole('link', { name: 'Login' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'Sign Up' }).length,
    ).toBeGreaterThan(0);
  });

  it('shows My Books and logout option when authenticated', () => {
    const mockLogout = vi.fn(async () => undefined);
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      },
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    } as any);

    renderComponent();

    expect(
      screen.getAllByRole('link', { name: 'My Books' }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);

    const logoutButtons = screen.getAllByRole('button', { name: /logout/i });
    fireEvent.click(logoutButtons[0]);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('toggles mobile menu button label', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(button);
    expect(
      screen.getByRole('button', { name: 'Close menu' }),
    ).toBeInTheDocument();
  });
});
