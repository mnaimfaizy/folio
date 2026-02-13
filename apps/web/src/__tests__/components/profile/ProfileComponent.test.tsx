import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { ProfileComponent } from '../../../components/profile/ProfileComponent';

// Mock the AuthGuard component to avoid testing its redirect logic here
vi.mock('../../../components/auth/guards/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ProfileComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    } as any);
  });

  it('renders the profile page header', () => {
    render(
      <MemoryRouter>
        <ProfileComponent />
      </MemoryRouter>,
    );

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
  });

  it('renders user profile information', () => {
    render(
      <MemoryRouter>
        <ProfileComponent />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email Address')).toHaveValue(
      'test@example.com',
    );

    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });
});
